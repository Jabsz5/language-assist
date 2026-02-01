import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterCard() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    console.log('Create account attempt:', { username, password });

    // Temporary success path
    navigate('/login');
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
      />

      <div className="Password">Password</div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        placeholder="Enter password"
        autoComplete="new-password"
      />

      {error && <p>{error}</p>}

      <button type="submit">Create account</button>
    </form>
  );
}
