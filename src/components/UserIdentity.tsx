import { useEffect, useState } from 'react';
import { authApi } from '../services/authApi';

const identityCache = new Map<string, string>();

export function UserIdentity({ id, fallback = 'Team member' }: { id?: string | null; fallback?: string }) {
  const [name, setName] = useState(id ? identityCache.get(id) : undefined);

  useEffect(() => {
    if (!id || identityCache.has(id)) return;
    let active = true;
    authApi.getUserIdentity(id)
      .then((user) => {
        identityCache.set(id, user.name);
        if (active) setName(user.name);
      })
      .catch(() => {
        if (active) setName(fallback);
      });
    return () => { active = false; };
  }, [fallback, id]);

  return <span>{name || (id ? 'Loading…' : fallback)}</span>;
}
