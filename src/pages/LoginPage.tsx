import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';

export function LoginPage() {
  const { user, login, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to={user.mustChangePassword ? '/change-password' : '/app'} replace />;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const signedInUser = await login({ email, password });
      navigate(signedInUser.mustChangePassword ? '/change-password' : '/app', {
        replace: true,
      });
    } catch {
      setError('The email or password is incorrect, or the account is inactive.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand"><BrandLogo /></div>
        <h1>Welcome back</h1>
        <p>Sign in to your workspace.</p>
        {sessionExpired && <div className="auth-notice" role="status">Your session expired. Please sign in again to continue.</div>}
        <label htmlFor="login-email">
          Email
          <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        </label>
        <label htmlFor="login-password">
          Password
          <span className="password-field"><input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /><button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button></span>
        </label>
        {error && <div className="error" role="alert">{error}</div>}
        <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="auth-footnote">Your workspace access is protected by your account role.</p>
      </form>
    </main>
  );
}
