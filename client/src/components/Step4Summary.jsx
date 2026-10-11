import React from 'react';

export default function Step4Summary({
  session,
  mode,
  totalTimeSpent,
  adaptations = [],
  onCompleteModule,
  onViewAdmin,
  isCompleted,
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="card">
      <div className="card-title flex-between">
        <span>Step 4: Synthesis & Adaptive Evaluation Summary</span>
        <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Module Completion
        </span>
      </div>

      <div className="lesson-body">
        <p>
          You have reached the synthesis stage of the <strong>Adaptive HCI Learning Module</strong>.
          During your session, the interaction layer tracked your behavioral telemetry (active timing, click patterns,
          diagnostic accuracy, and idle latencies).
        </p>

        <div className="card" style={{ background: 'var(--bg-secondary)', margin: '1.5rem 0' }}>
          <h4>Core Principles Covered</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <strong>1. Mental Models</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                System Image fidelity directly dictates the accuracy of a user's internal cognitive model.
              </p>
            </div>
            <div>
              <strong>2. Fitts's Law</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Movement time scales logarithmically with distance and inversely with target hitbox width.
              </p>
            </div>
            <div>
              <strong>3. Two Gulfs</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Effective interaction systems minimize the Gulf of Execution (affordance clarity) and Gulf of Evaluation (feedback immediacy).
              </p>
            </div>
          </div>
        </div>

        {/* User Session Analytics Summary */}
        <div className="quiz-section">
          <h3>Your Session Evaluation Profile</h3>
          
          <div className="metrics-grid mt-2">
            <div className="metric-card">
              <div className="metric-label">Operational Mode</div>
              <div className="metric-value" style={{ fontSize: '1.25rem' }}>
                {mode.toUpperCase()}
              </div>
              <div className="metric-sub">
                {mode === 'adaptive' ? 'Dynamic Rules Engaged' : 'Static Baseline Control'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Total Duration</div>
              <div className="metric-value">
                {formatTime(totalTimeSpent)}
              </div>
              <div className="metric-sub">Across all 4 steps</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Adaptations Triggered</div>
              <div className="metric-value">
                {adaptations.length}
              </div>
              <div className="metric-sub">Engine interventions</div>
            </div>
          </div>

          {adaptations.length > 0 && (
            <div className="table-wrapper mt-2">
              <table>
                <thead>
                  <tr>
                    <th>Rule Fired</th>
                    <th>Step</th>
                    <th>Action Taken</th>
                    <th>Trigger Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {adaptations.map((a, i) => (
                    <tr key={i}>
                      <td><strong>{a.ruleName}</strong></td>
                      <td>Step {a.stepIndex}</td>
                      <td><code>{a.actionApplied}</code></td>
                      <td style={{ fontSize: '0.8rem' }}>{a.triggerCondition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="flex-between border-top mt-3">
        {!isCompleted ? (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={onCompleteModule}
          >
            Finalize & Submit Session Logs
          </button>
        ) : (
          <div className="flex-gap">
            <span className="mono" style={{ fontWeight: 700 }}>
              ✓ SESSION FINALIZED & PERSISTED
            </span>
          </div>
        )}

        <button
          type="button"
          className="btn btn-lg"
          onClick={onViewAdmin}
        >
          View Admin / Evaluation Dashboard -&gt;
        </button>
      </div>
    </div>
  );
}
