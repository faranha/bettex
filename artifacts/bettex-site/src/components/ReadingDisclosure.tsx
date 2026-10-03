import { Children, Fragment, isValidElement, type ReactNode, type ReactElement } from 'react';
import './reading-disclosure.css';

export function ReadingDisclosure({ title, hint, children, className = '', id, headingId, testId, asHeading = true, sectionDetail = false }: { asHeading?: boolean; testId?: string; title: ReactNode; headingId?: string; hint?: string; children: ReactNode; className?: string; id?: string; sectionDetail?: boolean }) {
  return (
    <details className={`reading ${className}`} id={id} data-testid={testId} data-section-detail={sectionDetail ? '' : undefined}>
      <summary className="reading__summary">
        <span className="reading__copy">
          {asHeading ? <h3 className="reading__title" id={headingId}>{title}</h3> : <span className="reading__title">{title}</span>}
          {hint ? <span className="reading__hint">{hint}</span> : null}
        </span>
        <span className="reading__action" aria-hidden="true">
          <span className="reading__open">Expandir</span>
          <span className="reading__close">Recolher</span>
          <svg viewBox="0 0 20 20" width="16" height="16"><path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </summary>
      <div className="reading__body">{children}</div>
    </details>
  );
}

/** Scoped expand/collapse-all controls: act on every <details> inside the element matching `scope`. */
export function ExpandControls({ scope, label }: { scope: string; label: string }) {
  const set = (open: boolean) => {
    document.querySelectorAll<HTMLDetailsElement>(`${scope} details`).forEach((d) => { d.open = open; });
  };
  return (
    <div className="reading-controls" role="group" aria-label={label}>
      <button type="button" onClick={() => set(true)}>Expandir tudo</button>
      <button type="button" onClick={() => set(false)}>Recolher tudo</button>
    </div>
  );
}

export type TopicInfo = { title: ReactNode; id?: string; drop: boolean } | 'bare' | null;

/** Default recognition: whitepaper subheads become topics; DocFacts, leads, callouts and keep-marked blocks stay visible. */
export function defaultTopicOf(el: ReactElement<{ children?: ReactNode; className?: string; id?: string }>, extra?: (el: ReactElement<{ children?: ReactNode; className?: string; id?: string }>) => TopicInfo): TopicInfo {
  const cls = typeof el.props.className === 'string' ? el.props.className : '';
  if (el.type === 'h3' && cls.includes('whitepaper__subhead')) return { title: el.props.children, id: el.props.id, drop: true };
  if (el.type === 'div' && /whitepaper__lead|whitepaper__aside-callout|reading-keep|whitepaper__closing/.test(cls)) return 'bare';
  return extra ? extra(el) : null;
}

type El = ReactElement<{ children?: ReactNode; className?: string; id?: string }>;

/** Splits children into visible overview/bare nodes and one disclosure per topic. Nothing is dropped except heading elements, which move into the summary (id preserved). */
export function groupTopics(nodes: ReactNode, titleOf: (el: El) => TopicInfo): ReactNode {
  type Seg = { bare: ReactNode } | { title: ReactNode; id?: string; heading: boolean; items: ReactNode[] };
  const segs: Seg[] = [];
  let cur: Extract<Seg, { items: ReactNode[] }> | null = null;
  for (const node of Children.toArray(nodes)) {
    const t = isValidElement(node) ? titleOf(node as El) : null;
    if (t === 'bare') { segs.push({ bare: node }); cur = null; }
    else if (t) { cur = { title: t.title, id: t.id, heading: t.drop, items: t.drop ? [] : [node] }; segs.push(cur); }
    else if (cur) cur.items.push(node);
    else segs.push({ bare: node });
  }
  const total = segs.filter((x) => 'items' in x).length;
  let n = 0;
  return <>{segs.map((x, i) => 'items' in x
    ? <ReadingDisclosure key={i} title={x.title} headingId={x.id} asHeading={x.heading} hint={`Tópico ${++n} de ${total} nesta seção`}>{x.items}</ReadingDisclosure>
    : <Fragment key={i}>{x.bare}</Fragment>)}</>;
}

/** Groups its own children by whitepaper subheads (used inside already-structured components). */
export function Topics({ children, bare = [] }: { children: ReactNode; bare?: unknown[] }) {
  return <>{groupTopics(children, (el) => defaultTopicOf(el, (e) => (bare.includes(e.type) ? 'bare' : null)))}</>;
}
