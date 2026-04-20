import { useState, useRef, useEffect } from 'react';
import OriMessage from './OriMessage';
import './CheckInStep.css';

interface CheckInStepProps {
  onSubmit: (response: string) => void;
}

export default function CheckInStep({ onSubmit }: CheckInStepProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus textarea on mount with slight delay for animation
    const timer = setTimeout(() => textareaRef.current?.focus(), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed.length > 0) {
      onSubmit(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="checkin-step step-container">
      <div className="checkin-header slide-up">
        <OriMessage>
          <p className="heading-section">What's taking up the most mental space right now?</p>
          <p className="body-small" style={{ marginTop: 'var(--space-sm)' }}>
            There's no wrong answer. Just share what comes to mind — it can be work, personal, or anything in between.
          </p>
        </OriMessage>
      </div>

      <div className="checkin-input slide-up-delay-2">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="I've been thinking about..."
          rows={4}
          id="checkin-textarea"
        />
        <div className="checkin-actions">
          <span className="body-small">
            {text.length > 0 ? `${text.length} characters` : 'Ctrl+Enter to submit'}
          </span>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={text.trim().length === 0}
            id="checkin-submit"
          >
            Share with Ori
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
