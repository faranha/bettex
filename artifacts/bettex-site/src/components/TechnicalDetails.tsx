import type { ReactNode } from 'react';

export function TechnicalDetails({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="whitepaper__technical">
      <h3 className="whitepaper__subhead">{title}</h3>
      <div className="whitepaper__technical-body" data-documentation-page-hidden="">{children}</div>
    </section>
  );
}