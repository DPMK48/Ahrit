import React, { useState, useEffect } from 'react';
import { getAdminMetrics, getAdminSessions, getAdminSessionTrace } from '../services/api';

export default function AdminDashboard({ onBackToLesson }) {
  const [metrics, setMetrics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionTrace, setSessionTrace] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [mRes, sRes] = await Promise.all([
        getAdminMetrics(),
        getAdminSessions(filterMode !== 'all' ? { mode: filterMode } : {}),
      ]);
      if (mRes.success) setMetrics(mRes.data);
      if (sRes.success) setSessions(sRes.sessions);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterMode]);

  const handleSelectSession = async (sessionId) => {
    setSelectedSessionId(sessionId);
    try {
      const res = await getAdminSessionTrace(sessionId);
      if (res.success) {
        setSessionTrace(res);
      }
    } catch (err) {
      console.error('Failed to fetch session trace:', err);
    }
  };

  const handleExportJSON = () => {
    window.open('/api/admin/export', '_blank');
  };

  return (
    <div className="admin-view">
      <div className="card">
        <div className="card-title flex-between">
          <span>Admin & Evaluation Dashboard (Heuristic Stand-in)</span>
          <div className="flex-gap">
            <button type="button" className="btn btn-sm" onClick={fetchDashboardData}>
              Refresh Data
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={handleExportJSON}>
              Export JSON Dataset
            </button>
            <button type="button" className="btn btn-sm" onClick={onBackToLesson}>
              &lt;- Return to Module
            </button>
          </div>
        </div>

        {loading && !metrics ? (
          <p className="mono">Loading instrumentation evaluation metrics...</p>
        ) : (
          <>
            {/* Metric Overview Grid */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Total Sessions</div>
                <div className="metric-value">{metrics?.totalSessions || 0}</div>
                <div className="metric-sub">
                  Baseline: {metrics?.baselineSessions || 0} | Adaptive: {metrics?.adaptiveSessions || 0}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Completed Sessions</div>
                <div className="metric-value">{metrics?.completedSessions || 0}</div>
                <div className="metric-sub">Finished all 4 steps</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Total Adaptations</div>
                <div className="metric-value">{metrics?.totalAdaptations || 0}</div>
                <div className="metric-sub">Triggered engine rules</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Total Logged Events</div>
                <div className="metric-value">{metrics?.totalEvents || 0}</div>
                <div className="metric-sub">Granular user telemetry</div>
              </div>
            </div>

            {/* Heuristic Evaluation: Baseline vs Adaptive Comparison */}
            <div className="card" style={{ background: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
              <h4>Layer 3 Evaluation: Baseline vs. Adaptive Comparison</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Comparing completion velocity and interaction event density between experimental conditions.
              </p>
              
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Condition Mode</th>
                      <th>Completed Runs</th>
                      <th>Avg Completion Duration</th>
                      <th>Avg Events / Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['baseline', 'adaptive'].map((m) => {
                      const stat = metrics?.completedStats?.find((s) => s._id === m);
                      const eventStat = metrics?.eventsPerMode?.find((e) => e._id === m);
                      const avgSec = stat?.avgDurationMs ? Math.round(stat.avgDurationMs / 1000) : 0;
                      return (
                        <tr key={m}>
                          <td><strong className="mono">{m.toUpperCase()}</strong></td>
                          <td>{stat?.count || 0}</td>
                          <td>{avgSec > 0 ? `${avgSec} seconds` : 'N/A (Pending runs)'}</td>
                          <td>{eventStat?.avgEventsPerSession ? eventStat.avgEventsPerSession.toFixed(1) : 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Adaptations by Rule Breakdown */}
            <div className="card mb-3">
              <h4>Adaptation Engine Rules Trigger Count</h4>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Rule ID</th>
                      <th>Rule Description</th>
                      <th>Trigger Count</th>
                      <th>Accepted</th>
                      <th>Dismissed / Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics?.ruleStats && metrics.ruleStats.length > 0 ? (
                      metrics.ruleStats.map((r) => (
                        <tr key={r._id}>
                          <td><code className="mono">{r._id}</code></td>
                          <td>{r.ruleName}</td>
                          <td><strong>{r.count}</strong></td>
                          <td>{r.acceptedCount}</td>
                          <td>{r.dismissedCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-muted" style={{ textAlign: 'center' }}>
                          No adaptation triggers recorded yet. Run the module in Adaptive mode to generate events.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Session Explorer */}
            <div className="card">
              <div className="flex-between mb-2">
                <h4>Session Activity Log</h4>
                <div className="flex-gap">
                  <span className="mono" style={{ fontSize: '0.8rem' }}>Filter Mode:</span>
                  <button
                    type="button"
                    className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : ''}`}
                    onClick={() => setFilterMode('all')}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${filterMode === 'baseline' ? 'btn-primary' : ''}`}
                    onClick={() => setFilterMode('baseline')}
                  >
                    Baseline
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${filterMode === 'adaptive' ? 'btn-primary' : ''}`}
                    onClick={() => setFilterMode('adaptive')}
                  >
                    Adaptive
                  </button>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Session ID</th>
                      <th>Mode</th>
                      <th>Current Step</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.sessionId} style={{ cursor: 'pointer' }}>
                        <td className="mono">{s.sessionId.slice(0, 12)}...</td>
                        <td><strong className="mono">{s.mode.toUpperCase()}</strong></td>
                        <td>Step {s.currentStep}</td>
                        <td>{s.completed ? '✓ Completed' : 'In Progress'}</td>
                        <td>{new Date(s.createdAt).toLocaleTimeString()}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleSelectSession(s.sessionId)}
                          >
                            Inspect Trace
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deep Session Inspector Modal */}
            {selectedSessionId && sessionTrace && (
              <div className="modal-backdrop" onClick={() => setSelectedSessionId(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="flex-between mb-2">
                    <h3>Session Deep Trace: {selectedSessionId.slice(0, 8)}</h3>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setSelectedSessionId(null)}
                    >
                      Close [x]
                    </button>
                  </div>

                  <p className="mono" style={{ fontSize: '0.85rem' }}>
                    Mode: <strong>{sessionTrace.session?.mode}</strong> | Completed: {String(sessionTrace.session?.completed)} | Total Duration: {sessionTrace.session?.totalDurationMs ? `${Math.round(sessionTrace.session.totalDurationMs / 1000)}s` : 'Active'}
                  </p>

                  <h4 className="mt-2 mb-1">Triggered Adaptations ({sessionTrace.adaptations?.length || 0})</h4>
                  {sessionTrace.adaptations?.length > 0 ? (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Rule</th>
                            <th>Step</th>
                            <th>Status</th>
                            <th>Trigger Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionTrace.adaptations.map((a, i) => (
                            <tr key={i}>
                              <td className="mono">{a.ruleId}</td>
                              <td>Step {a.stepIndex}</td>
                              <td><span className="mono">{a.status}</span></td>
                              <td style={{ fontSize: '0.8rem' }}>{a.triggerCondition}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>No adaptations triggered for this session.</p>
                  )}

                  <h4 className="mt-2 mb-1">Interaction Event Stream ({sessionTrace.events?.length || 0})</h4>
                  <div className="table-wrapper" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Event Type</th>
                          <th>Step</th>
                          <th>Payload Summary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionTrace.events?.map((ev, i) => (
                          <tr key={i}>
                            <td className="mono">{new Date(ev.timestamp).toLocaleTimeString()}</td>
                            <td><strong className="mono">{ev.eventType}</strong></td>
                            <td>Step {ev.stepIndex}</td>
                            <td className="mono" style={{ fontSize: '0.75rem' }}>
                              {JSON.stringify(ev.payload)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
