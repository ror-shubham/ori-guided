import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onBegin: () => void;
  onOpenHistory: () => void;
}

export default function WelcomeScreen({ onBegin, onOpenHistory }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen step-container">
      <div className="welcome-orb-container slide-up">
        <div className="welcome-orb">
          <div className="welcome-orb-ring" />
          <div className="welcome-orb-core" />
          <div className="welcome-orb-pulse" />
        </div>
      </div>

      <div className="welcome-content">
        <p className="welcome-badge slide-up-delay-1">
          <span className="welcome-badge-dot" />
          Stress Snapshot
        </p>

        <h1 className="heading-display slide-up-delay-2">
          Take a breath.<br />
          <span className="welcome-highlight">Let's check in.</span>
        </h1>

        <p className="body-text slide-up-delay-3" style={{ maxWidth: '380px', margin: '0 auto' }}>
          A 3-minute guided check-in with Ori, your AI wellbeing coach. 
          We'll identify your current stress pattern and guide you through a personalized reset.
        </p>

        <button
          className="btn-primary slide-up-delay-4"
          onClick={onBegin}
          id="begin-checkin"
        >
          Begin Check-in
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>

        <button
          className="btn-secondary slide-up-delay-4"
          onClick={onOpenHistory}
          id="open-history"
        >
          View History
        </button>
      </div>

      <p className="welcome-footer body-small slide-up-delay-4">
        Powered by WONE · Walking on Earth
      </p>
    </div>
  );
}
