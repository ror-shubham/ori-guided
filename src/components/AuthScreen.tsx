import { useState } from 'react';
import { AuthError, login, register } from '../services/auth';
import './AuthScreen.css';

interface Props {
  onAuth: () => void;
}

type Tab = 'login' | 'register';

function flattenErrors(detail: Record<string, unknown>): string {
  return Object.values(detail)
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .join(' ');
}

export default function AuthScreen({ onAuth }: Props) {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (tab === 'register' && password !== password2) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, password2);
      }
      onAuth();
    } catch (err) {
      if (err instanceof AuthError) {
        setError(flattenErrors(err.detail) || `Error ${err.status}.`);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo">
        <div className="auth-orb" />
        <span className="auth-brand">ori</span>
      </div>

      <div className="auth-tabs">
        <button
          className={`auth-tab${tab === 'login' ? ' active' : ''}`}
          onClick={() => { setTab('login'); setError(''); }}
          type="button"
        >
          Sign in
        </button>
        <button
          className={`auth-tab${tab === 'register' ? ' active' : ''}`}
          onClick={() => { setTab('register'); setError(''); }}
          type="button"
        >
          Create account
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            className="auth-input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            className="auth-input"
            type="password"
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {tab === 'register' && (
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password2">Confirm password</label>
            <input
              id="auth-password2"
              className="auth-input"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <button
          className="btn-primary auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Please wait…'
            : tab === 'login'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>
    </div>
  );
}
