import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export default function RegisterCard() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setError('Username and password are required');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        setError(msg || `Signup failed (${res.status})`);
        return;
      }

      // success
      // (optional) clear fields
      setPassword('');

      // go back to login page
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <h2>Create an account here</h2>

      <div className="User">Username</div>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        placeholder="Enter username"
        autoComplete="username"
        disabled={busy}
      />

      <div className="Password">Password</div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        placeholder="Enter password"
        autoComplete="new-password"
        disabled={busy}
      />

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" disabled={busy}>
        {busy ? 'Creating…' : 'Create account'}
      </button>

      {/* Optional: quick back link */}
      <button type="button" onClick={() => navigate('/login')} disabled={busy}>
        Back to login
      </button>
    </form>
  );
}
