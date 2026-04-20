import { useState } from 'react';
import type { VitalSigns, MoodLevel, EnergyLevel, WeightLocation, ContextTrigger } from '../types';
import OriMessage from './OriMessage';
import './VitalSignsStep.css';

const MOOD_LEVELS = [
  { value: 1 as MoodLevel, label: 'Struggling', descriptor: 'Heavy, low, hard to focus' },
  { value: 2 as MoodLevel, label: 'Off', descriptor: 'Not quite right, a bit flat' },
  { value: 3 as MoodLevel, label: 'Neutral', descriptor: 'Neither good nor bad' },
  { value: 4 as MoodLevel, label: 'Okay', descriptor: 'Mostly fine, small things on mind' },
  { value: 5 as MoodLevel, label: 'Good', descriptor: 'Grounded, positive, present' },
];

const ENERGY_LEVELS = [
  { value: 1 as EnergyLevel, label: 'Depleted', descriptor: 'Running on empty, foggy' },
  { value: 2 as EnergyLevel, label: 'Low', descriptor: 'Slow, tired, effortful' },
  { value: 3 as EnergyLevel, label: 'Moderate', descriptor: 'Getting through it' },
  { value: 4 as EnergyLevel, label: 'Charged', descriptor: 'Alert, capable, engaged' },
  { value: 5 as EnergyLevel, label: 'Energised', descriptor: 'Sharp, ready, in flow' },
];

const WEIGHT_OPTIONS: { value: WeightLocation; label: string; sublabel: string }[] = [
  { value: 'head', label: 'In my head', sublabel: 'ruminating, looping thoughts' },
  { value: 'body', label: 'In my body', sublabel: 'tense, restless, physical discomfort' },
  { value: 'both', label: 'Both equally', sublabel: '' },
];

const CONTEXT_OPTIONS: { value: ContextTrigger; label: string; sublabel: string }[] = [
  { value: 'before', label: 'Before something', sublabel: 'meeting, presentation, difficult conversation' },
  { value: 'during', label: 'During a stretch', sublabel: 'hours into deep work, back-to-back calls' },
  { value: 'after', label: 'After something', sublabel: 'hard conversation, draining task, bad news' },
  { value: 'general', label: 'General check-in', sublabel: 'no specific trigger' },
];

interface VitalSignsStepProps {
  onSubmit: (vitals: VitalSigns) => void;
}

export default function VitalSignsStep({ onSubmit }: VitalSignsStepProps) {
  const [mood, setMood] = useState<MoodLevel>(3);
  const [energy, setEnergy] = useState<EnergyLevel>(3);
  const [weightLocation, setWeightLocation] = useState<WeightLocation | null>(null);
  const [contextTrigger, setContextTrigger] = useState<ContextTrigger | null>(null);

  const canSubmit = weightLocation !== null && contextTrigger !== null;

  const moodData = MOOD_LEVELS[mood - 1];
  const energyData = ENERGY_LEVELS[energy - 1];

  const moodFill = ((mood - 1) / 4) * 100;
  const energyFill = ((energy - 1) / 4) * 100;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ mood, energy, weightLocation, contextTrigger });
  };

  return (
    <div className="vitals-step step-container">
      <div className="vitals-header slide-up">
        <OriMessage>
          <p className="heading-section">Before we get into it — a quick read on where you are right now.</p>
        </OriMessage>
      </div>

      <div className="vitals-form slide-up-delay-1">

        {/* Mood */}
        <div className="vital-section">
          <span className="vital-label">Mood</span>
          <div className="slider-display">
            <span className="slider-value-label">{moodData.label}</span>
            <span className="slider-value-descriptor">{moodData.descriptor}</span>
          </div>
          <div className="slider-wrapper">
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={mood}
              onChange={(e) => setMood(Number(e.target.value) as MoodLevel)}
              className="vital-slider"
              style={{ '--fill': `${moodFill}%` } as React.CSSProperties}
              aria-label="Mood level"
            />
            <div className="slider-ticks">
              {MOOD_LEVELS.map((m) => (
                <span
                  key={m.value}
                  className={`slider-tick ${m.value < mood ? 'filled' : m.value === mood ? 'current' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Energy */}
        <div className="vital-section">
          <span className="vital-label">Energy</span>
          <div className="slider-display">
            <span className="slider-value-label">{energyData.label}</span>
            <span className="slider-value-descriptor">{energyData.descriptor}</span>
          </div>
          <div className="slider-wrapper">
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value) as EnergyLevel)}
              className="vital-slider"
              style={{ '--fill': `${energyFill}%` } as React.CSSProperties}
              aria-label="Energy level"
            />
            <div className="slider-ticks">
              {ENERGY_LEVELS.map((e) => (
                <span
                  key={e.value}
                  className={`slider-tick ${e.value < energy ? 'filled' : e.value === energy ? 'current' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Weight location */}
        <div className="vital-section">
          <span className="vital-label">Where is the weight?</span>
          <div className="option-group">
            {WEIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`option-btn ${weightLocation === opt.value ? 'selected' : ''}`}
                onClick={() => setWeightLocation(opt.value)}
              >
                <span className="option-label">{opt.label}</span>
                {opt.sublabel && <span className="option-sublabel">{opt.sublabel}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Context trigger */}
        <div className="vital-section">
          <span className="vital-label">What's the context?</span>
          <div className="option-group">
            {CONTEXT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`option-btn ${contextTrigger === opt.value ? 'selected' : ''}`}
                onClick={() => setContextTrigger(opt.value)}
              >
                <span className="option-label">{opt.label}</span>
                {opt.sublabel && <span className="option-sublabel">{opt.sublabel}</span>}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="vitals-actions slide-up-delay-2">
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          id="vitals-submit"
        >
          Continue
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
        {!canSubmit && (
          <p className="vitals-hint">Select where you feel the weight and what's brought you here</p>
        )}
      </div>
    </div>
  );
}
