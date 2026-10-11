import React from 'react';

export default function AdaptiveOverlays({
  adaptations = [],
  isSummaryMode,
  onToggleSummaryMode,
  onAcceptFastTrack,
  onDismissAdaptation,
}) {
  if (!adaptations || adaptations.length === 0) return null;

  return (
    <div className="adaptive-container mt-2 mb-2">
      {adaptations.map((adapt) => {
        // RULE 1: IDLE / INACTIVITY HINT
        if (adapt.ruleId === 'RULE_IDLE_HINT') {
          return (
            <div key={adapt._id || adapt.ruleId} className="adaptive-box">
              <div className="flex-between mb-1">
                <span className="adaptive-tag">Rule Trigger: Inactivity Scaffolding</span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onDismissAdaptation(adapt)}
                >
                  Dismiss Hint [x]
                </button>
              </div>
              <h4>Cognitive Assistance & Clarification</h4>
              <p className="mono" style={{ whiteSpace: 'pre-line', margin: '0.5rem 0' }}>
                {adapt.adaptationPayload?.hint}
              </p>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Condition: {adapt.triggerCondition}
              </div>
            </div>
          );
        }

        // RULE 2: REVISIT / STRUGGLING SUMMARY OFFER
        if (adapt.ruleId === 'RULE_REVISIT_STRUGGLE') {
          return (
            <div key={adapt._id || adapt.ruleId} className="adaptive-box">
              <div className="flex-between mb-1">
                <span className="adaptive-tag">Rule Trigger: Struggle Detection</span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onDismissAdaptation(adapt)}
                >
                  Dismiss [x]
                </button>
              </div>
              <h4>Struggling Detected</h4>
              <p>
                Multiple step revisits or repeated errors were detected. You can switch to a structured
                bullet summary view for quicker reference.
              </p>
              <div className="flex-gap mt-1 mb-1">
                <button
                  type="button"
                  className={`btn ${isSummaryMode ? 'btn-primary' : ''}`}
                  onClick={onToggleSummaryMode}
                >
                  {isSummaryMode ? 'Exit Summary View' : 'Switch to Concise Summary View'}
                </button>
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Condition: {adapt.triggerCondition}
              </div>
            </div>
          );
        }

        // RULE 3: HIGH-PROFICIENCY FAST TRACK
        if (adapt.ruleId === 'RULE_FAST_TRACK') {
          return (
            <div key={adapt._id || adapt.ruleId} className="adaptive-box inverted">
              <div className="flex-between mb-1">
                <span className="adaptive-tag inverted">Rule Trigger: High Proficiency</span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onDismissAdaptation(adapt)}
                >
                  Dismiss [x]
                </button>
              </div>
              <h4>Fast Track Acceleration Available</h4>
              <p>
                {adapt.adaptationPayload?.message ||
                  'High speed and 100% accuracy detected. Would you like to skip optional intermediate detail and jump directly to synthesis?'}
              </p>
              <div className="flex-gap mt-2 mb-1">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onAcceptFastTrack(adapt)}
                >
                  Accept Fast Track &rarr; Jump to Final Step
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => onDismissAdaptation(adapt)}
                >
                  Continue Full Lesson
                </button>
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>
                Condition: {adapt.triggerCondition}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
