import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Requirement, RequirementCreate, RequirementUpdate } from '../types';

interface Props {
  initial?: Requirement;
  leadId?: string;
  projectId?: string;
  relationshipLabel?: string;
  busy: boolean;
  onSubmit: (payload: RequirementCreate | RequirementUpdate, attachment?: File) => void | Promise<void>;
  onCancel?: () => void;
}

type FormState = {
  businessName: string;
  businessType: string;
  targetAudience: string;
  goals: string;
  requiredFeatures: string;
  preferredTech: string;
  additionalNotes: string;
  referenceWebsites: string;
  logoUrl: string;
  deadline: string;
  budgetRange: string;
};

type FieldErrors = Partial<Record<keyof FormState | 'relationship', string>>;

const splitLines = (value: string) => value.split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
const normalizeDate = (value: string) => value ? value.slice(0, 10) : undefined;
const optional = (value: string) => value.trim() || undefined;

const formFromRequirement = (initial?: Requirement): FormState => ({
  businessName: initial?.businessName ?? '',
  businessType: initial?.businessType ?? '',
  targetAudience: initial?.targetAudience ?? '',
  goals: initial?.goals ?? '',
  requiredFeatures: initial?.requiredFeatures.join('\n') ?? '',
  preferredTech: initial?.preferredTech.join('\n') ?? '',
  additionalNotes: initial?.additionalNotes ?? '',
  referenceWebsites: initial?.referenceWebsites?.join('\n') ?? '',
  logoUrl: initial?.logoUrl ?? '',
  deadline: initial?.deadline?.slice(0, 10) ?? '',
  budgetRange: initial?.budgetRange ?? '',
});

const draftKey = (leadId?: string, projectId?: string) => `upserve.requirement-draft:${leadId || projectId || 'unlinked'}`;

