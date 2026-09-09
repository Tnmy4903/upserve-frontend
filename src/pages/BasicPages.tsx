import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ShieldOff } from 'lucide-react';

export function ForbiddenPage() {
  return <main className="auth-page"><section className="auth-card permission-card" role="alert"><ShieldOff size={24} aria-hidden="true" /><h1>You don’t have access to this</h1><Link className="button-link" to="/app">Return to Dashboard</Link></section></main>;
}

export function NotFoundPage() {
  return <main className="not-found-page"><div className="not-found-orbit" aria-hidden="true"><span>404</span></div><section className="not-found-card"><p className="eyebrow">Page not found</p><h1>This page took a wrong turn.</h1><p className="muted">The page you’re looking for doesn’t exist or may have moved. Let’s get you back somewhere useful.</p><div className="not-found-actions"><Link className="button-link" to="/"><Compass size={16} aria-hidden="true" /> Go home</Link><Link className="secondary button-link" to="/app">Open workspace <ArrowRight size={16} aria-hidden="true" /></Link></div></section></main>;
}
