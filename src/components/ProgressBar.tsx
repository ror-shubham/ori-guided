import './ProgressBar.css';
import type { Step } from '../types';

const STEPS: { key: Step; label: string }[] = [
  { key: 'welcome', label: 'Welcome' },
  { key: 'vitals', label: 'Snapshot' },
  { key: 'checkin', label: 'Check-in' },
  { key: 'followup', label: 'Follow-up' },
  { key: 'reflection', label: 'Insight' },
  { key: 'intervention', label: 'Reset' },
  { key: 'card', label: 'Summary' },
];

interface ProgressBarProps {
  currentStep: Step;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progress = currentIndex <= 0 ? 0 : (currentIndex / (STEPS.length - 1)) * 100;

  if (currentStep === 'welcome') return null;

  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-dots">
        {STEPS.slice(1).map((step, i) => (
          <div
            key={step.key}
            className={`progress-dot ${i + 1 <= currentIndex ? 'completed' : ''} ${i + 1 === currentIndex ? 'active' : ''}`}
            title={step.label}
          >
            <span className="progress-dot-inner" />
          </div>
        ))}
      </div>
    </div>
  );
}