export function RequirementForm({ initial, leadId, projectId, relationshipLabel, busy, onSubmit, onCancel }: Props) {
  const isEditing = Boolean(initial);
  const relationshipType = projectId ? 'project' : 'lead';
  const relationshipId = leadId || projectId;
  const storageKey = useMemo(() => draftKey(leadId, projectId), [leadId, projectId]);
  const [form, setForm] = useState<FormState>(() => {
    if (initial || typeof window === 'undefined') return formFromRequirement(initial);
    try {
      const draft = window.sessionStorage.getItem(storageKey);
      return draft ? { ...formFromRequirement(), ...JSON.parse(draft) as Partial<FormState> } : formFromRequirement();
    } catch { return formFromRequirement(); }
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [draftRestored, setDraftRestored] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState('');

  useEffect(() => {
    if (!isEditing && typeof window !== 'undefined') {
      setDraftRestored(Boolean(window.sessionStorage.getItem(storageKey)));
      const saveDraft = window.setTimeout(() => {
        if (dirty) window.sessionStorage.setItem(storageKey, JSON.stringify(form));
      }, 350);
      return () => window.clearTimeout(saveDraft);
    }
    return undefined;
  }, [dirty, form, isEditing, storageKey]);

  useEffect(() => {
    if (!dirty || typeof window === 'undefined') return undefined;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (key: keyof FormState, value: string) => {
    setForm(previous => ({ ...previous, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors(previous => ({ ...previous, [key]: undefined }));
  };

  function chooseAttachment(file?: File) {
    if (!file) return;
    setAttachmentError('');
    const supported = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|jpg|jpeg|png|webp|zip)$/i.test(file.name);
    if (!supported) {
      setAttachment(null);
      setAttachmentError('This file type is not supported. Use a PDF, image, document, spreadsheet, presentation, text file, CSV or ZIP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAttachment(null);
      setAttachmentError('The file must be 10 MB or smaller.');
      return;
    }
    setAttachment(file);
    setDirty(true);
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (form.businessName.trim().length < 2) next.businessName = 'Add the business or product name.';
    if (form.businessType.trim().length < 2) next.businessType = 'Tell us what kind of business this is.';
    if (form.targetAudience.trim().length < 2) next.targetAudience = 'Describe who this is for.';
    if (form.goals.trim().length < 5) next.goals = 'Describe the outcome in at least five characters.';
    if (!splitLines(form.requiredFeatures).length) next.requiredFeatures = 'Add at least one required feature.';
    if (!splitLines(form.preferredTech).length) next.preferredTech = 'Add at least one preferred technology, or write “Open to recommendations”.';
    if (!isEditing && !relationshipId) next.relationship = `This requirement must be started from a selected ${relationshipType}.`;
    if (form.logoUrl.trim() && !/^https?:\/\//i.test(form.logoUrl.trim())) next.logoUrl = 'Use a complete URL beginning with https://.';
    return next;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length || attachmentError) return;
    const businessName = form.businessName.trim();
    const businessType = form.businessType.trim();
    const targetAudience = form.targetAudience.trim();
    const goals = form.goals.trim();
    const requiredFeatures = splitLines(form.requiredFeatures);
    const preferredTech = splitLines(form.preferredTech);
    if (isEditing) {
      const payload: RequirementUpdate = {
        businessName, businessType, targetAudience, goals, requiredFeatures, preferredTech,
        referenceWebsites: splitLines(form.referenceWebsites), logoUrl: optional(form.logoUrl),
        deadline: normalizeDate(form.deadline), budgetRange: optional(form.budgetRange), additionalNotes: optional(form.additionalNotes),
      };
      await onSubmit(payload);
    } else if (relationshipId) {
      await onSubmit({
        leadId: leadId || undefined, projectId: projectId || undefined, businessName, businessType,
        targetAudience, goals, requiredFeatures, preferredTech, additionalNotes: optional(form.additionalNotes),
      }, attachment || undefined);
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(storageKey);
    }
  }

  function cancel() {
    if (!dirty || window.confirm('Leave this requirement? Your unsaved draft will be kept for this selected relationship.')) onCancel?.();
  }

  const field = (key: keyof FormState) => errors[key] ? <span className="field-error" role="alert">{errors[key]}</span> : null;
  return <form className="form-card requirement-form" onSubmit={submit} noValidate>
    <div className="requirement-form__header">
      <div><p className="eyebrow">Scope and discovery</p><h2>{isEditing ? 'Edit project brief' : 'Create project brief'}</h2><p className="muted">Capture the context your team needs to shape the right solution.</p></div>
      {!isEditing && draftRestored && <span className="requirement-draft-status">Draft restored</span>}
    </div>
    {errors.relationship && <div className="error" role="alert">{errors.relationship}</div>}

    <section className="requirement-form-section requirement-form-section--context">
      <div className="requirement-form-section__intro"><p className="eyebrow">01 · Project context</p><h3>Your selected project</h3><p className="muted">This brief stays attached to the selected project throughout the review.</p></div>
      <div className="requirement-context-card"><span className="requirement-context-card__icon">{relationshipType === 'lead' ? 'L' : 'P'}</span><div><span className="eyebrow">Linked {relationshipType}</span><strong>{relationshipLabel || (relationshipId ? `Selected ${relationshipType}` : 'No relationship selected')}</strong><small>{relationshipId ? 'This context is securely attached to the requirement.' : 'Return to the lead list and choose a lead to continue.'}</small></div>{!isEditing && !projectId && <Link to="/app/requirements" className="button-link secondary">Change</Link>}</div>
    </section>

    <section className="requirement-form-section"><div className="requirement-form-section__intro"><p className="eyebrow">02 · Business</p><h3>Make the opportunity clear</h3></div><div className="form-grid"><label>Business name <span className="required-mark">*</span><input value={form.businessName} onChange={e => set('businessName', e.target.value)} aria-invalid={Boolean(errors.businessName)} placeholder="e.g. Northstar Health" />{field('businessName')}</label><label>Business type <span className="required-mark">*</span><input value={form.businessType} onChange={e => set('businessType', e.target.value)} aria-invalid={Boolean(errors.businessType)} placeholder="e.g. SaaS, marketplace, services" />{field('businessType')}</label></div><label>Target audience <span className="required-mark">*</span><input value={form.targetAudience} onChange={e => set('targetAudience', e.target.value)} aria-invalid={Boolean(errors.targetAudience)} placeholder="Who should this product serve?" />{field('targetAudience')}</label><label>Goals <span className="required-mark">*</span><textarea rows={5} value={form.goals} onChange={e => set('goals', e.target.value)} aria-invalid={Boolean(errors.goals)} placeholder="What should improve when this work is complete?" />{field('goals')}</label></section>

    <section className="requirement-form-section"><div className="requirement-form-section__intro"><p className="eyebrow">03 · Delivery scope</p><h3>Define what good looks like</h3></div><label>Required features <span className="required-mark">*</span><span className="field-help">One item per line. We’ll turn each line into a scope item.</span><textarea rows={5} value={form.requiredFeatures} onChange={e => set('requiredFeatures', e.target.value)} aria-invalid={Boolean(errors.requiredFeatures)} placeholder={'User onboarding\nAdmin dashboard\nNotifications'} />{field('requiredFeatures')}</label><label>Preferred technology <span className="required-mark">*</span><span className="field-help">One item per line, or say “Open to recommendations”.</span><textarea rows={4} value={form.preferredTech} onChange={e => set('preferredTech', e.target.value)} aria-invalid={Boolean(errors.preferredTech)} placeholder={'React\nFastAPI\nOpen to recommendations'} />{field('preferredTech')}</label></section>

    <section className="requirement-form-section"><div className="requirement-form-section__intro"><p className="eyebrow">04 · Additional context</p><h3>Anything else we should know?</h3><p className="muted">Optional details help the team prepare without slowing down the brief.</p></div><label>Additional notes <span className="optional">Optional</span><textarea rows={5} value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} placeholder="Constraints, references, existing systems, or important context…" /></label>{!isEditing && <label className="requirement-attachment-field">Supporting file <span className="optional">Optional</span><span className="field-help">Add a detailed brief, image, wireframe, document, spreadsheet, presentation or ZIP if text alone is not enough.</span><input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp,.zip" onChange={e => chooseAttachment(e.target.files?.[0])} />{attachment && <span className="requirement-attachment-selected">{attachment.name} · {(attachment.size / (1024 * 1024)).toFixed(1)} MB</span>}{attachmentError && <span className="field-error" role="alert">{attachmentError}</span>}</label>}{isEditing && <><label>Reference websites <span className="optional">Optional</span><textarea rows={3} value={form.referenceWebsites} onChange={e => set('referenceWebsites', e.target.value)} /></label><div className="form-grid"><label>Logo URL <span className="optional">Optional</span><input value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)} aria-invalid={Boolean(errors.logoUrl)} />{field('logoUrl')}</label><label>Deadline <span className="optional">Optional</span><input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></label></div><label>Budget range <span className="optional">Optional</span><input value={form.budgetRange} onChange={e => set('budgetRange', e.target.value)} /></label></>}</section>
    <div className="requirement-form__footer"><div>{!isEditing && <span className="requirement-draft-hint">Your draft is saved automatically on this device.</span>}</div><div className="actions"><button type="submit" disabled={busy || (!isEditing && !relationshipId)}>{busy ? 'Saving…' : isEditing ? 'Save changes' : 'Create requirement'}</button>{onCancel && <button type="button" className="secondary" disabled={busy} onClick={cancel}>Cancel</button>}</div></div>
  </form>;
}
