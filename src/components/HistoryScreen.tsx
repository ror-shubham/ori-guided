import { useEffect, useState } from 'react';
import type { CheckInRecord, InterventionType, LLMFlag } from '../types';
import { fetchHistory } from '../services/llm';
import './HistoryScreen.css';

const INTERVENTION_LABELS: Record<InterventionType, string> = {
  breathing: 'Box Breathing',
  grounding: 'Grounding',
  movement: 'Movement',
  reframe: 'Reframe',
  journaling: 'Journaling',
  rehearsal: 'Rehearsal',
};

const FLAG_LABELS: Record<LLMFlag, string> = {
  overwhelm: 'Overwhelm',
  rumination: 'Rumination',
  fatigue: 'Fatigue',
  tension: 'Tension',
  neutral: 'Neutral',
};

interface HistoryScreenProps {
  onClose: () => void;
}

function MoodDots({ value, color }: { value: number; color: string }) {
  return (
    <span className="history-dots" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="history-dot"
          style={{ background: i < value ? color : undefined }}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function HistoryScreen({ onClose }: HistoryScreenProps) {
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory()
      .then(setRecords)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <div className="history-screen step-container slide-up">
      <div className="history-header">
        <h2 className="heading-section">Your Check-ins</h2>
        <button className="btn-secondary history-close" onClick={onClose} type="button">
          Close
        </button>
      </div>

      {loading && (
        <div className="history-state body-text">Loading…</div>
      )}

      {error && (
        <div className="history-state body-text history-error">{error}</div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="history-empty">
          <p className="body-text">No check-ins yet.</p>
          <p className="body-small">Complete your first session to see it here.</p>
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <ul className="history-list">
          {records.map(r => (
            <li key={r.id} className="history-item card">
              <button
                className="history-row"
                onClick={() => toggle(r.id)}
                type="button"
                aria-expanded={expandedId === r.id}
              >
                <div className="history-row-meta">
                  <span className="body-small history-date">{formatDate(r.created_at)}</span>
                  <div className="history-row-signals">
                    <span className="history-signal-label body-small">Mood</span>
                    <MoodDots value={r.mood} color="var(--accent-primary)" />
                    <span className="history-signal-label body-small">Energy</span>
                    <MoodDots value={r.energy} color="#6b9fd4" />
                  </div>
                </div>
                <div className="history-row-badges">
                  <span className="history-badge history-badge-intervention">
                    {INTERVENTION_LABELS[r.intervention_type]}
                  </span>
                  <span className={`history-badge history-badge-flag history-flag-${r.llm_flag}`}>
                    {FLAG_LABELS[r.llm_flag]}
                  </span>
                  <span className="history-chevron">{expandedId === r.id ? '▲' : '▼'}</span>
                </div>
              </button>

              {expandedId === r.id && (
                <div className="history-detail">
                  {r.checkin_response && (
                    <div className="history-detail-section">
                      <span className="history-detail-label">What was on your mind</span>
                      <p className="body-text">{r.checkin_response}</p>
                    </div>
                  )}
                  {r.follow_up_question && r.follow_up_response && (
                    <div className="history-detail-section">
                      <span className="history-detail-label">Follow-up</span>
                      <p className="body-small history-detail-question">{r.follow_up_question}</p>
                      <p className="body-text">{r.follow_up_response}</p>
                    </div>
                  )}
                  {r.reflection && (
                    <div className="history-detail-section">
                      <span className="history-detail-label">Ori's reflection</span>
                      <p className="body-text">{r.reflection}</p>
                    </div>
                  )}
                  {r.session_insight && (
                    <div className="history-detail-section">
                      <span className="history-detail-label">Session insight</span>
                      <p className="body-text">{r.session_insight}</p>
                    </div>
                  )}
                  {r.prescription_quote && (
                    <div className="history-detail-section history-detail-quote">
                      <span className="history-detail-label">Prescription</span>
                      <blockquote className="body-text">"{r.prescription_quote}"</blockquote>
                      {r.tip && <p className="body-small history-detail-tip">Tip: {r.tip}</p>}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
