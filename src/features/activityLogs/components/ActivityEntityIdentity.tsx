import { useEffect, useState } from 'react';
import { apiRequest } from '../../../services/apiClient';

const cache = new Map<string, string>();
const pathFor = (entity: string, id: string) => {
  const value = encodeURIComponent(id);
  switch (entity.toLowerCase()) {
    case 'project': return `/api/projects/${value}`;
    case 'lead': return `/api/leads/${value}`;
    case 'quotation': return `/api/quotations/${value}`;
    case 'requirement': return `/api/requirements/${value}`;
    case 'deliverable': return `/api/deliverables/${value}`;
    case 'invoice': return `/api/invoices/${value}`;
    default: return null;
  }
};

const nameFrom = (entity: string, data: Record<string, unknown>) => {
  const fields = entity.toLowerCase() === 'lead' ? ['contactPerson', 'companyName', 'email'] : entity.toLowerCase() === 'invoice' ? ['invoiceNumber', 'title'] : ['title', 'name', 'quotationNumber', 'businessName'];
  return fields.map(field => data[field]).find(value => typeof value === 'string' && value.trim()) as string | undefined;
};

export function ActivityEntityIdentity({ entity, id }: { entity: string; id: string }) {
  const key = `${entity}:${id}`; const [name, setName] = useState(cache.get(key));
  useEffect(() => {
    const path = pathFor(entity, id);
    if (!path || cache.has(key)) return;
    let active = true;
    apiRequest<Record<string, unknown>>(path).then(data => { const resolved = nameFrom(entity, data); if (resolved) { cache.set(key, resolved); if (active) setName(resolved); } }).catch(() => undefined);
    return () => { active = false; };
  }, [entity, id, key]);
  return <span>{name || entity.replace(/[_-]/g, ' ').replace(/^./, value => value.toUpperCase())}</span>;
}
