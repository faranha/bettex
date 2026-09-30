import { useRef, useState, type KeyboardEvent } from 'react';
import { BettexMark } from '@/components/BettexMark';
import { PhoneScreen } from './PhoneScreens';
import { allScreens, navGroups, type ScreenId } from './presentationData';
import './InvestorAppPreview.css';

export function InvestorAppPreview() {
  const [current, setCurrent] = useState<ScreenId>('visao');
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const idx = allScreens.findIndex((s) => s.id === current);
  const active = allScreens[idx];

  function go(n: number) {
    const s = allScreens[(n + allScreens.length) % allScreens.length];
    setCurrent(s.id);
    refs.current[s.id]?.focus();
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(idx + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(idx - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(allScreens.length - 1);
    else return;
    e.preventDefault();
  }

  return (
    <section id="visao-investidor" className="investor-preview" aria-labelledby="investor-preview-title" data-testid="section-visao-investidor">
      <div className="investor-preview__wrap">
        <div className="investor-preview__intro">
          <div>
            <p className="investor-preview__eyebrow">Por dentro da participação</p>
            <h2 id="investor-preview-title" className="investor-preview__title">Conheça o <em>APP da BETTEX</em></h2>
          </div>
        </div>

        <div className="ip-stage">
          <div className="ip-side">
            <div role="tablist" aria-label="Telas do aplicativo" aria-orientation="vertical" className="ip-nav" onKeyDown={onKey}>
              {navGroups.map((g) => (
                <div className="ip-group" key={g.label} role="presentation">
                  <p className="ip-group__label" aria-hidden="true">{g.label}</p>
                  <div className="ip-group__items" role="presentation">
                    {g.items.map((s) => (
                      <button key={s.id} ref={(el) => { refs.current[s.id] = el; }} role="tab" type="button" id={`ip-tab-${s.id}`}
                        aria-selected={current === s.id} aria-controls="ip-panel" tabIndex={current === s.id ? 0 : -1}
                        className="ip-tab" onClick={() => setCurrent(s.id)} data-testid={`tab-tela-${s.id}`}>{s.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div id="ip-panel" role="tabpanel" aria-labelledby={`ip-tab-${current}`} className="ip-copy" tabIndex={0}>
              <h3>{active.title}</h3>
              <p>{active.text}</p>
            </div>
          </div>
          <div className="ip-device" key={current}>
            <div className="ip-phone" role="group" aria-label="Tela conceitual do aplicativo, com dados ilustrativos">
              <div className="ip-phone__notch" />
              <div className="ip-phone__bar"><span className="ip-phone__logo"><BettexMark /></span><b>BETTEX</b><i>João da Silva</i></div>
              <p className="ip-account-caption">Conta de exemplo</p>
              <div className="ip-screen"><PhoneScreen id={current} /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
