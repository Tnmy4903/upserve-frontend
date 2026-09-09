import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Quotation, QuotationFormItem, QuotationFormValues, QuotationUpdate } from '../types';
import type { Lead } from '../../leads/types';

interface Props { initial?: Quotation; busy: boolean; leads?: Lead[]; selectedLeadId?: string; onSubmit: (payload: QuotationFormValues | QuotationUpdate) => void; onCancel?: () => void; }
type ItemErrors = Partial<Record<keyof QuotationFormItem, string>>;
const blankItem = (): QuotationFormItem => ({ service: '', description: '', quantity: '1', price: '' });
const money = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function QuotationForm({ initial, busy, leads = [], selectedLeadId, onSubmit, onCancel }: Props) {
  const isEditing = Boolean(initial);
  const [form, setForm] = useState({ leadId: selectedLeadId ?? initial?.leadId ?? '', timeline: initial?.timeline ?? '', validity: String(initial?.validity ?? 30), terms: initial?.terms ?? '', notes: initial?.notes ?? '' });
  const [items, setItems] = useState<QuotationFormItem[]>(initial?.items.length ? initial.items.map((item, index) => ({ service: initial.services[index] ?? item.description, description: item.description, quantity: String(item.quantity), price: String(item.unitPrice) })) : [blankItem()]);
  const [formError, setFormError] = useState('');
  const [itemErrors, setItemErrors] = useState<ItemErrors[]>([]);
  const [dirty, setDirty] = useState(false);
  const selectedLead = leads.find(lead => lead.id === form.leadId);
  const total = useMemo(() => items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0), [items]);

  useEffect(() => {
    if (!dirty || typeof window === 'undefined') return undefined;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (key: keyof typeof form, value: string) => { setForm(previous => ({ ...previous, [key]: value })); setDirty(true); };
  const setItem = (index: number, key: keyof QuotationFormItem, value: string) => { setItems(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item)); setDirty(true); };

  function submit(event: FormEvent) {
    event.preventDefault(); setFormError('');
    const validity = Number(form.validity);
    const errors: ItemErrors[] = items.map(item => {
      const next: ItemErrors = {};
      if (!item.service.trim()) next.service = 'Add a service name.';
      if (!item.description.trim()) next.description = 'Describe what is included.';
      if (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0) next.quantity = 'Quantity must be greater than zero.';
      if (!Number.isFinite(Number(item.price)) || Number(item.price) < 0) next.price = 'Price cannot be negative.';
      return next;
    });
    const names = items.map(item => item.service.trim().toLowerCase()).filter(Boolean);
    const duplicate = names.some((name, index) => names.indexOf(name) !== index);
    setItemErrors(errors);
    if (!form.leadId.trim() && !initial) { setFormError('Select a lead before creating the quotation.'); return; }
    if (!form.timeline.trim() || !form.terms.trim() || !Number.isInteger(validity) || validity < 1) { setFormError('Add a project duration, payment terms and a valid quotation validity in days.'); return; }
    if (!items.length || errors.some(item => Object.keys(item).length) || duplicate) { setFormError(duplicate ? 'Each service must be unique. Combine duplicate line items before saving.' : 'Fix the highlighted line items before saving.'); return; }
    const normalizedItems = items.map(item => ({ service: item.service.trim(), description: item.description.trim(), quantity: Number(item.quantity), unitPrice: Number(item.price) }));
    const apiItems = normalizedItems.map(item => ({ description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, total: item.quantity * item.unitPrice }));
    if (initial) onSubmit({ services: normalizedItems.map(item => item.service), items: apiItems, timeline: form.timeline.trim(), validity, terms: form.terms.trim(), notes: form.notes.trim() || undefined });
    else onSubmit({ leadId: form.leadId.trim(), clientId: '', items: items.map(item => ({ ...item, service: item.service.trim(), description: item.description.trim(), quantity: item.quantity.trim(), price: item.price.trim() })), timeline: form.timeline.trim(), validity: String(validity), terms: form.terms.trim(), notes: form.notes.trim() });
  }

  function cancel() { if (!dirty || window.confirm('Leave this quotation? Your entered changes will be lost.')) onCancel?.(); }
  const error = (index: number, key: keyof QuotationFormItem) => itemErrors[index]?.[key] ? <span className="field-error" role="alert">{itemErrors[index][key]}</span> : null;
  return <form className="form-card quotation-form premium-quotation-form" onSubmit={submit} noValidate>
    <div className="quotation-form__header"><div><p className="eyebrow">{isEditing ? 'Edit opportunity' : 'New proposal'}</p><h2>{isEditing ? 'Edit quotation' : 'Build your quotation'}</h2><p className="muted">Use lead details and optional requirement context to prepare a clear, confident commercial proposal.</p></div><div className="quotation-form__header-meta"><span className="quotation-form-required-note"><span aria-hidden="true">*</span> Required</span><div className="quotation-total-preview"><span>Estimated total</span><strong>₹{money(total)}</strong><small>Final amount is confirmed by the server.</small></div></div></div>
    <div className="form-section quotation-form-section">{!initial && form.leadId && <div className="relationship-context"><span className="eyebrow">Quotation for</span><strong>{selectedLead ? `${selectedLead.contactPerson}${selectedLead.companyName ? ` · ${selectedLead.companyName}` : ''}` : 'Selected lead'}</strong><small>{selectedLead?.email || 'The linked lead will be verified before saving.'}</small></div>}{formError && <div className="error" role="alert">{formError}</div>}{!initial && !selectedLeadId && <label>Lead<span className="field-help">Choose a linked lead. The backend verifies the client relationship; requirement context is optional.</span><select required value={form.leadId} onChange={event => set('leadId', event.target.value)}><option value="">Select a lead</option>{leads.map(lead => <option key={lead.id} value={lead.id}>{lead.contactPerson}{lead.companyName ? ` · ${lead.companyName}` : ''} · {lead.email}</option>)}</select></label>}
      <div className="quotation-items"><div className="section-heading"><div><p className="eyebrow">01 · Scope and pricing</p><h3>Services and deliverables</h3><p className="field-help">Add each distinct service once. Totals update as you work.</p></div><button type="button" className="secondary" disabled={busy} onClick={() => { setItems(previous => [...previous, blankItem()]); setDirty(true); }}>+ Add service</button></div>{items.map((item, index) => <div className="quotation-item premium-quotation-item" key={index}><div className="quotation-item__number">{String(index + 1).padStart(2, '0')}</div><label>Service / deliverable<input required value={item.service} onChange={event => setItem(index, 'service', event.target.value)} placeholder="Website UI/UX design" aria-invalid={Boolean(itemErrors[index]?.service)} />{error(index, 'service')}</label><label>Description / scope<textarea required rows={3} value={item.description} onChange={event => setItem(index, 'description', event.target.value)} placeholder="What is included in this service?" aria-invalid={Boolean(itemErrors[index]?.description)} />{error(index, 'description')}</label><label>Quantity<input required min={0.01} step="0.01" type="number" value={item.quantity} onChange={event => setItem(index, 'quantity', event.target.value)} aria-invalid={Boolean(itemErrors[index]?.quantity)} />{error(index, 'quantity')}</label><label>Unit price<input required min={0} step="0.01" type="number" value={item.price} onChange={event => setItem(index, 'price', event.target.value)} placeholder="25000" aria-invalid={Boolean(itemErrors[index]?.price)} />{error(index, 'price')}</label><div className="quotation-item__total"><span>Line total</span><strong>₹{money((Number(item.quantity) || 0) * (Number(item.price) || 0))}</strong></div>{items.length > 1 && <button type="button" className="secondary danger-action" disabled={busy} onClick={() => { setItems(previous => previous.filter((_, itemIndex) => itemIndex !== index)); setDirty(true); }}>Remove</button>}</div>)}</div>
      <div className="quotation-form-section-block"><div className="lead-form-section-heading"><span className="lead-form-step">02</span><div><h3>Delivery and terms</h3><p className="field-help">Set the delivery expectation and commercial conditions.</p></div></div><div className="form-grid"><label>Estimated project duration<input required value={form.timeline} onChange={event => set('timeline', event.target.value)} placeholder="30 days" /></label><label>Quotation validity (days)<input required min={1} step={1} type="number" value={form.validity} onChange={event => set('validity', event.target.value)} /></label></div><label>Payment terms & conditions<textarea required rows={5} value={form.terms} onChange={event => set('terms', event.target.value)} placeholder="Payment schedule, taxes, exclusions, and important conditions…" /></label></div><div className="quotation-form-section-block"><div className="lead-form-section-heading"><span className="lead-form-step">03</span><div><h3>Client note</h3><p className="field-help">Add a clear, useful note for the proposal recipient.</p></div></div><label>Additional notes <span className="optional">Optional</span><textarea rows={4} value={form.notes} onChange={event => set('notes', event.target.value)} placeholder="A warm note or useful context for the client…" /></label></div>
    </div><div className="quotation-form__footer"><span className="requirement-draft-hint">Requirement context is optional. Review all line items before sending; the backend remains the source of truth for totals.</span><div className="actions"><button type="submit" disabled={busy}>{busy ? 'Saving…' : isEditing ? 'Save quotation' : 'Create quotation'}</button>{onCancel && <button type="button" className="secondary" disabled={busy} onClick={cancel}>Cancel</button>}</div></div>
  </form>;
}
