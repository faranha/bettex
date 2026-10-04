import { Fragment, type ReactNode } from 'react';
import './doc-media.css';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export function DocImage({ src, alt, caption, wide }: { src: string; alt: string; caption: string; wide?: boolean }) {
  return <figure className={`doc-media${wide ? ' doc-media--wide' : ''}`}>
    <img src={asset(src)} alt={alt} loading="lazy" decoding="async" width={600} height={wide ? 375 : 600} />
    <figcaption><span>Ilustração conceitual</span><p>{caption}</p></figcaption>
  </figure>;
}

export function AgentPortrait({ file }: { file: string }) {
  return <img className="doc-agent__portrait" src={asset(`agents/${file}`)} alt="" loading="lazy" decoding="async" width={64} height={64} />;
}

export function DocTerms({ id, label, items, note }: { id?: string; label?: string; items: [string, ReactNode][]; note?: string }) {
  return <div className="doc-terms" id={id}>
    {label && <p className="doc-terms__label">{label}</p>}
    <dl>{items.map(([term, def]) => <Fragment key={term}><dt>{term}</dt><dd>{def}</dd></Fragment>)}</dl>
    {note && <p className="doc-terms__note">{note}</p>}
  </div>;
}

export function Dot({ items }: { items: string[] }) {
  return <>{items.map((item, i) => <Fragment key={item}>{i > 0 && ' · '}{item}</Fragment>)}</>;
}
