import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ChangePasswordPage() {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const hasChanges = Boolean(user && (currentPassword || newPassword || confirmPassword));
  useEffect(() => {
    if (!hasChanges) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasChanges]);

  if (!user) return <Navigate to="/login" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setError('');
    setBusy(true);
    try {
      await changePassword({ currentPassword, newPassword });
      navigate('/login', { replace: true });
    } catch {
      setError('The current password could not be verified. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand">Upserve</div>
        <h1>Update your password</h1>
        <p>Choose a new password for your Upserve account. Use a password you do not reuse elsewhere.</p>
        <label htmlFor="current-password">
          Current password
          <PasswordInput id="current-password" value={currentPassword} onChange={setCurrentPassword} visible={visible.current} onToggle={() => setVisible(value => ({ ...value, current: !value.current }))} autoComplete="current-password" />
        </label>
        <label htmlFor="new-password">
          New password
          <PasswordInput id="new-password" value={newPassword} onChange={setNewPassword} visible={visible.next} onToggle={() => setVisible(value => ({ ...value, next: !value.next }))} autoComplete="new-password" minLength={8} />
        </label>
        <PasswordGuidance password={newPassword} />
        <label htmlFor="confirm-password">
          Confirm new password
          <PasswordInput id="confirm-password" value={confirmPassword} onChange={setConfirmPassword} visible={visible.confirm} onToggle={() => setVisible(value => ({ ...value, confirm: !value.confirm }))} autoComplete="new-password" />
        </label>
        {error && <div className="error" role="alert">{error}</div>}
        <button disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
        <button type="button" className="secondary" onClick={logout}>Sign out</button>
      </form>
    </main>
  );
}

function PasswordInput({ id, value, onChange, visible, onToggle, autoComplete, minLength }: { id: string; value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void; autoComplete: string; minLength?: number }) {
  return <span className="password-field"><input id={id} type={visible ? 'text' : 'password'} value={value} onChange={event => onChange(event.target.value)} required autoComplete={autoComplete} minLength={minLength} /><button type="button" className="password-toggle" onClick={onToggle} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button></span>;
}

function PasswordGuidance({ password }: { password: string }) {
  const checks: Array<{ label: string; passed: boolean }> = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'One uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'One number or symbol', passed: /[^A-Za-z]/.test(password) },
  ];
  return <div className="password-guidance" aria-live="polite"><strong>Password guidance</strong><ul>{checks.map(({ label, passed }) => <li key={label} className={passed ? 'is-passed' : ''}>{passed ? '✓' : '○'} {label}</li>)}</ul></div>;
}
