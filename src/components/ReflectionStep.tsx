import { useEffect, useState } from 'react';
import type { StressAnalysis, RoutingResult, InterventionType } from '../types';
import OriMessage from './OriMessage';
import './ReflectionStep.css';

const INTERVENTION_DISPLAY: Record<InterventionType, { name: string; description: string; icon: string }> = {
  breathing: { name: 'Breathing Reset', description: '~1 minute · restores calm', icon: '🌬' },
  grounding: { name: 'Grounding Exercise', description: '~2 minutes · anchors presence', icon: '🫂' },
  movement: { name: 'Movement Reset', description: '~90 seconds · releases tension', icon: '🔄' },
  reframe: { name: 'Perspective Shift', description: '~3 minutes · shifts thinking', icon: '✨' },
  journaling: { name: 'Processing Prompt', description: '~5 minutes · work through it', icon: '📝' },
  rehearsal: { name: 'Mental Rehearsal', description: '~3 minutes · prepare & frame', icon: '🎯' },
};

interface ReflectionStepProps {
  analysis: StressAnalysis;
  routingResult: RoutingResult;
  chosenIntervention: InterventionType | null;
  onInterventionChoice: (intervention: InterventionType) => void;
  onContinue: () => void;
}

export default function ReflectionStep({
  analysis,
  routingResult,
  chosenIntervention,
  onInterventionChoice,
  onContinue,
}: ReflectionStepProps) {
  const [revealed, setRevealed] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const primary = routingResult.primary;
  const alternative = routingResult.alternative;
  const chosen = chosenIntervention || primary;

  const primaryInfo = INTERVENTION_DISPLAY[primary];
  const alternativeInfo = INTERVENTION_DISPLAY[alternative];
  const chosenInfo = INTERVENTION_DISPLAY[chosen];

  return (
    <div className="reflection-step step-container">
      {/* Reflection Quote */}
      <div className={`reflection-quote-container ${revealed ? 'revealed' : ''}`}>
        <span className="reflection-quote-mark">"</span>
        <p className="reflection-quote-text">{analysis.reflection}</p>
        <div className="reflection-quote-glow" />
      </div>

      {/* Transition Line — Ori bubble */}
      <div className="reflection-transition slide-up-delay-2">
        <OriMessage>
          <p className="reflection-transition-text">{analysis.transitionLine}</p>
        </OriMessage>
      </div>

      {/* Intervention Selection */}
      <div className="reflection-intervention slide-up-delay-3">
        {!showAlternatives ? (
          <>
            {/* Primary Intervention Card */}
            <div className="intervention-card primary">
              <span className="intervention-icon">{primaryInfo.icon}</span>
              <h3 className="intervention-name">{primaryInfo.name}</h3>
              <p className="intervention-description">{primaryInfo.description}</p>
              <button className="btn-primary" onClick={onContinue} id="start-intervention">
                Begin
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            </div>

            {/* Escape Hatch Button */}
            <button
              className="btn-escape-hatch"
              onClick={() => setShowAlternatives(true)}
              id="show-alternatives"
            >
              Something else?
            </button>
          </>
        ) : (
          <>
            {/* Alternative Selection Prompt */}
            <p className="alternatives-prompt">Choose what works best for you right now:</p>

            {/* Two-Card Choice */}
            <div className="intervention-choice-grid">
              {/* Primary Option */}
              <button
                className={`intervention-card choice-card ${chosen === primary ? 'selected' : ''}`}
                onClick={() => {
                  onInterventionChoice(primary);
                  setShowAlternatives(false);
                }}
              >
                <span className="intervention-icon">{primaryInfo.icon}</span>
                <h3 className="intervention-name">{primaryInfo.name}</h3>
                <p className="intervention-description">{primaryInfo.description}</p>
                {chosen === primary && <div className="selected-badge">✓ Selected</div>}
              </button>

              {/* Alternative Option */}
              <button
                className={`intervention-card choice-card ${chosen === alternative ? 'selected' : ''}`}
                onClick={() => {
                  onInterventionChoice(alternative);
                  setShowAlternatives(false);
                }}
              >
                <span className="intervention-icon">{alternativeInfo.icon}</span>
                <h3 className="intervention-name">{alternativeInfo.name}</h3>
                <p className="intervention-description">{alternativeInfo.description}</p>
                {chosen === alternative && <div className="selected-badge">✓ Selected</div>}
              </button>
            </div>

            {/* Confirm Selection */}
            <button className="btn-primary" onClick={onContinue} id="confirm-intervention">
              Begin {chosenInfo.name}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
