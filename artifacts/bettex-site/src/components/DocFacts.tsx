import { type ReactNode } from 'react';

export type Fact = { label: string; value: string; text?: string };

export function DocFacts({ title, facts, tone, cols }: { title: string; facts: Fact[]; tone?: 'accent'; cols?: 2 | 3 | 4 }) {
  return <aside className={`wp-facts${tone ? ' wp-facts--accent' : ''}`} aria-label={title}>
    <p className="wp-facts__title">{title}</p>
    <ul className={`wp-facts__grid wp-facts__grid--${cols ?? facts.length}`}>
      {facts.map(f => <li key={f.label}><span>{f.label}</span><strong>{f.value}</strong>{f.text ? <small>{f.text}</small> : null}</li>)}
    </ul>
  </aside>;
}

export function DocGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div className="wp-group"><p className="wp-group__title">{title}</p><div className="wp-group__body">{children}</div></div>;
}
