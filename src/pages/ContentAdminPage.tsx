import { useEffect, useMemo, useState } from 'react';
import { blogApi } from '../features/blog/services/blogApi';
import { portfolioApi } from '../features/portfolio/services/portfolioApi';
import { contentMediaApi } from '../features/content/services/contentMediaApi';
import type { ContentRecord } from '../types/content';
type PublicRecord = ContentRecord;
import { apiConfig } from '../services/apiClient';
import { useConfirm } from '../components/ui';

const errorMessage = (value: unknown) => value instanceof Error ? value.message : 'Request failed. Please try again.';
const text = (item: PublicRecord, key: string) => String(item[key] ?? '');
const mediaUrl = (url: string) => url.startsWith('/') ? `${apiConfig.baseUrl}${url}` : url;

export function ContentAdminPage() {
  const [blogs, setBlogs] = useState<PublicRecord[]>([]);
  const [portfolio, setPortfolio] = useState<PublicRecord[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [libraryType, setLibraryType] = useState<'all' | 'blogs' | 'portfolio'>('all');
  const confirm = useConfirm();

  async function refresh() {
    setLoading(true);
    try { const [nextBlogs, nextPortfolio] = await Promise.all([blogApi.list(), portfolioApi.listAll()]); setBlogs(nextBlogs); setPortfolio(nextPortfolio); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh().catch(value => setError(errorMessage(value))); }, []);
  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true); setError(''); setSuccess('');
    try { await action(); await refresh(); setSuccess(message); } catch (value) { setError(errorMessage(value)); } finally { setBusy(false); }
  }
  const visibleBlogs = useMemo(() => blogs.filter(item => !libraryQuery.trim() || `${text(item, 'title')} ${text(item, 'slug')}`.toLowerCase().includes(libraryQuery.trim().toLowerCase())), [blogs, libraryQuery]);
  const visiblePortfolio = useMemo(() => portfolio.filter(item => !libraryQuery.trim() || `${text(item, 'title')} ${text(item, 'slug')} ${text(item, 'category')}`.toLowerCase().includes(libraryQuery.trim().toLowerCase())), [libraryQuery, portfolio]);
  const visibleCount = (libraryType === 'all' ? visibleBlogs.length + visiblePortfolio.length : libraryType === 'blogs' ? visibleBlogs.length : visiblePortfolio.length);

  return <section className="page content-admin-page">
    <div className="page-heading"><div><p className="eyebrow">Content administration</p><h1>Blogs & portfolio</h1><p className="muted">Create polished public content for the Upserve website.</p></div></div>
    {error && <div className="error" role="alert">{error}</div>}{success && <div className="success" role="status">{success}</div>}
    <div className="admin-grid">
      <BlogForm busy={busy} onSubmit={data => run(() => blogApi.create(data), 'Blog created.')} />
      <PortfolioForm busy={busy} onSubmit={data => run(() => portfolioApi.create(data), 'Portfolio item created.')} />
    </div>
    <section className="card admin-panel"><div className="section-heading"><div><p className="eyebrow">Library</p><h2>Published and managed content</h2></div><span className="muted">{visibleCount} of {blogs.length + portfolio.length} items</span></div>{!loading && (blogs.length + portfolio.length) > 0 && <div className="content-library-toolbar"><label>Search library<input type="search" value={libraryQuery} onChange={event => setLibraryQuery(event.target.value)} placeholder="Title, slug or category" /></label><label>Type<select value={libraryType} onChange={event => setLibraryType(event.target.value as typeof libraryType)}><option value="all">All content</option><option value="blogs">Blogs</option><option value="portfolio">Portfolio</option></select></label></div>}{loading ? <div className="screen-state" role="status">Loading content library…</div> : <div className="content-list">
      {(libraryType === 'all' || libraryType === 'blogs') && <><h3>Blogs</h3>{visibleBlogs.length ? visibleBlogs.map(item => <ContentRow key={text(item, 'id') || text(item, 'slug')} title={text(item, 'title') || 'Untitled blog'} detail={`${text(item, 'slug')} · Published`} busy={busy} onDelete={async () => { if (await confirm({ title: 'Delete blog', message: 'This permanently removes the published blog item.', destructive: true })) void run(() => blogApi.remove(text(item, 'id')), 'Blog deleted.'); }} />) : <p className="muted">No matching blogs.</p>}</>}
      {(libraryType === 'all' || libraryType === 'portfolio') && <><h3>Portfolio</h3>{visiblePortfolio.length ? visiblePortfolio.map(item => <ContentRow key={text(item, 'id') || text(item, 'slug')} title={text(item, 'title') || 'Untitled project'} detail={`${text(item, 'category')} · ${item.published === false ? 'Draft' : item.featured === true ? 'Published · Featured' : 'Published'}`} busy={busy} onDelete={async () => { if (await confirm({ title: 'Delete portfolio item', message: 'This permanently removes the published portfolio item.', destructive: true })) void run(() => portfolioApi.remove(text(item, 'id')), 'Portfolio item deleted.'); }} />) : <p className="muted">No matching portfolio items.</p>}</>}
      {visibleCount === 0 && <div className="empty-state"><h3>No matching content</h3><p>Try another search or content type.</p></div>}
    </div>}</section>
  </section>;
}

