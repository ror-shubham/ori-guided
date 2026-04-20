import type { ReactNode } from 'react';

interface OriMessageProps {
  children: ReactNode;
}

export default function OriMessage({ children }: OriMessageProps) {
  return (
    <div className="ori-bubble">
      <div className="ori-avatar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="9.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <div className="ori-message">
        <span className="ori-name">Ori</span>
        {children}
      </div>
    </div>
  );
}
