import { useState, useEffect, useCallback } from 'react';
import type { InterventionContent } from '../types';
import './MovementReset.css';

type MovementPhase = 'disclaimer' | 'active' | 'complete';

const MOVEMENT_PHASES = [
  {
    id: 'circles',
    name: 'Arm Circles',
    icon: '🔄',
    duration: 20,
    description: 'Rotate your arms in slow, wide circles',
  },
  {
    id: 'twists',
    name: 'Torso Twists',
    icon: '🌀',
    duration: 20,
    description: 'Gently twist your torso side to side',
  },
  {
    id: 'marching',
    name: 'Marching in Place',
    icon: '🚶',
    duration: 20,
    description: 'March in place, lifting your knees',
  },
  {
    id: 'stretch',
    name: 'Cool-Down Stretch',
    icon: '🧘',
    duration: 15,
    description: 'Reach up and gently stretch your whole body',
  },
];

interface MovementResetProps {
  content?: InterventionContent;
  onComplete: () => void;
}

export default function MovementReset({ content, onComplete }: MovementResetProps) {
  const [phase, setPhase] = useState<MovementPhase>('disclaimer');
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(MOVEMENT_PHASES[0].duration);
  const [finished, setFinished] = useState(false);

  const currentMove = MOVEMENT_PHASES[currentMoveIndex];
  const isActive = phase === 'active' && !finished;

  // Main timer for each movement phase
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Move to next movement
          if (currentMoveIndex < MOVEMENT_PHASES.length - 1) {
            const nextIndex = currentMoveIndex + 1;
            setCurrentMoveIndex(nextIndex);
            return MOVEMENT_PHASES[nextIndex].duration;
          } else {
            // All movements complete
            setFinished(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentMoveIndex]);

  const handleAcceptDisclaimer = useCallback(() => {
    setPhase('active');
  }, []);

  const handleSkipMovement = useCallback(() => {
    if (currentMoveIndex < MOVEMENT_PHASES.length - 1) {
      const nextIndex = currentMoveIndex + 1;
      setCurrentMoveIndex(nextIndex);
      setTimeRemaining(MOVEMENT_PHASES[nextIndex].duration);
    } else {
      setFinished(true);
    }
  }, [currentMoveIndex]);

  if (phase === 'disclaimer') {
    return (
      <div className="movement-container step-container">
        <div className="movement-disclaimer slide-up">
          <div className="movement-warning-icon">⚠️</div>
          <h2 className="heading-section">Movement Reset</h2>
          <p className="body-text">{content?.introText ?? `This exercise needs space to move`}</p>

          <div className="movement-requirements card">
            <p className="body-small" style={{ fontWeight: 600, marginBottom: '1rem' }}>
              Before you start, make sure you have:
            </p>
            <ul className="movement-checklist">
              <li>
                <span className="checklist-icon">✓</span>
                <span>2-3 feet of clear space around you</span>
              </li>
              <li>
                <span className="checklist-icon">✓</span>
                <span>Comfortable flooring (not slippery)</span>
              </li>
              <li>
                <span className="checklist-icon">✓</span>
                <span>Comfortable clothing you can move in</span>
              </li>
              <li>
                <span className="checklist-icon">✓</span>
                <span>Nothing fragile nearby</span>
              </li>
            </ul>
          </div>

          <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            Total time: ~90 seconds of gentle movement
          </p>

          <div className="movement-disclaimer-actions">
            <button className="btn-primary" onClick={handleAcceptDisclaimer} id="start-movement">
              I'm Ready
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
            <button className="btn-secondary" onClick={onComplete} id="skip-movement-entirely">
              Choose Different Intervention
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="movement-container step-container">
        <div className="movement-complete slide-up">
          <div className="complete-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="22" />
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="heading-section">Well done</h2>
          <p className="body-text">{content?.completionText ?? `You've released that built-up energy`}</p>
          <button className="btn-primary" onClick={onComplete} id="movement-complete">
            See My Summary
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Active movement phase
  const progressPercent = ((currentMoveIndex + (MOVEMENT_PHASES[currentMoveIndex].duration - timeRemaining) / MOVEMENT_PHASES[currentMoveIndex].duration) / MOVEMENT_PHASES.length) * 100;

  return (
    <div className="movement-container step-container">
      <div className="movement-active">
        {/* Progress Bar */}
        <div className="movement-progress slide-up">
          <div className="movement-progress-bar">
            <div className="movement-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="movement-progress-text">
            {currentMoveIndex + 1} of {MOVEMENT_PHASES.length}
          </span>
        </div>

        {/* Movement Card */}
        <div className={`movement-card slide-up-delay-1 move-${currentMove.id}`}>
          <div className="movement-icon">{currentMove.icon}</div>
          <h3 className="movement-name">{currentMove.name}</h3>
          <p className="movement-description">{currentMove.description}</p>

          {/* Countdown Timer */}
          <div className="movement-timer-container">
            <svg
              className="movement-timer-ring"
              width="100"
              height="100"
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="45" className="movement-timer-bg" />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="movement-timer-progress"
                style={{
                  strokeDasharray: `${((currentMove.duration - timeRemaining) / currentMove.duration) * 282.7} 282.7`,
                }}
              />
            </svg>
            <span className="movement-timer-text">{timeRemaining}s</span>
          </div>

          {/* Movement Dots */}
          <div className="movement-dots">
            {MOVEMENT_PHASES.map((_, index) => (
              <div
                key={index}
                className={`movement-dot ${index === currentMoveIndex ? 'active' : ''} ${
                  index < currentMoveIndex ? 'done' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Skip Option */}
        <button className="btn-escape-hatch" onClick={handleSkipMovement} id="skip-movement">
          Next Movement
        </button>
      </div>
    </div>
  );
}