function ContentRow({ title, detail, busy, onDelete }: { title: string; detail: string; busy: boolean; onDelete: () => void }) {
  return <div className="content-row"><span><strong>{title}</strong><small>{detail}</small></span><button type="button" className="secondary danger-action" disabled={busy} onClick={onDelete}>Delete</button></div>;
}

function BlogForm({ busy, onSubmit }: { busy: boolean; onSubmit: (data: { title: string; slug: string; content: string; thumbnail?: string }) => void }) {
  const [form, setForm] = useState({ title: '', slug: '', content: '', thumbnail: '' });
  const [uploading, setUploading] = useState(false); const [uploadError, setUploadError] = useState('');
  const set = (key: keyof typeof form, value: string) => setForm(previous => ({ ...previous, [key]: value }));
  async function upload(file: File) { setUploading(true); setUploadError(''); try { const result = await contentMediaApi.upload(file); set('thumbnail', mediaUrl(result.url)); } catch (value) { setUploadError(errorMessage(value)); } finally { setUploading(false); } }
  return <form className="form-card content-form" onSubmit={event => { event.preventDefault(); onSubmit({ ...form, thumbnail: form.thumbnail || undefined }); }}>
    <p className="eyebrow">Editorial</p><h2>Create blog</h2><p className="form-intro">Share a useful perspective with clients and visitors.</p>
    <div className="form-section"><h3>Article details</h3><label>Title<input required minLength={2} value={form.title} onChange={event => set('title', event.target.value)} placeholder="e.g. Building products people return to" /></label><label>URL slug<span className="field-help">A short, lowercase address using letters, numbers, and hyphens.</span><input required pattern="[a-z0-9-]+" value={form.slug} onChange={event => set('slug', event.target.value)} placeholder="building-products-people-return-to" /></label><label>Article content<textarea required rows={8} value={form.content} onChange={event => set('content', event.target.value)} placeholder="Write the article content here…" /></label></div>
    <div className="form-section"><h3>Article cover <span className="optional">Optional</span></h3><p className="field-help">Upload a JPG, PNG, or WEBP image. It appears as the cover on the public article page.</p><input aria-label="Upload article cover" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || uploading} onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ''; }} />{uploading && <p className="field-help" role="status">Uploading image…</p>}{uploadError && <div className="error" role="alert">{uploadError}</div>}{form.thumbnail && <img className="admin-preview" src={form.thumbnail} alt="Cover preview" />}</div>
    <button type="submit" disabled={busy || uploading}>{busy ? 'Saving…' : uploading ? 'Uploading…' : 'Create blog'}</button>
  </form>;
}

