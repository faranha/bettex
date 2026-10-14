import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { t } from '@/lib/i18n';
import './DocumentationRulesTable.css';

type Paragraph = ReactElement<{ children?: ReactNode }>;

/** Keep the original rule text, links and anchors; only change its presentation. */
export function DocumentationRulesTable({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children).filter(isValidElement).map(node => {
    const paragraph = node as Paragraph;
    const parts = Children.toArray(paragraph.props.children);
    const first = parts[0];
    const title = isValidElement(first) && first.type === 'strong' ? first : undefined;
    const body = title ? parts.slice(1) : parts;
    const hasBody = body.some(part => typeof part !== 'string' || part.trim());
    return { paragraph, title, body, hasBody };
  });
  const numbered = rows.every(row => !row.title);
  return <div className="documentation-rules">
    <table className={`documentation-rules__table${numbered ? ' documentation-rules__table--numbered' : ''}`}
      aria-label={t('Regras e condições')} data-testid="documentation-rules-table">
      <thead><tr><th scope="col">{t('Regra')}</th><th scope="col">{t('Aplicação e condições')}</th></tr></thead>
      <tbody>{rows.map(({ paragraph, title, body, hasBody }, index) =>
        <tr key={paragraph.key ?? index}>
          {title && !hasBody
            ? <td colSpan={2}>{paragraph}</td>
            : <>
              <th scope="row">{title ?? String(index + 1).padStart(2, '0')}</th>
              <td data-label={t('Aplicação e condições')}>{cloneElement(paragraph, {}, body)}</td>
            </>}
        </tr>)}</tbody>
    </table>
  </div>;
}
