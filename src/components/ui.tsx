import { Check, Clipboard, Info, LoaderCircle, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { cloneElement, createContext, forwardRef, isValidElement, useContext, useEffect, useId, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export function Button({ variant = 'primary', loading = false, children, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; loading?: boolean }) {
  return <button {...props} type={props.type ?? 'button'} className={`ui-button ui-button--${variant} ${props.className ?? ''}`} disabled={disabled || loading} aria-busy={loading || undefined}>{loading && <LoaderCircle className="ui-spinner" size={16} aria-hidden="true" />}{children}</button>;
}

export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>(function IconButton({ label, children, ...props }, ref) {
  return <button {...props} ref={ref} type={props.type ?? 'button'} className={`ui-icon-button ${props.className ?? ''}`} aria-label={label}>{children}</button>;
});

export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`ui-input ${props.className ?? ''}`} />; }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={`ui-input ui-select ${props.className ?? ''}`} />; }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={`ui-input ui-textarea ${props.className ?? ''}`} />; }

export function Field({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: ReactNode }) {
  const generatedId = useId();
  const descriptionId = `${generatedId}-description`;
  const field = isValidElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>(children)
    ? cloneElement(children, { id: children.props.id ?? generatedId, 'aria-describedby': error || hint ? descriptionId : children.props['aria-describedby'], 'aria-invalid': error ? true : children.props['aria-invalid'] })
    : children;
  return <div className="ui-field"><label htmlFor={isValidElement<{ id?: string }>(field) ? field.props.id : generatedId}>{label}{required && <span aria-hidden="true"> *</span>}</label>{field}{(hint || error) && <span id={descriptionId} className={error ? 'ui-field__error' : 'ui-field__hint'} role={error ? 'alert' : undefined}>{error || hint}</span>}</div>;
}

