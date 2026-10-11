import React, { useState } from 'react';

export default function Step1Intro({
  isSummaryMode,
  onQuizAnswer,
  onNavigateNext,
  quizAnswered,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === 1; // Option 1 is correct
    const feedbackText = isCorrect
      ? 'Correct. The system image (UI, documentation, feedback) is the only physical medium conveying the designer’s conceptual model to the user.'
      : 'Incorrect. The designer and user rarely communicate directly; the user constructs their mental model entirely from the physical system image.';

    setFeedback({ isCorrect, text: feedbackText });
    onQuizAnswer(1, isCorrect, { selectedOption });
  };

  return (
    <div className="card">
      <div className="card-title flex-between">
        <span>Step 1: Mental Models & Conceptual Architecture</span>
        <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          HCI Foundations
        </span>
      </div>

      {isSummaryMode ? (
        <div className="summary-view card" style={{ background: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
          <h4>Summary View: Mental Models</h4>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li><strong>Design Model:</strong> Conceptual framework envisioned by the system architect.</li>
            <li><strong>User Model (Mental Model):</strong> The user's internal mental schema of how the system functions.</li>
            <li><strong>System Image:</strong> The explicit physical manifestations (UI widgets, errors, affordances) through which the user interprets the system.</li>
          </ul>
        </div>
      ) : (
        <div className="lesson-body">
          <p>
            In human-computer interaction (HCI), a <strong>mental model</strong> represents a user’s cognitive
            belief structure regarding how a system operates. Users formulate these internal models not by
            inspecting source code, but through past experiences, analogies, and the perceptual cues presented by the interface.
          </p>
          <p>
            Donald Norman outlines three interrelated entities in interface design:
          </p>
          <div style={{ borderLeft: '3px solid var(--border-primary)', paddingLeft: '1rem', margin: '1rem 0' }}>
            <p><strong>1. The Design Model:</strong> The designer's explicit conceptual model of the application.</p>
            <p><strong>2. The User's Model:</strong> The mental representation constructed by the user through interaction.</p>
            <p><strong>3. The System Image:</strong> The physical interface, documentation, visual affordances, and real-time system responses.</p>
          </div>
          <p>
            When the System Image fails to communicate the Design Model unambiguously, the user’s Mental Model
            deviates from reality, resulting in usability friction, input errors, and cognitive strain.
          </p>
        </div>
      )}

      {/* Comprehension Quiz */}
      <div className="quiz-section">
        <h3>Diagnostic Check 1.1</h3>
        <p>
          According to Norman's design model framework, how does a user construct their mental model of an interface?
        </p>

        <div className="option-list">
          <label className={`option-item ${selectedOption === 0 ? 'selected' : ''}`}>
            <input
              type="radio"
              name="step1-quiz"
              className="option-radio"
              checked={selectedOption === 0}
              onChange={() => handleOptionSelect(0)}
            />
            <span>Through direct verbal instruction and developer code review.</span>
          </label>

          <label className={`option-item ${selectedOption === 1 ? 'selected' : ''}`}>
            <input
              type="radio"
              name="step1-quiz"
              className="option-radio"
              checked={selectedOption === 1}
              onChange={() => handleOptionSelect(1)}
            />
            <span>Exclusively through interactions with the physical System Image (UI, cues, feedback).</span>
          </label>

          <label className={`option-item ${selectedOption === 2 ? 'selected' : ''}`}>
            <input
              type="radio"
              name="step1-quiz"
              className="option-radio"
              checked={selectedOption === 2}
              onChange={() => handleOptionSelect(2)}
            />
            <span>By guessing the backend database architecture without using the interface.</span>
          </label>
        </div>

        <div className="flex-gap mt-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selectedOption === null}
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
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          Step 1 of 4
        </span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNavigateNext}
          disabled={!quizAnswered}
        >
          Proceed to Step 2 &rarr;
        </button>
      </div>
    </div>
  );
}
