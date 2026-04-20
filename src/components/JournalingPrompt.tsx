import { useState, useRef, useEffect } from 'react';
import './JournalingPrompt.css';

type JournalPhase = 'prompt' | 'journal' | 'done';

const JOURNAL_PROMPTS = [
  {
    id: 'what-happened',
    title: 'What happened?',
    icon: '📋',
    prompt: 'Describe the event or situation that happened.',
    placeholder: 'Take your time to write what occurred...',
  },
  {
    id: 'how-felt',
    title: 'How did it make you feel?',
    icon: '💭',
    prompt: 'What emotions came up for you?',
    placeholder: 'What emotions did you experience...',
  },
  {
    id: 'what-matters',
    title: 'What matters most about this?',
    icon: '🎯',
    prompt: 'What part of this feels most important?',
    placeholder: 'What feels most significant...',
  },
  {
    id: 'next-step',
    title: 'What\'s one small step forward?',
    icon: '➡️',
    prompt: 'What could you do to move past this?',
    placeholder: 'One thing you could do...',
  },
];

interface JournalingPromptProps {
  onComplete: (summary?: string) => void;
}

export default function JournalingPrompt({ onComplete }: JournalingPromptProps) {
  const [phase, setPhase] = useState<JournalPhase>('prompt');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>(Array(JOURNAL_PROMPTS.length).fill(''));
  const [reflection, setReflection] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentPrompt = JOURNAL_PROMPTS[currentPromptIndex];

  // Auto-focus textarea when entering journal phase
  useEffect(() => {
    if (phase === 'journal') {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [phase, currentPromptIndex]);

  const handleStartJournaling = () => {
    setPhase('journal');
  };

  const handleSkip = () => {
    setPhase('done');
  };

  const handleComplete = () => {
    const summary = responses.filter((r) => r.trim().length > 0).join('\n\n');
    onComplete(summary || undefined);
  };

  const handleDone = () => {
    if (currentPromptIndex < JOURNAL_PROMPTS.length - 1) {
      // Save current response and move to next prompt
      const newResponses = [...responses];
      newResponses[currentPromptIndex] = reflection;
      setResponses(newResponses);
      setCurrentPromptIndex(currentPromptIndex + 1);
      setReflection('');
    } else {
      // All prompts complete
      setPhase('done');
    }
  };

  const handleSkipPrompt = () => {
    if (currentPromptIndex < JOURNAL_PROMPTS.length - 1) {
      const newResponses = [...responses];
      newResponses[currentPromptIndex] = reflection;
      setResponses(newResponses);
      setCurrentPromptIndex(currentPromptIndex + 1);
      setReflection('');
    } else {
      setPhase('done');
    }
  };

  const allCompleted = responses.some((r) => r.trim().length > 0);

  if (phase === 'prompt') {
    return (
      <div className="journaling-container step-container">
        <div className="journaling-intro slide-up">
          <span className="journaling-icon-large">📝</span>
          <h2 className="heading-section">Processing Prompt</h2>
          <p className="body-text">Work through what happened</p>
          <p className="body-small">
            Writing helps process difficult experiences. Answer the prompts at your own pace, or skip what feels too much right now.
          </p>
          <div className="journaling-intro-actions">
            <button className="btn-primary" onClick={handleStartJournaling} id="start-journaling">
              Begin Writing
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
            <button className="btn-secondary" onClick={handleSkip} id="skip-journaling">
              Skip to Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'journal') {
    const progressPercent = ((currentPromptIndex + 1) / JOURNAL_PROMPTS.length) * 100;

    return (
      <div className="journaling-container step-container">
        <div className="journaling-journal">
          {/* Progress Bar */}
          <div className="journaling-progress-container slide-up">
            <div className="journaling-progress-bar">
              <div className="journaling-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="journaling-progress-text">
              {currentPromptIndex + 1} of {JOURNAL_PROMPTS.length}
            </span>
          </div>

          {/* Current Prompt */}
          <div className="journaling-prompt-card slide-up-delay-1">
            <div className="journaling-prompt-icon">{currentPrompt.icon}</div>
            <h3 className="journaling-prompt-title">{currentPrompt.title}</h3>
            <p className="journaling-prompt-text">{currentPrompt.prompt}</p>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              className="input-textarea journaling-textarea"
              placeholder={currentPrompt.placeholder}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              id={`journal-prompt-${currentPrompt.id}`}
            />

            {/* Actions */}
            <div className="journaling-prompt-actions">
              <button className="btn-secondary" onClick={handleSkipPrompt} id="skip-prompt">
                Skip This
              </button>
              <button className="btn-primary" onClick={handleDone} id="next-prompt">
                {currentPromptIndex === JOURNAL_PROMPTS.length - 1 ? 'Done' : 'Next'}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Prompt Progress Dots */}
          <div className="journaling-prompt-dots slide-up-delay-2">
            {JOURNAL_PROMPTS.map((_, index) => (
              <div
                key={index}
                className={`journaling-dot ${index === currentPromptIndex ? 'active' : ''} ${
                  index < currentPromptIndex && responses[index] ? 'done' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Done phase
  return (
    <div className="journaling-container step-container">
      <div className="journaling-complete slide-up">
        <div className="complete-icon warm">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="22" />
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="heading-section">You've processed this</h2>
        <p className="body-text">
          {allCompleted
            ? "Thank you for taking the time to work through this. What you've shared is important."
            : "Sometimes the hardest part is starting. You've shown up for yourself."}
        </p>
        <button className="btn-primary" onClick={handleComplete} id="journaling-complete">
          See My Summary
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
