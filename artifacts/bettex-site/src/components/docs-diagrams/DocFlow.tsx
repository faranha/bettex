import { type ReactNode } from 'react';
import './docs-diagrams.css';

export type FlowNode = { tag: string; title: string; text: string; tone?: 'blue' | 'gold' | 'teal' | 'ink' };

export function FlowLane({ label, nodes, dashed }: { label: string; nodes: FlowNode[]; dashed?: boolean }) {
  return (
    <div className={`wd-lane${dashed ? ' wd-lane--dashed' : ''}`}>
      <p className="wd-lane__label">{label}</p>
      <ol className="wd-lane__list" style={{ ['--wd-cols' as string]: nodes.length }}>
        {nodes.map((n) => (
          <li key={n.title} className={`wd-node wd-node--${n.tone ?? 'blue'}`}>
            <span className="wd-node__tag">{n.tag}</span>
            <strong>{n.title}</strong>
            <p>{n.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Link2({ label }: { label: string }) {
  return <div className="wd-drop" aria-hidden="true"><span>{label}</span></div>;
}

export function DocFigure({ id, label, title, children, caption }: { id: string; label: string; title: string; children: ReactNode; caption: ReactNode }) {
  return (
    <figure className="wd" id={id} data-testid={id} aria-label={label}>
      <p className="wd__eyebrow">{label}</p>
      <h5 className="wd__title">{title}</h5>
      {children}
      <figcaption className="wd__caption">{caption}</figcaption>
    </figure>
  );
}
