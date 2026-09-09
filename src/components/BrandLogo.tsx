import { useState } from 'react';

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="brand-logo-fallback">{compact ? 'U' : 'Upserve'}</span>;
  return <img className={`brand-logo ${compact ? 'brand-logo--compact' : ''}`} src="/logo.png" alt="Upserve" onError={() => setFailed(true)} />;
}
