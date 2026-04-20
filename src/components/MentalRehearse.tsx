import { useState, useRef, useEffect } from 'react';
import './MentalRehearse.css';

type RehearsalPhase = 'situation' | 'visualize' | 'strength' | 'intention' | 'done';

interface MentalRehearseProps {
  onComplete: (situation?: string) => void;
}

export default function MentalRehearse({ onComplete }: MentalRehearseProps) {
  const [phase, setPhase] = useState<RehearsalPhase>('situation');
  const [situation, setSituation] = useState('');
  const [strength, setStrength] = useState('');
  const [intention, setIntention] = useState('');
  const VISUALIZATION_DURATION = 30;
  const [visualizationTime, setVisualizationTime] = useState(VISUALIZATION_DURATION);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const situationRef = useRef<HTMLTextAreaElement>(null);
  const strengthRef = useRef<HTMLTextAreaElement>(null);
  const intentionRef = useRef<HTMLTextAreaElement>(null);

  // Visualization timer
  useEffect(() => {
    if (!isVisualizing) return;

    const interval = setInterval(() => {
      setVisualizationTime((prev) => {
        if (prev <= 1) {
          setIsVisualizing(false);
          setPhase('strength');
          return VISUALIZATION_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisualizing]);

  // Auto-focus textareas
  useEffect(() => {
    if (phase === 'situation') situationRef.current?.focus();
    if (phase === 'strength') strengthRef.current?.focus();
    if (phase === 'intention') intentionRef.current?.focus();
  }, [phase]);

  const handleSituationSubmit = () => {
    if (situation.trim()) {
      setPhase('visualize');
      setIsVisualizing(true);
    }
  };

  const handleSkipVisualization = () => {
    setIsVisualizing(false);
    setPhase('strength');
  };

  const handleStrengthSubmit = () => {
    if (strength.trim()) {
      setPhase('intention');
    }
  };

  const handleIntentionSubmit = () => {
    setPhase('done');
  };

  const handleSkipToEnd = () => {
    setPhase('done');
  };

  const handleComplete = () => {
    onComplete(situation || undefined);
  };

  if (phase === 'situation') {
    return (
      <div className="rehearse-container step-container">
        <div className="rehearse-intro slide-up">
          <span className="rehearse-icon-large">🎯</span>
          <h2 className="heading-section">Mental Rehearsal</h2>
          <p className="body-text">Prepare yourself mentally</p>
          <p className="body-small">
            Visualization helps you approach difficult situations with confidence. Let's walk through what's ahead.
          </p>

          <div className="rehearse-prompt-section slide-up-delay-1">
            <h3 className="rehearse-subheading">What's the situation you're preparing for?</h3>
            <textarea
              ref={situationRef}
              className="input-textarea rehearse-textarea"
              placeholder="Meeting, presentation, difficult conversation, etc."
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              id="rehearse-situation"
            />
            <div className="rehearse-prompt-actions">
              <button className="btn-secondary" onClick={handleSkipToEnd} id="skip-rehearsal">
                Skip to Summary
              </button>
              <button
                className="btn-primary"
                onClick={handleSituationSubmit}
                disabled={!situation.trim()}
                id="start-visualization"
              >
                Begin Visualization
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'visualize' && isVisualizing) {
    return (
      <div className="rehearse-container step-container">
        <div className="rehearse-visualization slide-up">
          <h2 className="heading-section">Close your eyes</h2>
          <p className="body-text">Imagine yourself in this situation, handling it well</p>

          <div className="rehearse-visualization-card">
            <div className="rehearse-visualization-content">
              <p className="rehearse-visualization-prompt">
                Picture yourself walking in with confidence...
              </p>
              <p className="rehearse-visualization-detail">
                You speak clearly and thoughtfully. Your words come naturally. You listen carefully and respond with poise.
              </p>
              <p className="rehearse-visualization-detail">
                Any challenges that arise, you handle with calm and capability. You're prepared. You've got this.
              </p>
            </div>

            <div className="rehearse-timer">
              <svg
                className="rehearse-timer-ring"
                width="100"
                height="100"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="45" className="rehearse-timer-bg" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="rehearse-timer-progress"
                  style={{
                    strokeDasharray: `${((VISUALIZATION_DURATION - visualizationTime) / VISUALIZATION_DURATION) * 282.7} 282.7`,
                  }}
                />
              </svg>
              <span className="rehearse-timer-text">{visualizationTime}s</span>
            </div>
          </div>

          <button className="btn-escape-hatch" onClick={handleSkipVisualization} id="skip-visualization">
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'strength') {
    return (
      <div className="rehearse-container step-container">
        <div className="rehearse-section slide-up">
          <h2 className="heading-section">Anchor your strength</h2>
          <p className="body-text">What's one strength you have that will help you?</p>

          <div className="rehearse-prompt-section slide-up-delay-1">
            <p className="rehearse-prompt-hint">
              Think of a quality, skill, or past success that applies here
            </p>
            <textarea
              ref={strengthRef}
              className="input-textarea rehearse-textarea"
              placeholder="I'm calm under pressure, I communicate well, I've handled hard things before..."
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              id="rehearse-strength"
            />
            <div className="rehearse-prompt-actions">
              <button className="btn-secondary" onClick={handleSkipToEnd} id="skip-strength">
                Skip
              </button>
              <button
                className="btn-primary"
                onClick={handleStrengthSubmit}
                disabled={!strength.trim()}
                id="continue-to-intention"
              >
                Next
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'intention') {
    return (
      <div className="rehearse-container step-container">
        <div className="rehearse-section slide-up">
          <h2 className="heading-section">Set your intention</h2>
          <p className="body-text">What's one thing you want to remember going in?</p>

          <div className="rehearse-prompt-section slide-up-delay-1">
            <p className="rehearse-prompt-hint">
              This is your anchor thought—something grounding to come back to
            </p>
            <textarea
              ref={intentionRef}
              className="input-textarea rehearse-textarea"
              placeholder="I've done hard things before, I'm prepared, I belong here..."
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              id="rehearse-intention"
            />
            <div className="rehearse-prompt-actions">
              <button className="btn-secondary" onClick={handleSkipToEnd} id="skip-intention">
                Skip
              </button>
              <button
                className="btn-primary"
                onClick={handleIntentionSubmit}
                disabled={!intention.trim()}
                id="complete-rehearsal"
              >
                Done
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Done phase
  return (
    <div className="rehearse-container step-container">
      <div className="rehearse-complete slide-up">
        <div className="complete-icon warm">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="22" />
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="heading-section">You're prepared</h2>
        <p className="body-text">
          You've visualized success. You know your strength. You have your anchor. You're ready for this.
        </p>
        <button className="btn-primary" onClick={handleComplete} id="rehearsal-complete">
          See My Summary
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
