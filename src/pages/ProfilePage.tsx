import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasChanges = Boolean(user && (name !== user.name || phone !== (user.phone || '')));
  useEffect(() => {
    if (!hasChanges) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasChanges]);

  if (!user) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be blank.');
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const updated = await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
      });
      setSuccess('Profile updated successfully.');
      updateUser(updated);
      setName(updated.name);
      setPhone(updated.phone || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update profile.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <p className="eyebrow">Account</p>
      <h1>Update profile</h1>
      <p className="page-lede">Keep your contact details current so your team knows how to reach you.</p>
      <form className="form-card profile-form" onSubmit={submit}>
        <p className="muted">Update your account information. Email and role cannot be changed here.</p>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Email
          <input value={user.email} disabled />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        {error && <div className="error" role="alert">{error}</div>}
        {success && <div className="success" role="status">{success}</div>}
        <button disabled={busy || !hasChanges}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </section>
  );
}
