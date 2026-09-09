import { useEffect, useMemo, useState } from 'react';
import { ApiError, apiRequest } from '../services/apiClient';
import { authApi } from '../services/authApi';
import type { User, UserRole } from '../types/auth';
import { useConfirm } from '../components/ui';
import { useAuth } from '../context/AuthContext';

type DirectoryUser = User & { isActive?: boolean };
type ReferenceData = { users?: DirectoryUser[] };
const roleLabel = (role: UserRole) => role === 'super_admin' ? 'Super Admin' : role === 'sub_admin' ? 'Sub Admin' : 'Client';
const errorMessage = (error: unknown, fallback: string) => error instanceof ApiError ? error.message : error instanceof Error ? error.message : fallback;

export function ManageUsersPage() {
  const confirm = useConfirm();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [sub, setSub] = useState({ name: '', email: '', phone: '' });
  const [busyId, setBusyId] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [temporary, setTemporary] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  async function loadUsers() {
    setLoading(true); setError('');
    try { const data = await apiRequest<ReferenceData>('/api/admin/reference-data'); setUsers(data.users || []); }
    catch (value) { setError(errorMessage(value, 'Unable to load users.')); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadUsers(); }, []);
  const visibleUsers = useMemo(() => users.filter(item => {
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || [item.name, item.email, roleLabel(item.role)].some(value => value.toLowerCase().includes(needle));
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'inactive' ? item.isActive === false : item.isActive !== false);
    return matchesQuery && matchesStatus;
  }), [query, statusFilter, users]);
  const activeCount = users.filter(item => item.isActive !== false).length;
  const inactiveCount = users.length - activeCount;

  async function createSubAdmin() {
    setBusy(true); setError(''); setSuccess(''); setTemporary('');
    try {
      const response = await authApi.createSubAdmin({ ...sub, phone: sub.phone || undefined });
      setTemporary(response.temporary_password); setSub({ name: '', email: '', phone: '' });
      setSuccess('Sub Admin created. Welcome email sent with the login details.'); await loadUsers();
    } catch (value) { setError(errorMessage(value, 'Unable to create Sub Admin.')); }
    finally { setBusy(false); }
  }

  async function updateStatus(user: DirectoryUser) {
    const next = user.isActive === false;
    if (user.id === currentUser?.id) { setError('Your own account cannot be deactivated from this screen.'); return; }
    if (!(await confirm({ title: `${next ? 'Activate' : 'Deactivate'} account`, message: `${next ? 'This restores' : 'This removes'} ${user.name}’s workspace access.`, destructive: !next }))) return;
    setBusyId(user.id); setError(''); setSuccess('');
    try { const updated = await authApi.updateUserStatus(user.id, next); setUsers(current => current.map(item => item.id === user.id ? { ...item, ...updated, isActive: next } : item)); setSuccess(`${user.name} is now ${next ? 'active' : 'inactive'}.`); }
    catch (value) { setError(errorMessage(value, 'Unable to update account status.')); }
    finally { setBusyId(''); }
  }

  return <section className="page manage-users-page">
    <p className="eyebrow">Administration</p><div className="page-heading"><div><h1>Manage users</h1><p className="muted">Review account identity and status without exposing sensitive credentials.</p></div><button className="secondary" onClick={() => void loadUsers()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh users'}</button></div>
    {error && <div className="error" role="alert">{error}</div>}{success && <div className="success" role="status">{success}</div>}
    <div className="admin-grid"><form className="form-card" onSubmit={event => { event.preventDefault(); void createSubAdmin(); }}><h2>Create Sub Admin</h2><p className="muted">The new account must change its temporary password.</p><label>Name<input required value={sub.name} onChange={event => setSub({ ...sub, name: event.target.value })} /></label><label>Email<input required type="email" value={sub.email} onChange={event => setSub({ ...sub, email: event.target.value })} /></label><label>Phone <span className="optional">Optional</span><input type="tel" value={sub.phone} onChange={event => setSub({ ...sub, phone: event.target.value })} /></label><button disabled={busy}>{busy ? 'Creating…' : 'Create Sub Admin'}</button>{temporary && <div className="temporary-credential"><strong>Temporary password</strong><code>{temporary}</code><small>Displayed once and not stored by the frontend.</small></div>}</form></div>
    <section className="card admin-panel user-directory-panel"><div className="section-heading"><div><p className="eyebrow">Identity directory</p><h2>Users</h2><p className="muted">Account status changes are recorded without deleting history.</p></div><div className="user-directory-counts"><span><strong>{users.length}</strong> total</span><span className="account-status active"><strong>{activeCount}</strong> active</span><span className="account-status inactive"><strong>{inactiveCount}</strong> inactive</span></div></div>{!loading && users.length > 0 && <div className="user-directory-toolbar"><label>Search users<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, email or role" /></label><label>Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div>}{loading ? <div className="screen-state">Loading users…</div> : visibleUsers.length ? <div className="table-wrap"><table className="user-directory-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{visibleUsers.map(item => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.email}</small></td><td data-label="Role"><span className="role-badge">{roleLabel(item.role)}</span></td><td data-label="Status"><span className={`account-status ${item.isActive === false ? 'inactive' : 'active'}`}>{item.isActive === false ? 'Inactive' : 'Active'}</span></td><td data-label="Action">{item.id === currentUser?.id ? <span className="muted">Current account</span> : <button className="secondary" disabled={busyId === item.id} onClick={() => void updateStatus(item)}>{busyId === item.id ? 'Updating…' : item.isActive === false ? 'Activate' : 'Deactivate'}</button>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><h3>{users.length ? 'No matching users' : 'No users found'}</h3><p>{users.length ? 'Try a different search or status filter.' : 'Users will appear here when accounts are available.'}</p></div>}</section>
  </section>;
}
