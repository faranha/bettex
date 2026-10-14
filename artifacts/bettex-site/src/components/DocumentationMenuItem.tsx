/** @jsxImportSource react */
import { createContext, useContext, type ReactElement } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export const DocumentationMenuContext = createContext(false);

/** Use the site's dropdown behavior on mobile without changing desktop links. */
export function DocumentationMenuItem({ children, keepOpen = false }: {
  children: ReactElement;
  keepOpen?: boolean;
}) {
  const dropdown = useContext(DocumentationMenuContext);
  return dropdown
    ? <DropdownMenuItem asChild onSelect={keepOpen ? event => event.preventDefault() : undefined}>{children}</DropdownMenuItem>
    : children;
}
