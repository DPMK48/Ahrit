import React, { useState, useRef } from 'react';

export default function Step2Fitts({
  isSummaryMode,
  onQuizAnswer,
  onNavigateNext,
  onNavigatePrev,
  quizAnswered,
  onTrackAction,
}) {
  // Target acquisition experiment state
  const [expStarted, setExpStarted] = useState(false);
  const [trialIndex, setTrialIndex] = useState(0);
  const [trialResults, setTrialResults] = useState([]);
  const [startTime, setStartTime] = useState(null);

  // Quiz state
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const trials = [
    { distance: 380, width: 40, label: 'Small Target / Far' },
    { distance: 200, width: 80, label: 'Medium Target / Mid' },
    { distance: 100, width: 120, label: 'Large Target / Near' },
  ];

  const currentTrial = trials[trialIndex] || trials[0];

  const handleStartTrial = () => {
    setExpStarted(true);
    setStartTime(Date.now());
    onTrackAction?.('FITTS_TRIAL_START', { trialIndex, trial: currentTrial });
  };

  const handleTargetClick = () => {
    if (!expStarted || !startTime) return;
    const elapsed = Date.now() - startTime;
    const result = {
      trial: trialIndex + 1,
      ...currentTrial,
      movementTimeMs: elapsed,
      indexOfDifficulty: Math.log2((2 * currentTrial.distance) / currentTrial.width).toFixed(2),
    };

    const newResults = [...trialResults, result];
    setTrialResults(newResults);
    setExpStarted(false);
    setStartTime(null);

    onTrackAction?.('FITTS_TARGET_ACQUIRED', result);

    if (trialIndex < trials.length - 1) {
      setTrialIndex(trialIndex + 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === 0; // Option 0 is correct
    const feedbackText = isCorrect
      ? 'Correct. According to Fitts\'s Law (MT = a + b * log2(2D/W)), increasing target width (W) decreases the Index of Difficulty and reduces movement time.'
      : 'Incorrect. Increasing target distance increases movement time; to decrease movement time, either increase target width or decrease distance.';

    setFeedback({ isCorrect, text: feedbackText });
    onQuizAnswer(2, isCorrect, { selectedOption, trialResults });
  };

  return (
    <div className="card">
      <div className="card-title flex-between">
        <span>Step 2: Fitts's Law & Motor Movement Dynamics</span>
        <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Biomechanical Modeling
        </span>
      </div>

      {isSummaryMode ? (
        <div className="summary-view card" style={{ background: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
          <h4>Summary View: Fitts's Law</h4>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li><strong>Formula:</strong> <code>MT = a + b * log2(2D / W)</code></li>
            <li><strong>D (Distance):</strong> Distance from cursor to target center. Shorter is faster.</li>
            <li><strong>W (Width):</strong> Size of the interactive target along the axis of motion. Larger is faster.</li>
            <li><strong>Application:</strong> Pinning critical controls to screen boundaries grants effectively infinite width.</li>
          </ul>
        </div>
      ) : (
        <div className="lesson-body">
          <p>
            Formulated by Paul Fitts in 1954, <strong>Fitts's Law</strong> is a predictive model of human motor movement.
            It quantifies the time required for a user to move a pointing device (mouse cursor, finger, stylus) to a target area.
          </p>
          <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1rem', margin: '1rem 0' }}>
            <p className="mono" style={{ fontSize: '1.05rem', textAlign: 'center', margin: 0 }}>
              <strong>MT = a + b · log₂( 2D / W )</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
              Where <strong>MT</strong> = Movement Time, <strong>D</strong> = Distance to target, <strong>W</strong> = Target width, <strong>a, b</strong> = Empirical constants.
            </p>
          </div>
          <p>
            The term <code>log₂(2D / W)</code> is known as the <strong>Index of Difficulty (ID)</strong> measured in bits.
            In interface design, maximizing clickable area and placing frequently accessed actions near the user's cursor reduces acquisition latency.
          </p>
        </div>
      )}

      {/* Interactive Micro-Experiment */}
      <div className="quiz-section">
        <h3>Interactive Acquisition Experiment</h3>
        <p style={{ fontSize: '0.9rem' }}>
          Test the formula empirically. Click <strong>[START]</strong>, then rapidly acquire and click the black target box on the right.
        </p>

        <div className="fitts-arena">
          {!expStarted ? (
            <button
              type="button"
              className="btn btn-primary fitts-start-btn"
              onClick={handleStartTrial}
            >
              {trialResults.length > 0 ? `Start Trial ${trialIndex + 1}/${trials.length}` : 'Start Trial 1'}
            </button>
          ) : (
            <div
              className="fitts-target"
              style={{
                left: `${currentTrial.distance}px`,
                width: `${currentTrial.width}px`,
                height: '80px',
                top: '70px',
              }}
              onClick={handleTargetClick}
            >
              TARGET ({currentTrial.width}px)
            </div>
          )}
        </div>

        {trialResults.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Trial</th>
                  <th>Target Type</th>
                  <th>Distance (D)</th>
                  <th>Width (W)</th>
                  <th>Index of Difficulty (ID)</th>
                  <th>Recorded Time (MT)</th>
                </tr>
              </thead>
              <tbody>
                {trialResults.map((r, i) => (
                  <tr key={i}>
                    <td>#{r.trial}</td>
                    <td>{r.label}</td>
                    <td>{r.distance}px</td>
                    <td>{r.width}px</td>
                    <td>{r.indexOfDifficulty} bits</td>
                    <td><strong>{r.movementTimeMs} ms</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehension Quiz */}
      <div className="quiz-section">
        <h3>Diagnostic Check 2.1</h3>
        <p>
          To minimize the movement time (MT) for a user acquiring a primary "Confirm" button on a desktop UI, which architectural change is supported by Fitts's Law?
        </p>

        <div className="option-list">
          <label className={`option-item ${selectedOption === 0 ? 'selected' : ''}`}>
            <input
              type="radio"
              name="step2-quiz"
              className="option-radio"
              checked={selectedOption === 0}
              onChange={() => setSelectedOption(0)}
            />
            <span>Increase button width/hitbox and position it closer to the user's active cursor locus.</span>
          </label>

          <label className={`option-item ${selectedOption === 1 ? 'selected' : ''}`}>
            <input
              type="radio"
              name="step2-quiz"
              className="option-radio"
              checked={selectedOption === 1}
              onChange={() => setSelectedOption(1)}
            />
            <span>Reduce button width to 10px and place it at maximum distance from the workspace.</span>
          </label>

          <label className={`option-item ${selectedOption === 2 ? 'selected' : ''}`}>
            <input
              type="radio"
              name="step2-quiz"
              className="option-radio"
              checked={selectedOption === 2}
              onChange={() => setSelectedOption(2)}
            />
            <span>Animate the button to constantly move across the viewport.</span>
          </label>
        </div>

        <div className="flex-gap mt-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmitQuiz}
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
        <button
          type="button"
          className="btn"
          onClick={onNavigatePrev}
        >
          &lt;- Back to Step 1
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onNavigateNext}
          disabled={!quizAnswered}
        >
          Proceed to Step 3 &rarr;
        </button>
      </div>
    </div>
  );
}
