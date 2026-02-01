import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginCard() {
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

    console.log('Login attempt:', { username, password });

    // Temporary success path
    navigate('/anki');
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

      <button type="submit">Login</button>
      <button type="button" onClick={handleRegisterRedirect}> Create an account here </button>  
    </form>
  );
}
