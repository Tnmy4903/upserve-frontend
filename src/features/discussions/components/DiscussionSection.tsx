import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../services/apiClient';
import { discussionApi } from '../services/discussionApi';
import type { DiscussionMessage } from '../types';
import { useConfirm } from '../../../components/ui';

const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Unable to load project discussions.';
const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const roleName = (role?: string | null) => role ? role.replaceAll('_', ' ') : 'Project member';
const initials = (name: string) => name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();

export function DiscussionSection({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const canDelete = user?.role === 'super_admin';
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draft, setDraft] = useState(() => typeof window === 'undefined' ? '' : window.sessionStorage.getItem(`upserve.discussion-draft:${projectId}`) || '');
  const [replyFor, setReplyFor] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (draft) window.sessionStorage.setItem(`upserve.discussion-draft:${projectId}`, draft);
    else window.sessionStorage.removeItem(`upserve.discussion-draft:${projectId}`);
  }, [draft, projectId]);

  useEffect(() => {
    if (!draft || typeof window === 'undefined') return undefined;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [draft]);

  async function refresh() {
    setLoading(true); setError('');
    try { setMessages((await discussionApi.list(projectId)).filter(item => !item.isSystemMessage && !item.isDeleted)); }
    catch (value) { setError(errorMessage(value)); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, [projectId]);
  useEffect(() => { document.body.classList.toggle('discussion-admin', user?.role === 'super_admin'); return () => document.body.classList.remove('discussion-admin'); }, [user?.role]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault(); const message = draft.trim(); if (!message) return;
    setBusy(true); setPendingAction('Sending message'); setError(''); setSuccess('');
    try { await discussionApi.create(projectId, message); setDraft(''); await refresh(); setSuccess('Message sent.'); }
    catch (value) { setError(errorMessage(value)); }
    finally { setBusy(false); setPendingAction(''); }
  }

  async function sendReply(event: FormEvent, messageId: string) {
    event.preventDefault(); const message = (replyDrafts[messageId] || '').trim(); if (!message) return;
    setBusy(true); setPendingAction('Sending reply'); setError('');
    try { await discussionApi.reply(messageId, message); setReplyDrafts(previous => ({ ...previous, [messageId]: '' })); setReplyFor(''); await refresh(); setSuccess('Reply sent.'); }
    catch (value) { setError(errorMessage(value)); }
    finally { setBusy(false); setPendingAction(''); }
  }

  async function remove(item: DiscussionMessage) {
    if (!(await confirm({ title: 'Remove message', message: 'This message will be permanently removed for everyone.', destructive: true }))) return;
    setBusy(true); setPendingAction('Removing message'); setError('');
    try { await discussionApi.remove(item.id); await refresh(); setSuccess('Message removed.'); }
    catch (value) { setError(errorMessage(value)); }
    finally { setBusy(false); setPendingAction(''); }
  }

  const reply = (id: string, value: string) => setReplyDrafts(previous => ({ ...previous, [id]: value }));

  return <section className="card phase8-section discussion-section">
    <div className="section-heading phase8-heading discussion-heading"><div><p className="eyebrow">Project communication</p><h2>Project chat</h2><p className="muted">Keep decisions, questions and project updates together.</p></div><span className="discussion-status"><span aria-hidden="true" /> Shared with project team</span></div>
    {error && <div className="error" role="alert">{error}<button className="secondary" onClick={() => void refresh()} disabled={busy}>Retry</button></div>}
    {success && <div className="success" role="status">{success}</div>}
    <div className="discussion-chat-shell">
      {loading ? <div className="section-loading">Loading conversation…</div> : messages.length === 0 ? <div className="discussion-empty"><div className="discussion-empty-icon" aria-hidden="true">✦</div><h3>Start the project conversation</h3><p>Ask a question, share an update or leave a decision for the team.</p></div> : <div className="discussion-list" aria-live="polite">{messages.map(item => <article className={`discussion-message ${item.authorId === user?.id ? 'discussion-own-message' : ''} ${item.isDeleted ? 'discussion-deleted-message' : ''}`} key={item.id}><div className="avatar" aria-hidden="true">{initials(item.authorName)}</div><div className="discussion-content"><div className="discussion-meta"><strong>{item.authorName}</strong><span className="discussion-role">{roleName(item.authorRole)}</span><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></div><div className="discussion-bubble">{item.isDeleted ? <p className="deleted-copy">This message was removed.</p> : <p className="discussion-copy">{item.message}</p>}</div>{item.replies.length > 0 && <div className="reply-list" aria-label={`Replies to ${item.authorName}`}>{item.replies.map(replyItem => <div className="reply-item" key={replyItem.id}><div className="discussion-meta"><strong>{replyItem.authorName}</strong><span className="discussion-role">{roleName(replyItem.authorRole)}</span><time dateTime={replyItem.createdAt}>{formatDate(replyItem.createdAt)}</time></div><p className="discussion-copy">{replyItem.message}</p></div>)}</div>}{!item.isDeleted && <div className="discussion-actions"><button className="text-button" disabled={busy} onClick={() => setReplyFor(replyFor === item.id ? '' : item.id)}>Reply{item.replies.length ? ` · ${item.replies.length}` : ''}</button>{(canDelete || item.authorId === user?.id) && <button className="text-button danger-action" disabled={busy} onClick={() => void remove(item)}>Remove</button>}</div>}{replyFor === item.id && !item.isDeleted && <form className="reply-form" onSubmit={event => void sendReply(event, item.id)}><label className="sr-only" htmlFor={`reply-${item.id}`}>Reply to {item.authorName}</label><textarea id={`reply-${item.id}`} rows={2} maxLength={5000} value={replyDrafts[item.id] || ''} onChange={event => reply(item.id, event.target.value)} placeholder={`Reply to ${item.authorName}…`} /><button disabled={busy || !(replyDrafts[item.id] || '').trim()}>{busy && pendingAction === 'Sending reply' ? 'Sending…' : 'Send reply'}</button></form>}</div></article>)}</div>}
      <form className="discussion-compose" onSubmit={sendMessage}><label htmlFor="discussion-message">Message the project team</label><div className="discussion-compose-row"><textarea id="discussion-message" rows={3} maxLength={5000} value={draft} onChange={event => setDraft(event.target.value)} placeholder="Write an update, question or decision…" /><button className="discussion-send-button" disabled={busy || !draft.trim()} aria-label="Send message">{busy && pendingAction === 'Sending message' ? 'Sending…' : 'Send message'}</button></div><div className="compose-footer"><span className="muted">{draft ? 'Draft saved on this device.' : 'Messages are posted with your signed-in identity.'}</span><span className="muted">Enter a clear update for everyone involved.</span></div></form>
    </div>
  </section>;
}
