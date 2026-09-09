import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Lead, LeadCreate, LeadUpdate } from '../types';
import { leadStages } from '../types';

interface LeadFormProps { initial?: Lead; busy: boolean; onSubmit: (payload: LeadCreate | LeadUpdate) => void; onCancel?: () => void; }
type FormState = { email: string; companyName: string; contactPerson: string; phone: string; business: string; leadSource: string; notes: string; stage: string };
type Errors = Partial<Record<keyof FormState, string>>;

const initialValues = (lead?: Lead): FormState => ({ email: lead?.email ?? '', companyName: lead?.companyName ?? '', contactPerson: lead?.contactPerson ?? '', phone: lead?.phone ?? '', business: lead?.business ?? '', leadSource: lead?.leadSource ?? '', notes: lead?.notes ?? '', stage: lead?.stage ?? 'New' });

export function LeadForm({ initial, busy, onSubmit, onCancel }: LeadFormProps) {
  const [form, setForm] = useState<FormState>(() => initialValues(initial));
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const baseline = useMemo(() => JSON.stringify(initialValues(initial)), [initial]);
  const dirty = JSON.stringify(form) !== baseline;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const set = (key: keyof FormState, value: string) => { setForm(previous => ({ ...previous, [key]: value })); if (errors[key]) setErrors(previous => ({ ...previous, [key]: undefined })); };
  const validate = (): Errors => {
    const next: Errors = {};
    if (form.contactPerson.trim().length < 2) next.contactPerson = 'Enter the contact person’s full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid work email address.';
    if (form.business.trim().length < 2) next.business = 'Add the type of business or opportunity.';
    if (form.phone.trim() && form.phone.trim().replace(/\D/g, '').length < 7) next.phone = 'Enter a valid phone number or leave it blank.';
    if (form.notes.length > 5000) next.notes = 'Notes must be 5,000 characters or fewer.';
    return next;
  };
  const fieldProps = (key: keyof FormState) => ({ 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `${key}-error` : undefined });
  const submit = (event: FormEvent) => {
    event.preventDefault(); setSubmitted(true); const nextErrors = validate(); setErrors(nextErrors); if (Object.keys(nextErrors).length) return;
    if (initial) { const payload: LeadUpdate = { email: form.email.trim(), companyName: form.companyName.trim(), contactPerson: form.contactPerson.trim(), phone: form.phone.trim(), business: form.business.trim(), leadSource: form.leadSource.trim(), notes: form.notes.trim() }; if (form.stage !== initial.stage) payload.stage = form.stage as Lead['stage']; onSubmit(payload); return; }
    const payload: LeadCreate = { email: form.email.trim(), companyName: form.companyName.trim() || undefined, contactPerson: form.contactPerson.trim(), phone: form.phone.trim() || undefined, business: form.business.trim(), leadSource: form.leadSource.trim() || undefined, notes: form.notes.trim() || undefined }; onSubmit(payload);
  };
  const cancel = () => { if (!dirty || window.confirm('Discard your unsaved lead changes?')) onCancel?.(); };
  return <form className="form-card lead-form" onSubmit={submit} noValidate>
    <div className="form-section lead-form-intro"><div><p className="eyebrow">{initial ? 'Edit opportunity' : 'New opportunity'}</p><h2>{initial ? 'Update lead details' : 'Create a lead'}</h2><p className="muted">{initial ? 'Keep the opportunity record accurate for everyone working the pipeline.' : 'Capture the essential context now. You can add more detail as the conversation develops.'}</p></div><span className="lead-form-required-note"><span aria-hidden="true">*</span> Required</span></div>
    <div className="lead-form-section"><div className="lead-form-section-heading"><span className="lead-form-step">01</span><div><h3>Contact identity</h3><p className="field-help">Who should your team speak with?</p></div></div><div className="form-grid"><label>Contact person <span aria-hidden="true" className="required-mark">*</span><input {...fieldProps('contactPerson')} value={form.contactPerson} onChange={event => set('contactPerson', event.target.value)} autoComplete="name" autoFocus />{submitted && errors.contactPerson && <span id="contactPerson-error" className="field-error" role="alert">{errors.contactPerson}</span>}</label><label>Work email <span aria-hidden="true" className="required-mark">*</span><input {...fieldProps('email')} type="email" value={form.email} onChange={event => set('email', event.target.value)} autoComplete="email" placeholder="name@company.com" />{submitted && errors.email && <span id="email-error" className="field-error" role="alert">{errors.email}</span>}</label><label>Phone <span className="optional">Optional</span><input {...fieldProps('phone')} value={form.phone} onChange={event => set('phone', event.target.value)} autoComplete="tel" placeholder="+91 98765 43210" />{submitted && errors.phone && <span id="phone-error" className="field-error" role="alert">{errors.phone}</span>}</label><label>Company name <span className="optional">Optional</span><input value={form.companyName} onChange={event => set('companyName', event.target.value)} autoComplete="organization" /></label></div></div>
    <div className="lead-form-section"><div className="lead-form-section-heading"><span className="lead-form-step">02</span><div><h3>Opportunity context</h3><p className="field-help">Give the pipeline enough context to move forward.</p></div></div><div className="form-grid"><label>Business / requirement <span aria-hidden="true" className="required-mark">*</span><input {...fieldProps('business')} value={form.business} onChange={event => set('business', event.target.value)} placeholder="Website redesign, event management…" />{submitted && errors.business && <span id="business-error" className="field-error" role="alert">{errors.business}</span>}</label><label>Lead source <span className="optional">Optional</span><input value={form.leadSource} onChange={event => set('leadSource', event.target.value)} placeholder="Website, referral, campaign…" /></label></div>{initial && <label>Pipeline stage<select value={form.stage} onChange={event => set('stage', event.target.value)}>{leadStages.map(stage => <option key={stage} value={stage}>{stage}</option>)}</select><span className="field-help">Won and Lost are terminal stages and should only be changed deliberately.</span></label>}</div>
    <div className="lead-form-section"><div className="lead-form-section-heading"><span className="lead-form-step">03</span><div><h3>Working notes</h3><p className="field-help">Add useful context for the next conversation.</p></div></div><label>Notes <span className="optional">Optional</span><textarea {...fieldProps('notes')} rows={5} maxLength={5000} value={form.notes} onChange={event => set('notes', event.target.value)} placeholder="Goals, timeline, decision makers or important context…" />{submitted && errors.notes && <span id="notes-error" className="field-error" role="alert">{errors.notes}</span>}<span className="character-count">{form.notes.length}/5,000</span></label></div>
    <div className="actions lead-form-actions"><button disabled={busy}>{busy ? 'Saving…' : initial ? 'Save lead changes' : 'Create lead'}</button>{onCancel && <button type="button" className="secondary" onClick={cancel} disabled={busy}>Cancel</button>}</div>
  </form>;
}