const toneIcons: Record<Tone, LucideIcon> = { neutral: Info, info: Info, success: Check, warning: TriangleAlert, error: TriangleAlert };
export function Badge({ tone = 'neutral', children, icon = true }: { tone?: Tone; children: ReactNode; icon?: boolean }) { const Icon = toneIcons[tone]; return <span className={`ui-badge ui-badge--${tone}`}>{icon && <Icon size={12} aria-hidden="true" />}{children}</span>; }
export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLElement>) { return <section {...props} className={`ui-card ${className}`}>{children}</section>; }
export function Stack({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={`ui-stack ${className}`}>{children}</div>; }
export function Inline({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={`ui-inline ${className}`}>{children}</div>; }
export function Table({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={`ui-table-wrap ${className}`}>{children}</div>; }
export function TextLink({ children, className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) { return <a {...props} className={`ui-text-link ${className}`}>{children}</a>; }
export function PageHeader({ eyebrow, title, description, actions, className = '' }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode; className?: string }) { return <header className={`ui-page-header ${className}`}><div>{eyebrow && <p className="ui-page-header__eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="ui-page-header__description">{description}</p>}</div>{actions && <div className="ui-page-header__actions">{actions}</div>}</header>; }
export function SectionHeader({ eyebrow, title, description, actions, className = '' }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode; className?: string }) { return <div className={`ui-section-header ${className}`}><div className="ui-section-header__copy">{eyebrow && <p className="ui-section-header__eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p className="ui-section-header__description">{description}</p>}</div>{actions && <div className="ui-section-header__actions">{actions}</div>}</div>; }
export function Tabs({ items, value, onChange, ariaLabel = 'Sections', className = '' }: { items: Array<{ value: string; label: string; disabled?: boolean }>; value: string; onChange: (value: string) => void; ariaLabel?: string; className?: string }) { return <div className={`ui-tabs ${className}`} role="tablist" aria-label={ariaLabel}>{items.map(item => <button key={item.value} type="button" role="tab" aria-selected={item.value === value} className={item.value === value ? 'is-active' : ''} disabled={item.disabled} onClick={() => onChange(item.value)}>{item.label}</button>)}</div>; }
export function LoadingState({ label = 'Loading…' }: { label?: string }) { return <div className="ui-state ui-state--loading" role="status" aria-label={label}><span className="ui-skeleton ui-skeleton--title" aria-hidden="true" /><span className="ui-skeleton ui-skeleton--line" aria-hidden="true" /><span className="ui-skeleton ui-skeleton--line ui-skeleton--short" aria-hidden="true" /></div>; }
export function Skeleton({ width, height, className = '' }: { width?: string | number; height?: string | number; className?: string }) { return <span className={`ui-skeleton ${className}`} style={{ width, height }} aria-hidden="true" />; }
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) { return <div className="ui-state ui-state--empty"><Info size={24} aria-hidden="true" /><strong>{title}</strong>{children && <span>{children}</span>}</div>; }
export function ErrorState({ message = "We couldn't load this content.", onRetry }: { message?: string; onRetry?: () => void }) { return <div className="ui-state ui-state--error" role="alert"><TriangleAlert size={24} aria-hidden="true" /><strong>{message}</strong>{onRetry && <Button variant="secondary" onClick={onRetry}>Retry</Button>}</div>; }
export function Money({ value, currency = 'INR' }: { value: number | null | undefined; currency?: string }) { return <span className="ui-money">{value == null ? 'Not set' : value.toLocaleString(undefined, { style: 'currency', currency, maximumFractionDigits: 2 })}</span>; }
export function DateTime({ value, fallback = 'Not available' }: { value?: string | null; fallback?: string }) { return <time dateTime={value || undefined}>{value ? new Date(value).toLocaleString() : fallback}</time>; }
export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) { const [copied, setCopied] = useState(false); async function copy() { try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); } } return <button type="button" className="ui-copy-button" onClick={() => void copy()} aria-label={`${label} ${value}`}>{copied ? <Check size={14} aria-hidden="true" /> : <Clipboard size={14} aria-hidden="true" />}{copied ? 'Copied' : label}</button>; }
export function PermissionGate({ allowed, children, fallback = null }: { allowed: boolean; children: ReactNode; fallback?: ReactNode }) { return allowed ? <>{children}</> : <>{fallback}</>; }

export function Toast({ message, tone = 'success', onClose }: { message: string; tone?: Tone; onClose?: () => void }) { const Icon = toneIcons[tone]; useEffect(() => { if (tone !== 'error' && onClose) { const timer = window.setTimeout(onClose, 4000); return () => window.clearTimeout(timer); } }, [tone, onClose]); return <div className={`ui-toast ui-toast--${tone}`} role="status" aria-live={tone === 'error' ? 'assertive' : 'polite'}><Icon size={16} aria-hidden="true" /><span>{message}</span>{onClose && <IconButton label="Dismiss" onClick={onClose}><X size={16} aria-hidden="true" /></IconButton>}</div>; }

function Overlay({ title, children, onClose, className = '' }: { title: string; children: ReactNode; onClose: () => void; className?: string }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => { closeRef.current?.focus(); const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); if (event.key === 'Tab' && panelRef.current) { const focusable = panelRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'); const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } } }; document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler); }, [onClose]);
  return <div className="ui-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section ref={panelRef} className={`ui-overlay__panel ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId}><div className="ui-overlay__header"><h2 id={titleId}>{title}</h2><IconButton ref={closeRef} label="Close" onClick={onClose}><X size={16} aria-hidden="true" /></IconButton></div>{children}</section></div>;
}

export function Modal(props: { title: string; children: ReactNode; onClose: () => void }) { return <Overlay {...props} />; }
export function Drawer(props: { title: string; children: ReactNode; onClose: () => void }) { return <Overlay {...props} className="ui-overlay__panel--drawer" />; }
export function Popover({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`ui-popover ${className}`}>{children}</div>; }

type ConfirmRequest = { title: string; message: string; destructive?: boolean; resolve: (value: boolean) => void };
const ConfirmContext = createContext<((request: Omit<ConfirmRequest, 'resolve'>) => Promise<boolean>) | null>(null);
export function useConfirm() { const confirm = useContext(ConfirmContext); if (!confirm) throw new Error('useConfirm must be used inside ConfirmProvider'); return confirm; }
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const confirm = (next: Omit<ConfirmRequest, 'resolve'>) => new Promise<boolean>(resolve => setRequest({ ...next, resolve }));
  const close = (result: boolean) => { request?.resolve(result); setRequest(null); };
  return <ConfirmContext.Provider value={confirm}>{children}{request && <div className="ui-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) close(false); }}><section className="ui-overlay__panel ui-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><div className="ui-overlay__header"><h2 id="confirm-title">{request.title}</h2><IconButton label="Close" onClick={() => close(false)}><X size={16} aria-hidden="true" /></IconButton></div><div className="ui-confirm-dialog__body"><p>{request.message}</p></div><div className="ui-confirm-dialog__actions"><Button variant="secondary" onClick={() => close(false)}>Cancel</Button><Button variant={request.destructive ? 'destructive' : 'primary'} onClick={() => close(true)}>{request.destructive ? 'Confirm' : 'Continue'}</Button></div></section></div>}</ConfirmContext.Provider>;
}
