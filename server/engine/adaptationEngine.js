import Session from '../models/Session.js';
import Adaptation from '../models/Adaptation.js';
import { RULES, STEP_ADAPTIVE_CONTENT } from './rules.js';

/**
 * Evaluate incoming interaction event against session metrics and execute adaptation rules.
 * @param {Object} session - The current session Mongoose document
 * @param {Object} event - The current incoming interaction event data
 * @returns {Promise<Object>} Adaptation directives for the client
 */
export async function evaluateAdaptation(session, event) {
  const isAdaptiveMode = session.mode === 'adaptive';
  const stepIndex = event.stepIndex || session.currentStep;
  
  // Initialize step metric if not present
  if (!session.stepMetrics) {
    session.stepMetrics = new Map();
  }
  
  const stepKey = String(stepIndex);
  let metric = session.stepMetrics.get(stepKey) || {
    timeSpentMs: 0,
    visitCount: 1,
    errorsCount: 0,
    quizCompleted: false,
    lastInteractionAt: new Date(),
    idleExceeded: false,
    strugglingDetected: false,
    fastTrackOffered: false,
  };

  // Update session step metrics based on event
  if (event.timeOnStepMs) {
    metric.timeSpentMs = Math.max(metric.timeSpentMs, event.timeOnStepMs);
  }
  if (event.eventType === 'STEP_NAVIGATE' || event.eventType === 'STEP_VIEW') {
    if (event.payload?.isRevisit) {
      metric.visitCount = (metric.visitCount || 1) + 1;
    }
  }
  if (event.eventType === 'QUIZ_FAILURE') {
    metric.errorsCount = (metric.errorsCount || 0) + 1;
  }
  if (event.eventType === 'QUIZ_SUCCESS') {
    metric.quizCompleted = true;
  }
  metric.lastInteractionAt = new Date();

  const triggeredAdaptations = [];

  // ==========================================
  // RULE 1: IDLE / HIGH LATENCY THRESHOLD
  // ==========================================
  const idleMs = event.idleDurationMs || (event.eventType === 'IDLE_TIMEOUT' ? event.payload?.idleTimeMs : 0);
  const isIdleExceeded = (idleMs >= RULES.IDLE_HINT.idleThresholdMs) || (event.eventType === 'IDLE_TIMEOUT');
  
  if (isIdleExceeded && !metric.idleExceeded) {
    metric.idleExceeded = true;
    const rule = RULES.IDLE_HINT;
    const conditionDesc = rule.getDescription(stepIndex, Math.round(idleMs / 1000));
    
    const adaptationRecord = new Adaptation({
      sessionId: session.sessionId,
      ruleId: rule.id,
      ruleName: rule.name,
      stepIndex,
      triggerCondition: conditionDesc,
      actionApplied: rule.action,
      adaptationPayload: {
        hint: STEP_ADAPTIVE_CONTENT[stepIndex]?.hint || 'Review the core definition above.',
        reason: 'Prolonged inactivity detected.',
      },
      status: isAdaptiveMode ? 'ACTIVE' : 'TRIGGERED',
      evaluatedInMode: session.mode,
    });
    
    await adaptationRecord.save();
    if (isAdaptiveMode) {
      triggeredAdaptations.push(adaptationRecord);
    }
  }

  // ==========================================
  // RULE 2: RE-VISIT / STRUGGLE DETECTION
  // ==========================================
  const isStruggling = (metric.visitCount > RULES.REVISIT_STRUGGLE.maxVisitsThreshold) || 
                       (metric.errorsCount >= RULES.REVISIT_STRUGGLE.maxErrorsThreshold);

  if (isStruggling && !metric.strugglingDetected) {
    metric.strugglingDetected = true;
    const rule = RULES.REVISIT_STRUGGLE;
    const conditionDesc = rule.getDescription(stepIndex, metric.visitCount, metric.errorsCount);

    const adaptationRecord = new Adaptation({
      sessionId: session.sessionId,
      ruleId: rule.id,
      ruleName: rule.name,
      stepIndex,
      triggerCondition: conditionDesc,
      actionApplied: rule.action,
      adaptationPayload: {
        summary: STEP_ADAPTIVE_CONTENT[stepIndex]?.summary || '',
        reason: 'Multiple revisits or repeated errors detected.',
      },
      status: isAdaptiveMode ? 'ACTIVE' : 'TRIGGERED',
      evaluatedInMode: session.mode,
    });

    await adaptationRecord.save();
    if (isAdaptiveMode) {
      triggeredAdaptations.push(adaptationRecord);
    }
  }

  // ==========================================
  // RULE 3: HIGH-PROFICIENCY FAST TRACK
  // ==========================================
  // Check if previous completed steps had 0 errors and low duration
  let eligibleForFastTrack = false;
  let completedCount = 0;
  let totalTimeMs = 0;
  let totalErrors = 0;

  for (const [sKey, sMetric] of session.stepMetrics.entries()) {
    if (sMetric.quizCompleted || parseInt(sKey, 10) < stepIndex) {
      completedCount++;
      totalTimeMs += sMetric.timeSpentMs || 0;
      totalErrors += sMetric.errorsCount || 0;
    }
  }

  if (
    completedCount >= RULES.FAST_TRACK.minStepsCompleted &&
    totalErrors === 0 &&
    stepIndex < 4 &&
    !metric.fastTrackOffered
  ) {
    const avgTime = completedCount > 0 ? (totalTimeMs / completedCount) : 0;
    if (avgTime <= RULES.FAST_TRACK.maxStepTimeForFastTrackMs) {
      eligibleForFastTrack = true;
    }
  }

  if (eligibleForFastTrack && !metric.fastTrackOffered) {
    metric.fastTrackOffered = true;
    const rule = RULES.FAST_TRACK;
    const conditionDesc = rule.getDescription(completedCount, Math.round(totalTimeMs / 1000 / (completedCount || 1)));

    const adaptationRecord = new Adaptation({
      sessionId: session.sessionId,
      ruleId: rule.id,
      ruleName: rule.name,
      stepIndex,
      triggerCondition: conditionDesc,
      actionApplied: rule.action,
      adaptationPayload: {
        targetStep: 4,
        reason: 'Quick completion with zero errors.',
        message: 'High mastery detected. Skip dense content and proceed to final synthesis?',
      },
      status: isAdaptiveMode ? 'ACTIVE' : 'TRIGGERED',
      evaluatedInMode: session.mode,
    });

    await adaptationRecord.save();
    if (isAdaptiveMode) {
      triggeredAdaptations.push(adaptationRecord);
    }
  }

  // Save updated session step metrics
  session.stepMetrics.set(stepKey, metric);
  session.markModified('stepMetrics');
  await session.save();

  return {
    isAdaptiveMode,
    triggeredAdaptations,
  };
}
