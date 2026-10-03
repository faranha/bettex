import type { ReactNode } from 'react';

export function TechnicalDetails({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="whitepaper__technical">
      <summary>{title}</summary>
      <div className="whitepaper__technical-body">{children}</div>
    </details>
  );
}