function PortfolioForm({ busy, onSubmit }: { busy: boolean; onSubmit: (data: PublicRecord) => void }) {
  const [form, setForm] = useState({ title: '', slug: '', category: '', description: '', techStack: '', websiteUrl: '', githubUrl: '', images: '', featured: false, displayOrder: '0' });
  const [uploading, setUploading] = useState(false); const [uploadError, setUploadError] = useState('');
  const set = (key: keyof typeof form, value: string | boolean) => setForm(previous => ({ ...previous, [key]: value }));
  async function upload(files: FileList | null) { if (!files?.length) return; setUploading(true); setUploadError(''); try { const uploaded: string[] = []; for (const file of Array.from(files)) { const result = await contentMediaApi.upload(file); uploaded.push(mediaUrl(result.url)); } set('images', [form.images, ...uploaded].filter(Boolean).join('\n')); } catch (value) { setUploadError(errorMessage(value)); } finally { setUploading(false); } }
  return <form className="form-card content-form" onSubmit={event => { event.preventDefault(); onSubmit({ ...form, techStack: form.techStack.split(',').map(value => value.trim()).filter(Boolean), images: form.images.split(/\r?\n/).map(value => value.trim()).filter(Boolean), displayOrder: Number(form.displayOrder), websiteUrl: form.websiteUrl || undefined, githubUrl: form.githubUrl || undefined }); }}>
    <p className="eyebrow">Case studies</p><h2>Create portfolio item</h2><p className="form-intro">Present completed work with enough context for a prospective client to understand the outcome.</p>
    <div className="form-section"><h3>Project details</h3><label>Project title<input required minLength={2} value={form.title} onChange={event => set('title', event.target.value)} placeholder="e.g. Liquor Ledger" /></label><label>URL slug<span className="field-help">The readable address for this case study.</span><input required pattern="[a-z0-9-]+" value={form.slug} onChange={event => set('slug', event.target.value)} placeholder="liquor-ledger" /></label><div className="form-grid"><label>Category<input required value={form.category} onChange={event => set('category', event.target.value)} placeholder="Product engineering" /></label><label>Display order<span className="field-help">Lower numbers appear first.</span><input type="number" value={form.displayOrder} onChange={event => set('displayOrder', event.target.value)} /></label></div><label>Project description<textarea required minLength={10} rows={5} value={form.description} onChange={event => set('description', event.target.value)} placeholder="What was the challenge and what did Upserve deliver?" /></label><label>Technology used<span className="field-help">Separate technologies with commas.</span><input required value={form.techStack} onChange={event => set('techStack', event.target.value)} placeholder="React, FastAPI, MongoDB" /></label></div>
    <div className="form-section"><h3>Links & imagery <span className="optional">Optional</span></h3><label>Live project URL<span className="field-help">Shown as a “Visit live project” link on the public case study.</span><input type="url" value={form.websiteUrl} onChange={event => set('websiteUrl', event.target.value)} placeholder="https://client-project.com" /></label><label>Source repository URL<span className="field-help">Use this only when the repository is appropriate to share publicly.</span><input type="url" value={form.githubUrl} onChange={event => set('githubUrl', event.target.value)} placeholder="https://github.com/…" /></label><label>Project images<span className="field-help">Choose one or more JPG, PNG, or WEBP images. The first image is used as the cover.</span><input aria-label="Upload project images" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || uploading} onChange={event => { void upload(event.target.files); event.currentTarget.value = ''; }} /></label>{uploading && <p className="field-help" role="status">Uploading image(s)…</p>}{uploadError && <div className="error" role="alert">{uploadError}</div>}{form.images && <div className="uploaded-image-count">{form.images.split(/\r?\n/).filter(Boolean).length} image(s) ready for this case study.</div>}{form.images && <img className="admin-preview" src={form.images.split(/\r?\n/)[0]} alt="Project cover preview" />}</div>
    <label className="checkbox-label"><input type="checkbox" checked={form.featured} onChange={event => set('featured', event.target.checked)} /> Feature this case study publicly</label><button type="submit" disabled={busy || uploading}>{busy ? 'Saving…' : uploading ? 'Uploading…' : 'Create portfolio item'}</button>
  </form>;
}
