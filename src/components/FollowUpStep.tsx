import { useState, useRef, useEffect } from 'react';
import OriMessage from './OriMessage';
import './FollowUpStep.css';

interface FollowUpStepProps {
  question: string;
  userCheckin: string;
  onSubmit: (response: string) => void;
}

export default function FollowUpStep({ question, userCheckin, onSubmit }: FollowUpStepProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
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
    <div className="followup-step step-container">
      {/* Show user's previous response */}
      <div className="followup-user-message slide-up">
        <div className="user-bubble">
          <p className="body-text">{userCheckin}</p>
        </div>
        <div className="user-avatar">You</div>
      </div>

      {/* Ori's follow-up question */}
      <div className="followup-ori slide-up-delay-1">
        <OriMessage>
          <p className="heading-section">{question}</p>
        </OriMessage>
      </div>

      {/* User response input */}
      <div className="followup-input slide-up-delay-3">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your response..."
          rows={3}
          id="followup-textarea"
        />
        <div className="checkin-actions">
          <span className="body-small">
            {text.length > 0 ? `${text.length} characters` : 'Ctrl+Enter to submit'}
          </span>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={text.trim().length === 0}
            id="followup-submit"
          >
            Continue
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
