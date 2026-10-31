/** @jsxImportSource react */
import { Link } from 'wouter';
import { ArrowRight, Dices, Lock, Vote } from 'lucide-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { CasinoArt, CryptoBarsArt, PredictionArt, SportsBrainArt } from './AgentArt';
import './AgentShowcase.css';

function ValueViz({ label }: { label: string }) {
  const { x } = useX();
  return <SportsBrainArt label={label} l1={x('TRADING COM IA', 'AI TRADING', 'TRADING CON IA')} l2={x('ARBITRAGEM · EXECUÇÃO', 'ARBITRAGE · EXECUTION', 'ARBITRAJE · EJECUCIÓN')} />;
}

export function AgentShowcase({ variant = 'light', onEnter, showDisclaimer = true, showOtherAgents = true }: { variant?: 'light' | 'dark'; onEnter?: () => void; showDisclaimer?: boolean; showOtherAgents?: boolean }) {
  const { x, loc } = useX();
  const off = [
    { id: 'prediction', Art: PredictionArt, Icon: Vote, color: '#99B0D5', name: x('Mercados de previsão', 'Prediction Markets', 'Mercados de predicción'), tag: x('Probabilidades', 'Probabilities', 'Probabilidades'), desc: x('Próximo lançamento. Ainda não está ativo nesta demo.', 'Next release. Not active in this demo yet.', 'Próximo lanzamiento. Aún no está activo en esta demo.') },
    { id: 'casino', Art: CasinoArt, Icon: Dices, color: '#D7BE70', name: x('Cassino', 'Casino', 'Casino'), tag: x('Rodadas e mesas', 'Rounds and tables', 'Rondas y mesas'), desc: x('Próximo lançamento. Ainda não está ativo nesta demo.', 'Next release. Not active in this demo yet.', 'Próximo lanzamiento. Aún no está activo en esta demo.') },
  ];
  const sportsNext = x('Ainda não disponível', 'Not live yet', 'Aún no disponible');
  const sports = [x('Futebol', 'Football', 'Fútbol'), x('Basquete', 'Basketball', 'Baloncesto'), x('Tênis', 'Tennis', 'Tenis'), 'UFC'];
  return <section className={`agx flex flex-col p-4 sm:p-6 ${variant === 'dark' ? 'agx-dark' : 'dcard'}`} data-variant={variant} data-testid="panel-agent-showcase" aria-labelledby="agx-title">
    {showDisclaimer && <p className="agx-kick">{x('Demo ALFA, sem dinheiro real', 'ALPHA demo, no real money', 'Demo ALFA, sin dinero real')}</p>}
    <h2 id="agx-title" className="agx-title">{x('Vem aí: Esportes com Surebet', 'Coming next: Sports Surebet', 'Próximamente: Deportes con Surebet')}</h2>
    <article data-testid="card-agent-sports" aria-disabled="true" data-next="true" className="agx-hero">
      <div>
        <div className="agx-next">
          <span className="agx-badge">{x('Próximo lançamento', 'Next release', 'Próximo lanzamiento')}</span>
          <span data-testid="status-agent-sports" className="agx-badge agx-badge-2"><Lock className="h-3 w-3" aria-hidden />{sportsNext}</span>
        </div>
        <h3>{x('Inteligência artificial para operar surebets ao redor do mundo.', 'Artificial intelligence to execute surebets worldwide.', 'Inteligencia artificial para ejecutar surebets en todo el mundo.')}</h3>
        <p>{x('O próximo agente de IA será desenvolvido para identificar e executar operações de arbitragem esportiva, com gestão de exposição e limites de risco.', 'The next AI agent will be developed to identify and execute sports arbitrage operations, with exposure management and risk limits.', 'El próximo agente de IA se desarrollará para identificar y ejecutar operaciones de arbitraje deportivo, con gestión de exposición y límites de riesgo.')}</p>
        <ul className="agx-sports" aria-label={x('Exemplos de esportes', 'Sport examples', 'Ejemplos de deportes')}>{sports.map(s => <li key={s}>{s}</li>)}</ul>
        <p className="agx-note">{x('Ainda não está ativo nesta demo. A execução depende das odds, da liquidez e dos limites das plataformas; não há lucro garantido.', 'Not active in this demo yet. Execution depends on odds, liquidity and platform limits; profit is not guaranteed.', 'Aún no está activo en esta demo. La ejecución depende de las cuotas, la liquidez y los límites de las plataformas; no hay ganancias garantizadas.')}</p>
      </div>
      <ValueViz label={x('Ilustração de inteligência artificial para execução de arbitragem esportiva', 'Illustration of artificial intelligence executing sports arbitrage', 'Ilustración de inteligencia artificial para ejecutar arbitraje deportivo')} />
    </article>
    {showOtherAgents && <div className="agx-row">
      <article data-testid="card-agent-crypto" className="agx-crypto"><CryptoBarsArt />
        <div className="agx-head"><span data-testid="status-agent-crypto" className="agx-live"><span className="console-dot !h-1.5 !w-1.5" />{x('Disponível agora', 'Available now', 'Disponible ahora')}</span><h3>{x('Cripto', 'Crypto', 'Cripto')}</h3></div>
        <div className="agx-mid">
          <div className="agx-midtx">
            <p>{x('Demo ativa com BTC, ETH e SOL. Acompanhe as decisões na Central da IA.', 'Active demo with BTC, ETH and SOL. Follow the decisions in the AI Center.', 'Demo activa con BTC, ETH y SOL. Sigue las decisiones en la Central de IA.')}</p>
            <div className="agx-tick" aria-label="BTC ETH SOL"><span>BTC</span><span>ETH</span><span>SOL</span></div>
          </div>
        </div>
        <Link href={demoPath('central', loc)} onClick={onEnter} data-testid="link-agent-showcase-central" className="group agx-cta">{onEnter ? x('Entrar no demo cripto da Central da IA', 'Enter the crypto AI Center demo', 'Entrar en la demo cripto de la Central de IA') : x('Abrir a Central da IA (cripto)', 'Open the AI Center (crypto)', 'Abrir la Central de IA (cripto)')}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></Link>
      </article>
      <ul className="agx-list">
        {off.map(a => <li key={a.id} data-testid={`card-agent-${a.id}`} aria-disabled="true" data-agent={a.id} className="agx-off pointer-events-none select-none" style={{ ['--agx-c' as string]: a.color }}>
          <span className="agx-top"><span className="agx-ic"><a.Icon className="h-5 w-5" aria-hidden /></span>
          <span data-testid={`status-agent-${a.id}`} className="agx-st"><Lock className="h-3 w-3" aria-hidden />{x('Futuro · desativado', 'Future · disabled', 'Futuro · desactivado')}</span></span>
          <span className="agx-tx"><b>{a.name}</b><small>{a.tag}</small></span>
          <a.Art />
        </li>)}
      </ul>
    </div>}
  </section>;
}
