import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';
import { UserIdentity } from '../components/UserIdentity';
import { ArrowRight } from 'lucide-react';

type Json = Record<string, unknown>;

const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;
const label = (key: string) => key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, value => value.toUpperCase());
const userFields = new Set(['userId', 'clientId', 'assignedTo', 'changedBy', 'actorId']);

function useData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    apiRequest<T>(endpoint)
      .then(setData)
      .catch(error => setError(errorMessage(error, 'Unable to load data.')));
  }, [attempt, endpoint]);

  return { data, error, retry: () => { setError(''); setData(null); setAttempt(value => value + 1); } };
}

function AdminValue({ field, value }: { field: string; value: unknown }) {
  return typeof value === 'string' && userFields.has(field)
    ? <UserIdentity id={value} />
    : <>{String(value)}</>;
}

function MetricGroup({ title, data }: { title: string; data: Json }) {
  return (
    <section className="metric-group">
      <h3>{title}</h3>
      <div className="metric-grid">
        {Object.entries(data).map(([key, value]) => (
          <div className="metric" key={key}>
            <span>{label(key)}</span>
            <strong>{typeof value === 'object' ? '—' : String(value)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryPanel() {
  const { data, error, retry } = useData<Json>('/api/admin/summary');

  return (
    <section className="card admin-panel">
      <div className="section-heading">
        <h2>Global summary</h2>
        <span className="muted">Live data</span>
      </div>
      {error ? <div className="error admin-panel-error" role="alert"><span>{error}</span><button type="button" className="text-button" onClick={retry}>Try again</button></div> : !data ? <p className="muted">Loading…</p> : (
        <div>
          {Object.entries(data).map(([key, value]) => typeof value === 'object' && value ? (
            <MetricGroup key={key} title={label(key)} data={value as Json} />
          ) : (
            <section className="metric-group" key={key}>
              <h3>{label(key)}</h3>
              <div className="metric-grid"><div className="metric"><span>Total</span><strong>{String(value)}</strong></div></div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

function StatsPanel() {
  const { data, error, retry } = useData<Json>('/api/admin/system-stats');

  return (
    <section className="card admin-panel">
      <div className="section-heading">
        <h2>System statistics</h2>
        <span className="muted">Latest records</span>
      </div>
      {error ? <div className="error admin-panel-error" role="alert"><span>{error}</span><button type="button" className="text-button" onClick={retry}>Try again</button></div> : !data ? <p className="muted">Loading…</p> : (
        <div className="record-groups">
          {Object.entries(data).map(([key, value]) => (
            <div className="record-group" key={key}>
              <h3>{label(key)}</h3>
              {Array.isArray(value) && value.length ? (
                <div className="record-list">
                  {value.map((item, index) => (
                    <div className="record" key={index}>
                      {Object.entries((item || {}) as Json).slice(0, 4).map(([field, fieldValue]) => (
                        <span key={field}><b>{label(field)}:</b> <AdminValue field={field} value={fieldValue} /></span>
                      ))}
                    </div>
                  ))}
                </div>
              ) : <p className="muted">No recent records.</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function AdminOverviewPage() {
  const { user } = useAuth();

  return (
    <section className="page admin-overview-page">
      <p className="eyebrow">Administration</p>
      <h1>Admin overview</h1>
      {user?.role === 'super_admin' && <><div className="admin-grid"><SummaryPanel /><StatsPanel /></div><nav className="admin-shortcuts" aria-label="Administration shortcuts"><Link className="card admin-shortcut" to="/app/users"><strong>Manage Users</strong><span>Review identities and account status.</span><ArrowRight size={16} aria-hidden="true" /></Link><Link className="card admin-shortcut" to="/app/record-directory"><strong>Record Directory</strong><span>Trace readable cross-entity relationships.</span><ArrowRight size={16} aria-hidden="true" /></Link><Link className="card admin-shortcut" to="/app/activity-logs"><strong>Activity Logs</strong><span>Investigate the newest system events.</span><ArrowRight size={16} aria-hidden="true" /></Link><Link className="card admin-shortcut" to="/app/content"><strong>Content Management</strong><span>Maintain public blogs and portfolio work.</span><ArrowRight size={16} aria-hidden="true" /></Link></nav></>}
    </section>
  );
}
