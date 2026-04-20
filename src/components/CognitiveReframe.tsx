import { useState, useRef, useEffect } from 'react';
import type { StressAnalysis } from '../types';
import './CognitiveReframe.css';

interface CognitiveReframeProps {
  analysis: StressAnalysis;
  onComplete: (reflection?: string) => void;
}

export default function CognitiveReframe({ analysis, onComplete }: CognitiveReframeProps) {
  const [reflection, setReflection] = useState('');
  const [phase, setPhase] = useState<'prompt' | 'reflect' | 'done'>('prompt');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (phase === 'reflect') {
      const timer = setTimeout(() => textareaRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleStartReflection = () => {
    setPhase('reflect');
  };

  const handleCompleteReflection = () => {
    setPhase('done');
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleSubmit = () => {
    onComplete(reflection);
  };

  if (phase === 'done') {
    return (
      <div className="reframe step-container">
        <div className="reframe-complete slide-up">
          <div className="complete-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="heading-section slide-up-delay-1">Nicely done.</h2>
          <p className="body-text slide-up-delay-2" style={{ textAlign: 'center' }}>
            That shift in perspective is a tool you can carry with you.
            Often, just naming a different angle is enough to loosen the grip.
          </p>
          <button
            className="btn-primary slide-up-delay-3"
            onClick={handleSubmit}
            id="reframe-complete"
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
    <div className="reframe step-container">
      <div className="reframe-header slide-up">
        <div className="reframe-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>
        <span className="label">Cognitive Reframe</span>
      </div>

      <div className="reframe-prompt-card slide-up-delay-1">
        <div className="reframe-prompt-decoration" />
        <p className="reframe-prompt-text">
          {analysis.reframePrompt || `Consider: what would change about this situation if you assumed the best-case scenario was just as likely as the worst? What would you do differently in the next hour?`}
        </p>
      </div>

      {phase === 'prompt' && (
        <div className="reframe-actions slide-up-delay-2">
          <p className="body-small" style={{ textAlign: 'center' }}>
            Take a moment to sit with this question. When you're ready, you can
            jot down your thoughts.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
            <button
              className="btn-secondary"
              onClick={handleSkip}
              id="skip-reflection"
            >
              Skip to Summary
            </button>
            <button
              className="btn-primary"
              onClick={handleStartReflection}
              id="start-reflection"
            >
              Write My Thoughts
            </button>
          </div>
        </div>
      )}

      {phase === 'reflect' && (
        <div className="reframe-reflect slide-up">
          <textarea
            ref={textareaRef}
            className="input-textarea"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What comes to mind..."
            rows={4}
            id="reflection-textarea"
          />
          <button
            className="btn-primary"
            onClick={handleCompleteReflection}
            id="complete-reflection"
          >
            Done Reflecting
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
