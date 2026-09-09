import type { ReactNode } from 'react';

export interface ResponsiveRecordField {
  label: string;
  value: ReactNode;
  className?: string;
}

export function ResponsiveRecordCard({
  title,
  subtitle,
  titleMeta,
  fields,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  titleMeta?: ReactNode;
  fields: ResponsiveRecordField[];
  actions?: ReactNode;
}) {
  return <article className="responsive-record-card">
    <header className="responsive-record-card__header">
      <div className="responsive-record-card__identity">
        <strong>{title}</strong>
        {subtitle && <span className="muted">{subtitle}</span>}
      </div>
      {titleMeta && <div className="responsive-record-card__meta">{titleMeta}</div>}
    </header>
    <dl className="responsive-record-card__fields">
      {fields.map(field => <div className={field.className} key={field.label}>
        <dt>{field.label}</dt>
        <dd>{field.value}</dd>
      </div>)}
    </dl>
    {actions && <footer className="responsive-record-card__actions">{actions}</footer>}
  </article>;
}
