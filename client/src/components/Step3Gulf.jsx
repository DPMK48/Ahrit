import React, { useState } from 'react';

export default function Step3Gulf({
  isSummaryMode,
  onQuizAnswer,
  onNavigateNext,
  onNavigatePrev,
  quizAnswered,
}) {
  const [selectedScenarioOption, setSelectedScenarioOption] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleOptionSelect = (index) => {
    setSelectedScenarioOption(index);
  };

  const handleSubmit = () => {
    if (selectedScenarioOption === null) return;
    const isCorrect = selectedScenarioOption === 1; // Option 1 is Gulf of Evaluation
    const feedbackText = isCorrect
      ? 'Correct. The action succeeded, but because the interface provided zero state confirmation or progress indicator, the user is unable to interpret system status (Gulf of Evaluation).'
      : 'Incorrect. The user successfully executed their intent; the breakdown is in assessing the system’s post-action state, which is the Gulf of Evaluation.';

    setFeedback({ isCorrect, text: feedbackText });
    onQuizAnswer(3, isCorrect, { selectedScenarioOption });
  };

  return (
    <div className="card">
      <div className="card-title flex-between">
        <span>Step 3: Gulf of Execution vs Gulf of Evaluation</span>
        <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Cognitive Ergonomics
        </span>
      </div>

      {isSummaryMode ? (
        <div className="summary-view card" style={{ background: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
          <h4>Summary View: The Two Gulfs</h4>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li><strong>Gulf of Execution:</strong> The effort required by the user to translate psychological goals into physical system inputs ("How do I operate this?").</li>
            <li><strong>Gulf of Evaluation:</strong> The effort required by the user to assess the system's state and determine if their goal was achieved ("What just happened?").</li>
            <li><strong>Bridge Mechanisms:</strong> Clear signifiers/affordances bridge Execution; immediate, legible feedback bridges Evaluation.</li>
          </ul>
        </div>
      ) : (
        <div className="lesson-body">
          <p>
            Developed by Edwin Hutchins, James Hollan, and Donald Norman, the concept of the <strong>Two Gulfs</strong>
            identifies the cognitive gaps between a user’s internal mental goals and the physical computing system.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.5rem 0' }}>
            <div className="card" style={{ background: 'var(--bg-secondary)', margin: 0 }}>
              <h4>Gulf of Execution</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                The distance between the user’s formulated intentions and the permissible physical actions offered by the interface.
                <br /><br />
                <em>Core Question: "How do I perform the action I want?"</em>
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', margin: 0 }}>
              <h4>Gulf of Evaluation</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                The distance between the physical output state produced by the computer and the user’s perceptual ability to interpret whether their goal was met.
                <br /><br />
                <em>Core Question: "What state is the system in now?"</em>
              </p>
            </div>
          </div>

          <p>
            Adaptive interfaces aim to narrow both gulfs simultaneously by contextually revealing affordances (Execution)
            and highlighting state transformations (Evaluation).
          </p>
        </div>
      )}

      {/* Case Study Analysis Quiz */}
      <div className="quiz-section">
        <h3>Case Study Diagnostic 3.1</h3>
        <p style={{ fontSize: '0.95rem' }}>
          <strong>Scenario:</strong> A user clicks a "Submit Order" button. The button clicks, but nothing changes on the screen — no spinner, no status badge, and no confirmation modal appears for 8 seconds. The user repeatedly clicks the button in confusion, accidentally placing 3 duplicate orders.
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Which cognitive gulf primarily caused this interaction breakdown?
        </p>

        <div className="option-list">
          <label className={`option-item ${selectedScenarioOption === 0 ? 'selected' : ''}`}>
            <input
              type="radio"
              name="step3-quiz"
              className="option-radio"
              checked={selectedScenarioOption === 0}
              onChange={() => handleOptionSelect(0)}
            />
            <span><strong>Gulf of Execution:</strong> The user did not know where the submit button was located.</span>
          </label>

          <label className={`option-item ${selectedScenarioOption === 1 ? 'selected' : ''}`}>
            <input
              type="radio"
              name="step3-quiz"
              className="option-radio"
              checked={selectedScenarioOption === 1}
              onChange={() => handleOptionSelect(1)}
            />
            <span><strong>Gulf of Evaluation:</strong> The system failed to communicate its background processing state, leaving the user unable to verify execution.</span>
          </label>

          <label className={`option-item ${selectedScenarioOption === 2 ? 'selected' : ''}`}>
            <input
              type="radio"
              name="step3-quiz"
              className="option-radio"
              checked={selectedScenarioOption === 2}
              onChange={() => handleOptionSelect(2)}
            />
            <span><strong>Hardware Failure:</strong> The user's mouse peripheral stopped transmitting click coordinates.</span>
          </label>
        </div>

        <div className="flex-gap mt-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selectedScenarioOption === null}
          >
            Submit Answer
          </button>
        </div>

        {feedback && (
          <div className="feedback-banner mt-2">
            <strong>{feedback.isCorrect ? '[PASS]' : '[FAIL]'}</strong> {feedback.text}
          </div>
        )}
      </div>

      <div className="flex-between border-top mt-3">
        <button
          type="button"
          className="btn"
          onClick={onNavigatePrev}
        >
          &lt;- Back to Step 2
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onNavigateNext}
          disabled={!quizAnswered}
        >
          Proceed to Summary & Synthesis &rarr;
        </button>
      </div>
    </div>
  );
}
