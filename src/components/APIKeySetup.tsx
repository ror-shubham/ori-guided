import { useState } from 'react';
import { setLLMConfig } from '../services/llm';
import type { LLMProvider } from '../types';
import './APIKeySetup.css';

interface APIKeySetupProps {
  onConfigured: () => void;
}

export default function APIKeySetup({ onConfigured }: APIKeySetupProps) {
  const [provider, setProvider] = useState<LLMProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsSubmitting(true);
    try {
      setLLMConfig(provider, apiKey.trim());
      onConfigured();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="api-setup-screen step-container">
      <div className="api-setup-orb-container slide-up">
        <div className="api-setup-orb">
          <div className="api-setup-orb-ring" />
          <div className="api-setup-orb-core" />
          <div className="api-setup-orb-pulse" />
        </div>
      </div>

      <div className="api-setup-content">
        <p className="api-setup-badge slide-up-delay-1">
          <span className="api-setup-badge-dot" />
          Configuration
        </p>

        <h1 className="heading-display slide-up-delay-2">
          Let's get started.<br />
          <span className="api-setup-highlight">Configure your LLM</span>
        </h1>

        <p className="body-text slide-up-delay-3" style={{ maxWidth: '420px', margin: '0 auto' }}>
          Choose your preferred AI provider and enter your API key to begin your personalized wellness journey with Ori.
        </p>

        <form onSubmit={handleSubmit} className="api-setup-form slide-up-delay-4">
          <div className="form-group">
            <label htmlFor="provider" className="form-label">
              AI Provider
            </label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as LLMProvider)}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI GPT-4o mini</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey" className="form-label">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              placeholder={
                provider === 'gemini'
                  ? 'Enter your Gemini API key'
                  : 'Enter your OpenAI API key'
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="form-input"
              disabled={isSubmitting}
              autoComplete="off"
            />
            <p className="form-hint">
              {provider === 'gemini'
                ? 'Get your key from Google AI Studio (ai.google.dev)'
                : 'Get your key from OpenAI (platform.openai.com/api-keys)'}
            </p>
          </div>

          {error && (
            <div className="error-message slide-up">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="8" r="7" />
                <path d="M8 4v4M8 12h0.01" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary api-setup-submit"
            disabled={isSubmitting || !apiKey.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Get Started'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </form>
      </div>

      <p className="api-setup-footer body-small slide-up-delay-4">
        Powered by WONE · Walking on Earth
      </p>
    </div>
  );
}
