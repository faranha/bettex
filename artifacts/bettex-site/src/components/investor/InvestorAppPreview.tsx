import { useRef, useState, type KeyboardEvent } from 'react';
import { BettexMark } from '@/components/BettexMark';
import { PhoneScreen } from './PhoneScreens';
import { PreviewImage } from './PreviewImage';
import { allScreens, navGroups, type ScreenId } from './presentationData';
import './InvestorAppPreview.css';

const art: Record<string, { file: string; alt: string }> = {
  participacao: { file: 'participacao', alt: 'Carteira de couro verde aberta com fichas de token e esferas douradas ao redor' },
  bettex: { file: 'bettex-transparent', alt: 'Processador de inteligência artificial em vidro, com bola, cartas, esferas e ficha inteiras sobre fundo transparente' },
  resultados: { file: 'resultados-soft', alt: 'Balança dourada com fichas, ao lado de um livro-caixa e uma calculadora' },
  historico: { file: 'historico', alt: 'Livro de registros aberto, calendário de mesa, relógio e moedas' },
  hydra: { file: 'hydra-transparent', alt: 'Hidra de duas cabeças em metal preto com reflexos verdes, símbolo do Protocolo Hydra' },
};

export function InvestorAppPreview() {
  const [current, setCurrent] = useState<ScreenId>(allScreens[0].id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const idx = allScreens.findIndex((s) => s.id === current);
  const active = allScreens[idx];
  const isPerformance = current === 'resultados' || current === 'historico';

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
             <p className="investor-preview__eyebrow">Prévia do aplicativo</p>
            <h2 id="investor-preview-title" className="investor-preview__title">Conheça o <em>APP da BETTEX</em></h2>
          </div>
        </div>

        <div className={`ip-stage${isPerformance ? ' ip-stage--performance' : ''}`}>
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
              {!isPerformance && <p>{active.text}</p>}
            </div>
            {art[current] && (
              <figure className={`ip-art${current === 'bettex' || current === 'hydra' ? ' ip-art--transparent' : ''}${current === 'hydra' ? ' ip-art--hydra' : ''}`} key={`art-${current}`} data-testid={`arte-tela-${current}`}>
                <PreviewImage src={`${import.meta.env.BASE_URL}app/${art[current].file}.webp`} alt={art[current].alt} width={600} height={600} loading="lazy" decoding="async" />
              </figure>
            )}
          </div>
          <div className={`ip-device${current === 'hydra' ? ' ip-device--hydra' : ''}`} key={current}>
            <div className={`ip-phone${current === 'participacao' ? ' ip-phone--wallet' : current === 'hydra' ? ' ip-phone--hydra' : isPerformance ? ' ip-phone--performance' : ''}`} role="group" aria-label="Tela conceitual do aplicativo">
              <div className="ip-phone__notch" />
              <div className="ip-phone__bar"><span className="ip-phone__logo"><BettexMark /></span><b>BETTEX</b><i>João da Silva</i></div>
              <div className="ip-screen"><PhoneScreen id={current} /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
