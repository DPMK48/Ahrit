import assert from 'assert';
import { connectDB, disconnectDB } from '../db.js';
import Session from '../models/Session.js';
import Event from '../models/Event.js';
import Adaptation from '../models/Adaptation.js';
import { evaluateAdaptation } from '../engine/adaptationEngine.js';
import { RULES } from '../engine/rules.js';

async function runTests() {
  await connectDB();
  console.log('\n--- Running Adaptation Engine & Data Layer Tests ---\n');

  try {
    // 1. Session Model Test
    console.log('[Test 1] Create Session and Verify Baseline vs Adaptive Defaults');
    const session = new Session({
      sessionId: 'test-session-123',
      mode: 'adaptive',
      currentStep: 1,
    });
    await session.save();
    assert.strictEqual(session.mode, 'adaptive');
    assert.strictEqual(session.currentStep, 1);
    console.log('  ✓ PASS: Session saved with mode=adaptive');

    // 2. Rule 1: Idle Timeout Test
    console.log('[Test 2] Rule 1: Idle Inactivity Threshold');
    const idleEvent = {
      sessionId: session.sessionId,
      eventType: 'IDLE_TIMEOUT',
      stepIndex: 1,
      idleDurationMs: 30000,
      timeOnStepMs: 30000,
      payload: { idleTimeMs: 30000 },
    };

    const res1 = await evaluateAdaptation(session, idleEvent);
    assert.strictEqual(res1.isAdaptiveMode, true);
    assert.strictEqual(res1.triggeredAdaptations.length, 1);
    assert.strictEqual(res1.triggeredAdaptations[0].ruleId, RULES.IDLE_HINT.id);
    assert.strictEqual(res1.triggeredAdaptations[0].actionApplied, 'SHOW_HINT');
    console.log('  ✓ PASS: Rule 1 fired with SHOW_HINT for idle user');

    // 3. Rule 2: Revisit & Struggling Detection Test
    console.log('[Test 3] Rule 2: Revisit / Struggling Detection');
    const session2 = new Session({
      sessionId: 'test-session-struggle',
      mode: 'adaptive',
      currentStep: 2,
    });
    await session2.save();

    // Revisit step 2 multiple times
    const revisit1 = { sessionId: session2.sessionId, eventType: 'STEP_NAVIGATE', stepIndex: 2, payload: { isRevisit: true } };
    const revisit2 = { sessionId: session2.sessionId, eventType: 'STEP_NAVIGATE', stepIndex: 2, payload: { isRevisit: true } };
    await evaluateAdaptation(session2, revisit1);
    const resRevisit = await evaluateAdaptation(session2, revisit2);

    assert.strictEqual(resRevisit.triggeredAdaptations.length, 1);
    assert.strictEqual(resRevisit.triggeredAdaptations[0].ruleId, RULES.REVISIT_STRUGGLE.id);
    assert.strictEqual(resRevisit.triggeredAdaptations[0].actionApplied, 'OFFER_SUMMARY_VIEW');
    console.log('  ✓ PASS: Rule 2 fired with OFFER_SUMMARY_VIEW after multiple revisits');

    // 4. Rule 3: Fast Track High-Proficiency Test
    console.log('[Test 4] Rule 3: Fast Track for Fast & Accurate Completion');
    const session3 = new Session({
      sessionId: 'test-session-fast',
      mode: 'adaptive',
      currentStep: 2,
      stepMetrics: {
        '1': {
          timeSpentMs: 12000, // 12 seconds
          visitCount: 1,
          errorsCount: 0,
          quizCompleted: true,
        },
      },
    });
    await session3.save();

    const fastEvent = {
      sessionId: session3.sessionId,
      eventType: 'QUIZ_SUCCESS',
      stepIndex: 2,
      timeOnStepMs: 14000,
      payload: { isCorrect: true },
    };
    const resFast = await evaluateAdaptation(session3, fastEvent);
    assert.strictEqual(resFast.triggeredAdaptations.length, 1);
    assert.strictEqual(resFast.triggeredAdaptations[0].ruleId, RULES.FAST_TRACK.id);
    assert.strictEqual(resFast.triggeredAdaptations[0].actionApplied, 'OFFER_FAST_TRACK');
    console.log('  ✓ PASS: Rule 3 fired with OFFER_FAST_TRACK for fast error-free user');

    // 5. Baseline Mode Test
    console.log('[Test 5] Baseline Mode suppresses UI adaptations');
    const baselineSession = new Session({
      sessionId: 'test-session-baseline',
      mode: 'baseline',
      currentStep: 1,
    });
    await baselineSession.save();

    const baselineIdleEvent = {
      sessionId: baselineSession.sessionId,
      eventType: 'IDLE_TIMEOUT',
      stepIndex: 1,
      idleDurationMs: 45000,
      timeOnStepMs: 45000,
    };
    const resBaseline = await evaluateAdaptation(baselineSession, baselineIdleEvent);
    assert.strictEqual(resBaseline.isAdaptiveMode, false);
    assert.strictEqual(resBaseline.triggeredAdaptations.length, 0);
    console.log('  ✓ PASS: Baseline mode returned 0 triggered visual adaptations');

    console.log('\n=========================================');
    console.log('ALL UNIT & ENGINE TESTS PASSED (5/5)');
    console.log('=========================================\n');
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

runTests();
