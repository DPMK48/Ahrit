import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Step1Intro from './components/Step1Intro';
import Step2Fitts from './components/Step2Fitts';
import Step3Gulf from './components/Step3Gulf';
import Step4Summary from './components/Step4Summary';
import AdaptiveOverlays from './components/AdaptiveOverlays';
import AdminDashboard from './components/AdminDashboard';
import {
  createSession,
  toggleSessionMode,
  updateSessionStep,
  logEvent,
  getAdaptations,
  updateAdaptationStatus,
} from './services/api';

export default function App() {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState('adaptive');
  const [activeView, setActiveView] = useState('lesson'); // 'lesson' | 'admin'
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timers & Metrics
  const [timeOnStep, setTimeOnStep] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [isSummaryMode, setIsSummaryMode] = useState(false);

  // Quiz state tracker per step
  const [stepQuizStatus, setStepQuizStatus] = useState({
    1: false,
    2: false,
    3: false,
  });

  // Track visit counts for struggle detection
  const [visitHistory, setVisitHistory] = useState({ 1: 1 });

  // Real-time Adaptations list
  const [adaptations, setAdaptations] = useState([]);

  // Inactivity tracking refs
  const lastActivityTimeRef = useRef(Date.now());
  const idleReportedRef = useRef(false);
  const stepStartTimeRef = useRef(Date.now());

  // Initialize Session
  const initSession = async (chosenMode = 'adaptive') => {
    try {
      const res = await createSession(chosenMode);
      if (res.success) {
        setSession(res.session);
        setMode(res.session.mode);
        setCurrentStep(1);
        setTimeOnStep(0);
        setTotalTimeSpent(0);
        setIsSummaryMode(false);
        setIsCompleted(false);
        setStepQuizStatus({ 1: false, 2: false, 3: false });
        setVisitHistory({ 1: 1 });
        setAdaptations([]);
        lastActivityTimeRef.current = Date.now();
        idleReportedRef.current = false;
        stepStartTimeRef.current = Date.now();
      }
    } catch (err) {
      console.error('Failed to initialize session:', err);
    }
  };

  useEffect(() => {
    initSession();
  }, []);

  // Timer Tick (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnStep((prev) => prev + 1);
      setTotalTimeSpent((prev) => prev + 1);

      // Check for inactivity idle timeout (e.g. 20 seconds of no user input)
      const idleTimeMs = Date.now() - lastActivityTimeRef.current;
      if (idleTimeMs >= 20000 && !idleReportedRef.current && session && !isCompleted) {
        idleReportedRef.current = true;
        handleLogEvent('IDLE_TIMEOUT', {
          idleTimeMs,
          message: 'User idle threshold reached on current step.',
        }, idleTimeMs);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session, isCompleted, currentStep]);

  // Global User Activity Listener (resets idle clock)
  useEffect(() => {
    const onUserActivity = (e) => {
      lastActivityTimeRef.current = Date.now();
      if (idleReportedRef.current) {
        idleReportedRef.current = false;
      }
    };

    window.addEventListener('mousemove', onUserActivity);
    window.addEventListener('keydown', onUserActivity);
    window.addEventListener('click', onUserActivity);
    window.addEventListener('scroll', onUserActivity);

    return () => {
      window.removeEventListener('mousemove', onUserActivity);
      window.removeEventListener('keydown', onUserActivity);
      window.removeEventListener('click', onUserActivity);
      window.removeEventListener('scroll', onUserActivity);
    };
  }, []);

  // Send interaction event to backend & process any adaptation responses
  const handleLogEvent = async (eventType, payload = {}, idleMs = 0) => {
    if (!session) return;

    try {
      const eventData = {
        sessionId: session.sessionId,
        eventType,
        stepIndex: currentStep,
        payload,
        timeOnStepMs: timeOnStep * 1000,
        idleDurationMs: idleMs || (Date.now() - lastActivityTimeRef.current),
      };

      const res = await logEvent(eventData);
      if (res.success && res.triggeredAdaptations?.length > 0 && mode === 'adaptive') {
        // Merge triggered adaptations
        setAdaptations((prev) => {
          const newOnes = res.triggeredAdaptations.filter(
            (ta) => !prev.some((p) => p.ruleId === ta.ruleId && p.stepIndex === ta.stepIndex)
          );
          return [...prev, ...newOnes];
        });
      }
    } catch (err) {
      console.error('Error dispatching event:', err);
    }
  };

  // Toggle Mode (Baseline vs Adaptive)
  const handleToggleMode = async (newMode) => {
    if (newMode === mode || !session) return;
    try {
      const res = await toggleSessionMode(session.sessionId, newMode);
      if (res.success) {
        setMode(newMode);
        setSession(res.session);
        // If switched to baseline, clear active visual adaptation overlays
        if (newMode === 'baseline') {
          setAdaptations([]);
          setIsSummaryMode(false);
        } else {
          // If switched to adaptive, fetch any existing adaptations
          const adaptRes = await getAdaptations(session.sessionId);
          if (adaptRes.success) {
            setAdaptations(adaptRes.adaptations.filter((a) => a.status === 'ACTIVE'));
          }
        }
      }
    } catch (err) {
      console.error('Failed to toggle mode:', err);
    }
  };

  // Step Navigation
  const handleNavigateToStep = (targetStep) => {
    if (targetStep === currentStep || targetStep < 1 || targetStep > 4) return;

    const isRevisit = (visitHistory[targetStep] || 0) > 0;
    const newCount = (visitHistory[targetStep] || 0) + 1;

    setVisitHistory((prev) => ({
      ...prev,
      [targetStep]: newCount,
    }));

    handleLogEvent('STEP_NAVIGATE', {
      fromStep: currentStep,
      toStep: targetStep,
      isRevisit,
      visitCount: newCount,
    });

    setCurrentStep(targetStep);
    setTimeOnStep(0);
    lastActivityTimeRef.current = Date.now();
    idleReportedRef.current = false;
    stepStartTimeRef.current = Date.now();

    updateSessionStep(session.sessionId, targetStep, false);
  };

  // Quiz submission handler
  const handleQuizAnswer = (stepIndex, isCorrect, payload = {}) => {
    setStepQuizStatus((prev) => ({ ...prev, [stepIndex]: isCorrect }));
    handleLogEvent(isCorrect ? 'QUIZ_SUCCESS' : 'QUIZ_FAILURE', {
      stepIndex,
      isCorrect,
      ...payload,
    });
  };

  // Adaptation Action Handlers
  const handleDismissAdaptation = async (adapt) => {
    setAdaptations((prev) => prev.filter((a) => a._id !== adapt._id));
    if (adapt._id) {
      await updateAdaptationStatus(adapt._id, 'DISMISSED');
    }
  };

  const handleAcceptFastTrack = async (adapt) => {
    if (adapt._id) {
      await updateAdaptationStatus(adapt._id, 'ACCEPTED');
    }
    setAdaptations((prev) => prev.filter((a) => a._id !== adapt._id));
    handleNavigateToStep(4);
  };

  const handleCompleteModule = async () => {
    setIsCompleted(true);
    if (session) {
      await updateSessionStep(session.sessionId, 4, true);
      handleLogEvent('SESSION_COMPLETE', {
        totalDurationMs: totalTimeSpent * 1000,
        completedAt: new Date(),
      });
    }
  };

  return (
    <div className="app-container">
      <Header
        session={session}
        mode={mode}
        onToggleMode={handleToggleMode}
        activeView={activeView}
        setActiveView={setActiveView}
        timeOnStep={timeOnStep}
        currentStep={currentStep}
        totalSteps={4}
        onResetSession={() => initSession(mode)}
      />

      <main className="main-content">
        {activeView === 'admin' ? (
          <AdminDashboard onBackToLesson={() => setActiveView('lesson')} />
        ) : (
          <>
            {/* Step Navigation Bar */}
            <div className="step-nav-bar">
              <div
                className={`step-nav-item ${currentStep === 1 ? 'active' : ''} ${stepQuizStatus[1] ? 'completed' : ''}`}
                onClick={() => handleNavigateToStep(1)}
              >
                1. Mental Models {stepQuizStatus[1] && '✓'}
              </div>
              <div
                className={`step-nav-item ${currentStep === 2 ? 'active' : ''} ${stepQuizStatus[2] ? 'completed' : ''}`}
                onClick={() => handleNavigateToStep(2)}
              >
                2. Fitts's Law {stepQuizStatus[2] && '✓'}
              </div>
              <div
                className={`step-nav-item ${currentStep === 3 ? 'active' : ''} ${stepQuizStatus[3] ? 'completed' : ''}`}
                onClick={() => handleNavigateToStep(3)}
              >
                3. Two Gulfs {stepQuizStatus[3] && '✓'}
              </div>
              <div
                className={`step-nav-item ${currentStep === 4 ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleNavigateToStep(4)}
              >
                4. Synthesis {isCompleted && '✓'}
              </div>
            </div>

            {/* Active Adaptation Overlays (Hints, Struggle Summaries, Fast-Track) */}
            {mode === 'adaptive' && (
              <AdaptiveOverlays
                adaptations={adaptations.filter((a) => a.stepIndex === currentStep || a.ruleId === 'RULE_FAST_TRACK')}
                isSummaryMode={isSummaryMode}
                onToggleSummaryMode={() => {
                  setIsSummaryMode(!isSummaryMode);
                  handleLogEvent('SUMMARY_VIEW_TOGGLED', { isSummaryMode: !isSummaryMode });
                }}
                onAcceptFastTrack={handleAcceptFastTrack}
                onDismissAdaptation={handleDismissAdaptation}
              />
            )}

            {/* Render Current Step Component */}
            {currentStep === 1 && (
              <Step1Intro
                isSummaryMode={isSummaryMode}
                onQuizAnswer={handleQuizAnswer}
                onNavigateNext={() => handleNavigateToStep(2)}
                quizAnswered={stepQuizStatus[1]}
              />
            )}

            {currentStep === 2 && (
              <Step2Fitts
                isSummaryMode={isSummaryMode}
                onQuizAnswer={handleQuizAnswer}
                onNavigateNext={() => handleNavigateToStep(3)}
                onNavigatePrev={() => handleNavigateToStep(1)}
                quizAnswered={stepQuizStatus[2]}
                onTrackAction={(action, data) => handleLogEvent(action, data)}
              />
            )}

            {currentStep === 3 && (
              <Step3Gulf
                isSummaryMode={isSummaryMode}
                onQuizAnswer={handleQuizAnswer}
                onNavigateNext={() => handleNavigateToStep(4)}
                onNavigatePrev={() => handleNavigateToStep(2)}
                quizAnswered={stepQuizStatus[3]}
              />
            )}

            {currentStep === 4 && (
              <Step4Summary
                session={session}
                mode={mode}
                totalTimeSpent={totalTimeSpent}
                adaptations={adaptations}
                onCompleteModule={handleCompleteModule}
                onViewAdmin={() => setActiveView('admin')}
                isCompleted={isCompleted}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
