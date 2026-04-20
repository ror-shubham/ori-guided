import { useState, useEffect, useCallback } from 'react';
import type { InterventionContent } from '../types';
import './BreathingExercise.css';

interface BreathingExerciseProps {
  content?: InterventionContent;
  onComplete: () => void;
}

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const PHASES: { phase: BreathPhase; label: string; duration: number }[] = [
  { phase: 'inhale', label: 'Breathe In', duration: 4 },
  { phase: 'hold-in', label: 'Hold', duration: 4 },
  { phase: 'exhale', label: 'Breathe Out', duration: 4 },
  { phase: 'hold-out', label: 'Hold', duration: 4 },
];

const TOTAL_CYCLES = 3;

export default function BreathingExercise({ content, onComplete }: BreathingExerciseProps) {
  const [started, setStarted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [countdown, setCountdown] = useState(4);
  const [finished, setFinished] = useState(false);

  const currentPhase = PHASES[phaseIndex];

  const advancePhase = useCallback(() => {
    const nextPhaseIndex = (phaseIndex + 1) % PHASES.length;

    if (nextPhaseIndex === 0) {
      // Completed a full cycle
      if (cycle >= TOTAL_CYCLES) {
        setFinished(true);
        return;
      }
      setCycle((c) => c + 1);
    }

    setPhaseIndex(nextPhaseIndex);
    setCountdown(PHASES[nextPhaseIndex].duration);
  }, [phaseIndex, cycle]);

  useEffect(() => {
    if (!started || finished) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          advancePhase();
          return PHASES[(phaseIndex + 1) % PHASES.length].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, finished, phaseIndex, advancePhase]);

  if (!started) {
    return (
      <div className="breathing-exercise step-container">
        <div className="breathing-intro slide-up">
          <div className="breathing-orb-preview">
            <div className="breathing-circle static" />
          </div>
          <h2 className="heading-section slide-up-delay-1">Box Breathing</h2>
          <p className="body-text slide-up-delay-2" style={{ textAlign: 'center', maxWidth: '380px' }}>
            {content?.introText ?? `A 4-4-4-4 breathing pattern used by Navy SEALs and elite performers
            to rapidly calm the nervous system. We'll do ${TOTAL_CYCLES} cycles together.`}
          </p>
          <button
            className="btn-primary slide-up-delay-3"
            onClick={() => setStarted(true)}
            id="start-breathing"
          >
            I'm Ready
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="breathing-exercise step-container">
        <div className="breathing-complete slide-up">
          <div className="complete-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="heading-section slide-up-delay-1">Well done.</h2>
          <p className="body-text slide-up-delay-2" style={{ textAlign: 'center' }}>
            {content?.completionText ?? `You just gave your nervous system a reset.
            Notice how your body feels right now.`}
          </p>
          <button
            className="btn-primary slide-up-delay-3"
            onClick={onComplete}
            id="breathing-complete"
          >
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
    <div className="breathing-exercise step-container">
      <div className="breathing-active">
        <div className="breathing-cycle-label label">
          Cycle {cycle} of {TOTAL_CYCLES}
        </div>

        <div className="breathing-visual">
          <div className={`breathing-circle ${currentPhase.phase}`}>
            <span className="breathing-countdown">{countdown}</span>
          </div>
          <div className={`breathing-ring ${currentPhase.phase}`} />
        </div>

        <div className="breathing-phase-label">
          <h2 className="heading-display">{currentPhase.label}</h2>
        </div>

        <div className="breathing-phase-dots">
          {PHASES.map((p, i) => (
            <span
              key={p.phase}
              className={`breathing-phase-dot ${i === phaseIndex ? 'active' : ''} ${i < phaseIndex ? 'done' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
