/** @jsxImportSource react */
import { useEffect, useState, type ReactNode } from 'react';
import { DemoActionNotice } from './DemoActionNotice';
import { interfaceDemoPath, isOperationalControl, NOTICE_EVENT, openDemoNotice } from './runtime';

/** Document capture also covers Radix portals, keyboard activation and forms. */
export function InterfaceDemoProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    const intercept = (event: Event) => {
      if (!interfaceDemoPath(window.location.pathname) || !(event.target instanceof Element)) return;
      if (event.target.closest('[data-testid="interface-demo-notice"]')) return;
      const control = event.target.closest('button,a,input[type="checkbox"],input[type="file"],[role="menuitem"],[role="button"]');
      if (event.type === 'submit' || control && isOperationalControl(control)) {
        event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
        openDemoNotice();
      }
    };
    window.addEventListener(NOTICE_EVENT, show);
    document.addEventListener('click', intercept, true);
    document.addEventListener('submit', intercept, true);
    return () => {
      window.removeEventListener(NOTICE_EVENT, show);
      document.removeEventListener('click', intercept, true);
      document.removeEventListener('submit', intercept, true);
    };
  }, []);
  return <>{children}<DemoActionNotice open={open} onOpenChange={setOpen} /></>;
}
