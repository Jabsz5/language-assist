import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type LoginResponse = {
  username: string;
  userId: number;
  vocabulary: {
    spanish: string[];
    russian: string[];
  };
};

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export default function LoginCard() {
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
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        setError(msg || `Login failed (${res.status})`);
        return;
      }

      const data = (await res.json()) as LoginResponse;
      // Navigate and pass session-ish info for now
      navigate('/anki', { state: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  function handleRegisterRedirect() {
    navigate('/signup');
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <h2>Login Information</h2>

      <div className="User">Username</div>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        placeholder="Enter username"
        autoComplete="username"
      />

      <div className="Password">Password</div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        placeholder="Enter password"
        autoComplete="current-password"
      />

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" disabled={busy}>
        {busy ? 'Logging in…' : 'Login'}
      </button>

      <button type="button" onClick={handleRegisterRedirect} disabled={busy}>
        Create an account here
      </button>
    </form>
  );
}
