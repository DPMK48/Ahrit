import React from 'react';

export default function Header({
  session,
  mode,
  onToggleMode,
  activeView,
  setActiveView,
  timeOnStep,
  currentStep,
  totalSteps,
  onResetSession,
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <header className="header-bar">
      <div className="header-top">
        <div className="brand-title">
          <span>■</span>
          <span>Adaptive HCI Learning Module</span>
        </div>
        
        <div className="header-controls">
          {/* Mode Switcher Toggle */}
          <div className="mode-toggle-wrapper">
            <span style={{ color: 'var(--text-muted)' }}>MODE:</span>
            <button
              type="button"
              className={`mode-toggle-btn ${mode === 'baseline' ? 'active' : ''}`}
              onClick={() => onToggleMode('baseline')}
              title="Baseline Mode: Adaptations disabled"
            >
              Baseline
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${mode === 'adaptive' ? 'active' : ''}`}
              onClick={() => onToggleMode('adaptive')}
              title="Adaptive Mode: Real-time UI modifications active"
            >
              Adaptive
            </button>
          </div>

          {/* View Switcher */}
          <button
            type="button"
            className={`btn btn-sm ${activeView === 'lesson' ? 'btn-primary' : ''}`}
            onClick={() => setActiveView('lesson')}
          >
            Lesson
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeView === 'admin' ? 'btn-primary' : ''}`}
            onClick={() => setActiveView('admin')}
          >
            Admin & Results
          </button>

          <button
            type="button"
            className="btn btn-sm"
            onClick={onResetSession}
            title="Start a new learning session"
          >
            New Session
          </button>
        </div>
      </div>

      <div className="header-meta">
        <div className="meta-group">
          <span>SESSION: <code className="mono">{session?.sessionId?.slice(0, 8) || 'INITIALIZING'}</code></span>
          <span>SYSTEM STATE: <strong>{mode === 'adaptive' ? 'DYNAMIC RULES ON' : 'BASELINE LOCKED'}</strong></span>
        </div>

        {activeView === 'lesson' && (
          <div className="meta-group">
            <span>STEP: <strong>{currentStep} / {totalSteps}</strong></span>
            <span>TIME ON STEP: <strong className="mono">{formatTime(timeOnStep)}</strong></span>
          </div>
        )}
      </div>
    </header>
  );
}
