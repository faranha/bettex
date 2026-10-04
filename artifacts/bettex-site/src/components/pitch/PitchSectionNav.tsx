import { useEffect, useRef, useState } from 'react';
import { t, useLocale } from '@/lib/i18n';
import './PitchSectionNav.css';

const sections = [
  { id: 'visao', label: 'Visão' },
  { id: 'problema', label: 'Problema' },
  { id: 'agora', label: 'IA e trabalho' },
  { id: 'resgatar-futuro', label: 'Resgatar o futuro' },
  { id: 'solucao', label: 'Solução' },
  { id: 'diferencial', label: 'Diferenciação' },
  { id: 'fundador', label: 'Fundador' },
  { id: 'economia', label: 'Economia' },
  { id: 'token', label: 'Token' },
  { id: 'publico', label: 'Go to market' },
  { id: 'recursos', label: 'Recursos e riscos' },
] as const;

export function PitchSectionNav({ onNavigate }: { onNavigate: () => void }) {
  const locale = useLocale();
  const nav = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>(sections[0].id);

  useEffect(() => {
    const element = nav.current;
    const header = element?.closest('header');
    const primaryRow = header?.firstElementChild;
    if (!element || !header || !primaryRow) return;
    let mounted = true;
    let frame = 0;
    let height = 0;
    const updateActive = () => {
      if (!mounted) return;
      let current: string = sections[0].id;
      for (const section of sections) {
        const target = document.getElementById(section.id);
        if (target && target.getBoundingClientRect().top <= height + 24) current = section.id;
      }
      setActive(current);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActive);
    };
    const measure = () => {
      const style = getComputedStyle(header);
      // Exclude the temporarily expanded mobile site menu.
      height = primaryRow.getBoundingClientRect().height + element.getBoundingClientRect().height
        + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      document.documentElement.style.setProperty('--pitch-sticky-h', `${height}px`);
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
      document.documentElement.style.removeProperty('--pitch-sticky-h');
    };
  }, [locale]);

  const jump = (id: string) => {
    onNavigate();
    setActive(id);
    window.location.hash = id;
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' }));
  };

  return <nav ref={nav} className="pitch-subnav" aria-label={t('Seções do Pitch')} data-testid="pitch-section-nav">
    <div className="page-wrap">
      <div className="pitch-subnav-links">
        {sections.map(section => <a key={section.id} href={`#${section.id}`}
          data-i18n="translated" data-testid={`pitch-nav-${section.id}`}
          aria-current={active === section.id ? 'location' : undefined}
          onClick={() => { onNavigate(); setActive(section.id); }}>{t(section.label)}</a>)}
      </div>
      <label className="pitch-subnav-mobile">
        <span className="mono">Pitch</span>
        <select value={active} onChange={event => jump(event.target.value)} aria-label={t('Seções do Pitch')} data-testid="pitch-section-select">
          {sections.map(section => <option key={section.id} value={section.id} data-i18n="translated">{t(section.label)}</option>)}
        </select>
      </label>
    </div>
  </nav>;
}