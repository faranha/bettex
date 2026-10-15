/** @jsxImportSource react */
import { useContext, type MouseEvent } from 'react';
import { t } from '@/lib/i18n';
import { groupReferenceItems, type OutlineItem } from './whitepaperOutline';
import { DocumentationMenuContext, DocumentationMenuItem } from './DocumentationMenuItem';

type Props = {
  items: readonly OutlineItem[];
  activeId: string;
  expanded: Readonly<Record<string, boolean>>;
  onToggle: (id: string, open: boolean) => void;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
};

export function DocumentationOutlineItems(props: Props) {
  const dropdown = useContext(DocumentationMenuContext);
  return <>{groupReferenceItems(props.items).map(({ item, children }) => {
    const open = props.expanded[item.id] ?? false;
    const childrenId = `${dropdown ? 1 : 0}-reference-menu-${item.id}`;
    return <li key={item.id}>
      <div className="whitepaper__toc-row">
         <DocumentationMenuItem><a href={`#${item.id}`}
          className={`whitepaper__toc-sublink level-${item.level}${props.activeId === item.id ? ' is-active' : ''}`}
          aria-current={props.activeId === item.id ? 'location' : undefined}
          onClick={event => props.onNavigate(event, item.id)} data-testid={`link-${item.id}`}>
          <span data-i18n="translated">{item.title}</span>
         </a></DocumentationMenuItem>
         {item.isReference && children.length > 0 && <DocumentationMenuItem keepOpen><button type="button"
          className="whitepaper__reference-toggle" data-i18n="translated"
          aria-expanded={open} aria-controls={childrenId}
          aria-label={`${open ? t('Recolher') : t('Expandir')} ${item.title}`}
          data-testid={`toggle-menu-${item.id}`}
          onClick={() => props.onToggle(item.id, !open)}>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"
            style={{ transform: open ? 'rotate(180deg)' : undefined }}>
            <path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
         </button></DocumentationMenuItem>}
      </div>
      {item.isReference && children.length > 0 && (!dropdown || open) && <ul id={childrenId}
        className="whitepaper__reference-menu-items" hidden={!open}>
        <DocumentationOutlineItems {...props} items={children} />
      </ul>}
    </li>;
  })}</>;
}
