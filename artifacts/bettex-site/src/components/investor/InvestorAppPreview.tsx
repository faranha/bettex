import { useRef, useState, type KeyboardEvent } from 'react';
import { BettexMark } from '@/components/BettexMark';
import { AgentMark, type AgentKind } from '@/components/hero/AgentMark';
import './InvestorAppPreview.css';

type ScreenId = 'visao' | 'dinheiro' | 'agentes' | 'resultados';
const agents: { name: string; area: string; kind: AgentKind }[] = [
  { name: 'PREDIX', area: 'Previsões', kind: 'predix' },
  { name: 'TRADEX', area: 'Ações e cripto', kind: 'tradex' },
  { name: 'SPORTIX', area: 'Esportes', kind: 'sportix' },
  { name: 'BETTIX', area: 'Cassino', kind: 'bettix' },
];
const screens: { id: ScreenId; label: string; title: string; text: string }[] = [
  { id: 'visao', label: 'Visão geral', title: 'Tudo da sua participação, numa tela só.', text: 'Acompanhe sua participação na BETTEX, os agentes e os créditos em reais em uma visão organizada.' },
  { id: 'dinheiro', label: 'Dinheiro e Pix', title: 'Reais entram e saem por Pix.', text: 'O app fala a língua de quem usa: depósito, lucro e saque em reais, com Pix. O token fica nos bastidores.' },
  { id: 'agentes', label: 'Agentes', title: 'Quatro agentes, cada um no seu mercado.', text: 'Descubra o que cada agente faz e em qual plataforma ele atua, sem jargão.' },
  { id: 'resultados', label: 'Resultados', title: 'Seu histórico de resultados em reais.', text: 'Consulte os resultados das operações e os créditos de lucro na sua conta, apresentados em reais.' },
];

function Phone({ screen }: { screen: ScreenId }) {
  return (
    <div className="ip-phone" role="group" aria-label="Tela conceitual do aplicativo, com dados ilustrativos">
      <div className="ip-phone__notch" />
      <div className="ip-phone__bar"><span className="ip-phone__logo"><BettexMark /></span><b>BETTEX</b><i>João da Silva</i></div>
      {screen === 'visao' && (
        <div className="ip-screen">
          <small>Sua participação</small>
          <h5>Participação ativa</h5>
          <div className="ip-card ip-card--dark"><small>Lucro creditado em reais</small><strong>R$ —</strong><em>exemplo sem valor</em></div>
          <div className="ip-row"><span>Agentes em operação</span><b>4</b></div>
          <div className="ip-row"><span>Último aviso</span><b>Apuração em andamento</b></div>
          <div className="ip-row"><span>Conta</span><b>Verificada, maior de 18</b></div>
        </div>
      )}
      {screen === 'dinheiro' && (
        <div className="ip-screen">
          <small>Dinheiro</small>
          <h5>Seu dinheiro em reais</h5>
          <div className="ip-card ip-card--dark"><small>Disponível</small><strong>R$ —</strong><em>exemplo sem valor</em></div>
          <div className="ip-pair"><span className="ip-fake">Depositar com Pix</span><span className="ip-fake ip-fake--ghost">Sacar com Pix</span></div>
          <div className="ip-row"><span>Lucro de exemplo</span><b>R$ —</b></div>
          <div className="ip-row"><span>Chave Pix</span><b>cadastrada</b></div>
        </div>
      )}
      {screen === 'agentes' && (
        <div className="ip-screen">
          <small>Agentes</small>
          <h5>Quem trabalha por você</h5>
          {agents.map((a) => (
            <div className="ip-agent" key={a.name}><span data-kind={a.kind}><AgentMark kind={a.kind} /></span><b>{a.name}</b><em>{a.area}</em></div>
          ))}
        </div>
      )}
      {screen === 'resultados' && (
        <div className="ip-screen">
          <small>Resultados</small>
          <h5>Resumo do período</h5>
          <div className="ip-card"><small>Lucro líquido realizado</small><strong>R$ —</strong><em>exemplo sem valor</em></div>
          <div className="ip-skeleton"><i /><i /><i /><i /><i /></div>
          <p className="ip-note">Esquema ilustrativo, sem dados reais. Perdas são compensadas antes de qualquer distribuição.</p>
        </div>
      )}
    </div>
  );
}

export function InvestorAppPreview() {
  const [current, setCurrent] = useState<ScreenId>('visao');
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const idx = screens.findIndex((s) => s.id === current);
  const active = screens[idx];

  function onKey(e: KeyboardEvent) {
    let n = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (idx + 1) % screens.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (idx - 1 + screens.length) % screens.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = screens.length - 1;
    else return;
    e.preventDefault();
    setCurrent(screens[n].id);
    refs.current[screens[n].id]?.focus();
  }

  return (
    <section id="visao-investidor" className="investor-preview" aria-labelledby="investor-preview-title" data-testid="section-visao-investidor">
      <div className="investor-preview__wrap">
        <div className="investor-preview__intro">
          <div>
            <p className="investor-preview__eyebrow">Por dentro da participação</p>
            <h2 id="investor-preview-title" className="investor-preview__title">Conheça o <em>APP da BETTEX</em></h2>
          </div>
          <p className="investor-preview__intro-text">Uma vitrine das telas que desenhamos para o investidor entender sua participação, sem complicação.</p>
        </div>

        <div className="ip-stage">
          <div className="ip-side">
            <span className="ip-tag" data-testid="status-conceito-visual">Conceito visual do aplicativo · sem operações reais</span>
            <div role="tablist" aria-label="Telas do aplicativo" aria-orientation="vertical" className="ip-tabs" onKeyDown={onKey}>
              {screens.map((s, i) => (
                <button key={s.id} ref={(el) => { refs.current[s.id] = el; }} role="tab" type="button" id={`ip-tab-${s.id}`}
                  aria-selected={current === s.id} aria-controls="ip-panel" tabIndex={current === s.id ? 0 : -1}
                  className="ip-tab" onClick={() => setCurrent(s.id)} data-testid={`tab-tela-${s.id}`}>
                  <span>0{i + 1}</span>{s.label}
                </button>
              ))}
            </div>
            <div id="ip-panel" role="tabpanel" aria-labelledby={`ip-tab-${current}`} className="ip-copy" tabIndex={0}>
              <h3>{active.title}</h3>
              <p>{active.text}</p>
            </div>
            <p className="ip-legal">Tela ilustrativa com nome fictício. Nada aqui recebe, guarda ou movimenta dinheiro. Resultados não são garantidos e envolvem risco de perda.</p>
          </div>
          <div className="ip-device" key={current}>
            <Phone screen={current} />
            <span className="ip-device__caption">Conceito visual · não é o app em funcionamento</span>
          </div>
        </div>
      </div>
    </section>
  );
}
