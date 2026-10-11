/**
 * Adaptation Rules Configuration & Definitions
 */

export const RULES = {
  IDLE_HINT: {
    id: 'RULE_IDLE_HINT',
    name: 'Inactivity & Cognitive Overload Hint',
    // Configurable idle threshold: 25 seconds for responsive prototype demo (or 90s via config)
    idleThresholdMs: process.env.IDLE_THRESHOLD_MS ? parseInt(process.env.IDLE_THRESHOLD_MS, 10) : 25000,
    action: 'SHOW_HINT',
    getDescription: (stepIndex, idleSeconds) =>
      `User has been inactive on Step ${stepIndex} for ${idleSeconds}s without interaction.`,
  },
  REVISIT_STRUGGLE: {
    id: 'RULE_REVISIT_STRUGGLE',
    name: 'Step Re-visit & Error Struggle Detection',
    maxVisitsThreshold: 2, // Re-visiting more than twice (i.e. visitCount > 2)
    maxErrorsThreshold: 2,
    action: 'OFFER_SUMMARY_VIEW',
    getDescription: (stepIndex, visitCount, errorCount) =>
      `User re-visited Step ${stepIndex} ${visitCount} times (errors: ${errorCount}). Flagged as struggling.`,
  },
  FAST_TRACK: {
    id: 'RULE_FAST_TRACK',
    name: 'High-Proficiency Fast Track Acceleration',
    maxStepTimeForFastTrackMs: 30000, // under 30s per step
    minStepsCompleted: 1, // Eligible after completing at least 1-2 steps quickly with 0 errors
    action: 'OFFER_FAST_TRACK',
    getDescription: (completedStepsCount, avgTimeSec) =>
      `User completed ${completedStepsCount} step(s) with 0 errors in avg ${avgTimeSec}s. Fast-track eligible.`,
  },
};

// Content for hints and summary views per step
export const STEP_ADAPTIVE_CONTENT = {
  1: {
    hint: 'Mental models are internal representations. Look closely at the difference between how a system actually operates (system model) versus what the user expects (user model).',
    summary: '• Mental Model: Internal user belief about how a system works.\n• Design Model: The conceptual structure created by the designer.\n• System Image: The physical interface bridging user and designer.',
    fastTrackEligible: true,
  },
  2: {
    hint: 'Fitts\'s Law: MT = a + b * log2(2D / W). Note that target distance (D) and target width (W) determine movement difficulty (Index of Difficulty). Larger width and shorter distance minimize movement time.',
    summary: '• Fitts\'s Law Formula: MT = a + b * log2(2D / W)\n• Key takeaway: To speed up selection, make interactive targets larger (W) or place them closer to the initial cursor position (D).\n• Edge/corner targets have effectively infinite width.',
    fastTrackEligible: true,
  },
  3: {
    hint: 'Gulf of Execution: "How do I do what I want?" vs Gulf of Evaluation: "Did the system do what I wanted?". Pay attention to whether the problem is taking action or interpreting feedback.',
    summary: '• Gulf of Execution: Distance between user goals and the required input actions.\n• Gulf of Evaluation: Distance between system output state and user interpretation of that state.',
    fastTrackEligible: true,
  },
  4: {
    hint: 'Synthesis step: review the trade-offs between automated adaptation versus user control.',
    summary: '• Adaptive HCI balances real-time cognitive scaffolding with user agency.\n• Evaluation metrics validate whether adaptations reduce task latency without inducing confusion.',
    fastTrackEligible: false,
  },
};
