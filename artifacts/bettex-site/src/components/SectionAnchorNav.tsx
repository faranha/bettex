import { useEffect, useRef, useState } from 'react';
import { t, useLocale } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import './pitch/PitchSectionNav.css';

type SectionTarget = { id: string; label: string };

export function SectionAnchorNav({
  sections, label, ariaLabel, offsetProperty, onNavigate, labelFor, menuOpen = false, styledMobile = false, 'data-testid': testId,
}: {
  sections: readonly [SectionTarget, ...SectionTarget[]];
  label: string;
  ariaLabel: string;
  offsetProperty: '--pitch-sticky-h' | '--home-sticky-h';
  onNavigate: () => void;
  menuOpen?: boolean;
  styledMobile?: boolean;
  labelFor?: (section: SectionTarget) => string;
  'data-testid': string;
}) {
  const locale = useLocale();
  const nav = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>(sections[0].id);
  const prefix = testId.replace(/-section-nav$/, '');
  const sectionLabel = (section: SectionTarget) => labelFor ? labelFor(section) : t(section.label);

  useEffect(() => {
    const element = nav.current;
    const header = element?.closest('header');
    const primaryRow = header?.firstElementChild;
    if (!element || !header || !primaryRow) return;
    let mounted = true;
    let frame = 0;
    let height = 0;
    const updateActive = () => {
      if (!mounted || menuOpen || header.querySelector('button[aria-expanded="true"]')) return;
      let current = sections[0].id;
      for (const section of sections) {
        const bounds = document.getElementById(section.id)?.getBoundingClientRect();
        if (bounds && bounds.top <= height + 24) current = section.id;
      }
      setActive(current);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActive);
    };
    const measure = () => {
      const style = getComputedStyle(header);
      // An expanded mobile page menu must not change the anchor offset.
      height = primaryRow.getBoundingClientRect().height + element.getBoundingClientRect().height
        + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      document.documentElement.style.setProperty(offsetProperty, `${height}px`);
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(primaryRow);
    observer.observe(element);
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('hashchange', schedule);
    void document.fonts.ready.then(() => { if (mounted) measure(); });
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      window.removeEventListener('hashchange', schedule);
      document.documentElement.style.removeProperty(offsetProperty);
    };
  }, [locale, sections, offsetProperty, menuOpen]);

  const jump = (id: string) => {
    onNavigate();
    setActive(id);
    window.location.hash = id;
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' }));
  };

  return <nav ref={nav} className="pitch-subnav" aria-label={t(ariaLabel)} data-testid={testId}>
    <div className="page-wrap">
      <div className="pitch-subnav-desktop">
        <span className="pitch-subnav-context mono" data-i18n="translated">{t(label)}</span>
        <div className="pitch-subnav-links">
        {sections.map(section => <a key={section.id} href={`#${section.id}`}
          data-i18n="translated" data-testid={`${prefix}-nav-${section.id}`}
          aria-current={active === section.id ? 'location' : undefined}
          onClick={() => { onNavigate(); setActive(section.id); }}>{sectionLabel(section)}</a>)}
        </div>
      </div>
      <div className="pitch-subnav-mobile">
        <span className="mono" data-i18n="translated">{t(label)}</span>
        {styledMobile ? <Select value={active} onValueChange={jump}>
          <SelectTrigger className="pitch-subnav-select-trigger" aria-label={t(ariaLabel)} data-testid={`${prefix}-section-select`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="pitch-subnav-select-content" position="popper" align="end" sideOffset={4} collisionPadding={12} data-testid={`${prefix}-section-options`}>
            {sections.map(section => <SelectItem key={section.id} value={section.id} className="pitch-subnav-select-item" data-i18n="translated">{sectionLabel(section)}</SelectItem>)}
          </SelectContent>
        </Select> : <select value={active} onChange={event => jump(event.target.value)} aria-label={t(ariaLabel)} data-testid={`${prefix}-section-select`}>
          {sections.map(section => <option key={section.id} value={section.id} data-i18n="translated">{sectionLabel(section)}</option>)}
        </select>}
      </div>
    </div>
  </nav>;
}