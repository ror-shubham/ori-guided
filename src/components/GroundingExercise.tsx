import { useState, useEffect, useCallback } from 'react';
import type { InterventionContent } from '../types';
import './GroundingExercise.css';


interface GroundingExerciseProps {
  content?: InterventionContent;
  onComplete: () => void;
}

const SENSES = [
  { phase: 'eyes', count: 5, icon: '👁', label: 'See', prompt: 'Look around and name 5 things you see' },
  { phase: 'ears', count: 4, icon: '👂', label: 'Hear', prompt: 'Listen and name 4 things you hear' },
  { phase: 'fingers', count: 3, icon: '✋', label: 'Feel', prompt: 'Touch and name 3 things you feel' },
  { phase: 'nose', count: 2, icon: '👃', label: 'Smell', prompt: 'Notice 2 things you smell' },
  { phase: 'tongue', count: 1, icon: '👅', label: 'Taste', prompt: 'Notice 1 thing you taste' },
] as const;

export default function GroundingExercise({ content, onComplete }: GroundingExerciseProps) {
  const [started, setStarted] = useState(false);
  const [currentSenseIndex, setCurrentSenseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [finished, setFinished] = useState(false);

  const currentSense = SENSES[currentSenseIndex];
  const isActive = started && !finished;

  // Main timer for each sense phase
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Move to next sense
          if (currentSenseIndex < SENSES.length - 1) {
            setCurrentSenseIndex((i) => i + 1);
            return 20;
          } else {
            // All senses complete
            setFinished(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentSenseIndex]);

  const handleStart = useCallback(() => {
    setStarted(true);
  }, []);

  const handleSkipPhase = useCallback(() => {
    if (currentSenseIndex < SENSES.length - 1) {
      setCurrentSenseIndex((i) => i + 1);
      setTimeRemaining(20);
    } else {
      setFinished(true);
    }
  }, [currentSenseIndex]);

  if (!started) {
    return (
      <div className="grounding-container step-container">
        <div className="grounding-intro slide-up">
          <span className="grounding-icon-large">🫂</span>
          <h2 className="heading-section">Grounding Exercise</h2>
          <p className="body-text">Anchor yourself with your five senses</p>
          <p className="body-small">
            {content?.introText ?? `You'll notice things around you in about 90 seconds. This helps ground your nervous system
            when you're feeling overwhelmed.`}
          </p>
          <button className="btn-primary" onClick={handleStart} id="start-grounding">
            I'm Ready
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="grounding-container step-container">
        <div className="grounding-complete slide-up">
          <div className="complete-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="22" />
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="heading-section">Nicely done</h2>
          <p className="body-text">{content?.completionText ?? `You've anchored yourself in the present moment`}</p>
          <button className="btn-primary" onClick={onComplete} id="grounding-complete">
            See My Summary
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grounding-container step-container">
      <div className="grounding-active">
        {/* Sense Counter */}
        <div className="grounding-counter slide-up">
          <span className="grounding-counter-display">{currentSenseIndex + 1}/5</span>
          <span className="grounding-counter-label">senses</span>
        </div>

        {/* Current Sense Card */}
        <div className={`grounding-sense-card slide-up-delay-1 sense-${currentSense.phase}`}>
          <div className="grounding-sense-icon">{currentSense.icon}</div>
          <h3 className="grounding-sense-title">{currentSense.count} things you {currentSense.label.toLowerCase()}</h3>
          <p className="grounding-sense-prompt">{currentSense.prompt}</p>

          {/* Countdown Timer */}
          <div className="grounding-timer">
            <svg
              className="grounding-timer-ring"
              width="120"
              height="120"
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r="55"
                className="grounding-timer-bg"
              />
              <circle
                cx="60"
                cy="60"
                r="55"
                className="grounding-timer-progress"
                style={{
                  strokeDasharray: `${((20 - timeRemaining) / 20) * 345.575} 345.575`,
                }}
              />
            </svg>
            <span className="grounding-timer-text">{timeRemaining}s</span>
          </div>

          {/* Phase Progress Dots */}
          <div className="grounding-sense-dots">
            {SENSES.map((sense, index) => (
              <div
                key={sense.phase}
                className={`grounding-dot ${index === currentSenseIndex ? 'active' : ''} ${
                  index < currentSenseIndex ? 'done' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Skip Option */}
        <button className="btn-escape-hatch" onClick={handleSkipPhase} id="skip-sense">
          Next
        </button>
      </div>
    </div>
  );
}
