/** @jsxImportSource react */
import { Link } from 'wouter';
import { ArrowRight, Dices, Lock, Vote } from 'lucide-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { CasinoArt, CryptoBarsArt, PredictionArt } from './AgentArt';
import './AgentShowcase.css';

function ValueViz({ label }: { label: string }) {
  const { x } = useX();
  return <svg className="agx-viz" viewBox="0 0 320 220" role="img" aria-label={label}>
    <rect x="8" y="18" width="304" height="184" rx="22" fill="#0A1233" stroke="rgba(151,182,255,.3)" />
    <g transform="translate(168 34) rotate(9 62 65)">
      <rect width="124" height="130" rx="14" fill="#132D51" stroke="#427FAC" />
      <rect x="14" y="14" width="96" height="102" rx="3" fill="none" stroke="#81A7BE" />
      <path d="M14 65H110 M45 14V31H79V14 M45 116V99H79V116" fill="none" stroke="#81A7BE" />
      <circle cx="62" cy="65" r="16" fill="none" stroke="#81A7BE" />
    </g>
    <g transform="translate(32 40) rotate(-5 79 75)">
      <rect width="158" height="158" rx="16" fill="#142764" stroke="#608BFF" />
      <rect x="12" y="12" width="134" height="28" rx="8" fill="#2B59FF" />
      <text x="79" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill="#FFF">{x('ANÁLISE COM IA', 'AI ANALYSIS', 'ANÁLISIS CON IA')}</text>
      {[58, 86, 114].map(y => <g key={y}>
        <path d={`M18 ${y}l4 4 7-8`} fill="none" stroke="#F2B632" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="42" y={y - 5} width="64" height="5" rx="2.5" fill="#6484C9" />
        <rect x="42" y={y + 4} width="42" height="4" rx="2" fill="#35538E" />
      </g>)}
      <text x="79" y="146" textAnchor="middle" fontSize="9" fontWeight="800" fill="#F2B632">{x('ODDS · PROBABILIDADE', 'ODDS · PROBABILITY', 'CUOTAS · PROBABILIDAD')}</text>
    </g>
    <circle cx="257" cy="173" r="27" fill="#F2B632" />
    <path d="M247 166l10-7 10 7-4 12h-12z M257 146v13 M233 182l18-4 M281 182l-18-4" fill="none" stroke="#0A1233" strokeWidth="2" />
  </svg>;
}

export function AgentShowcase({ variant = 'light', onEnter, showDisclaimer = true }: { variant?: 'light' | 'dark'; onEnter?: () => void; showDisclaimer?: boolean }) {
  const { x, loc } = useX();
  const off = [
    { id: 'prediction', Art: PredictionArt, Icon: Vote, color: '#6B5FA8', name: x('Mercados de previsão', 'Prediction Markets', 'Mercados de predicción'), tag: x('Probabilidades', 'Probabilities', 'Probabilidades'), desc: x('Próximo lançamento. Ainda não está ativo nesta demo.', 'Next release. Not active in this demo yet.', 'Próximo lanzamiento. Aún no está activo en esta demo.') },
    { id: 'casino', Art: CasinoArt, Icon: Dices, color: '#A8453F', name: x('Cassino', 'Casino', 'Casino'), tag: x('Rodadas e mesas', 'Rounds and tables', 'Rondas y mesas'), desc: x('Próximo lançamento. Ainda não está ativo nesta demo.', 'Next release. Not active in this demo yet.', 'Próximo lanzamiento. Aún no está activo en esta demo.') },
  ];
  const sportsNext = x('Ainda não disponível', 'Not live yet', 'Aún no disponible');
  const sports = [x('Futebol', 'Football', 'Fútbol'), x('Basquete', 'Basketball', 'Baloncesto'), x('Tênis', 'Tennis', 'Tenis'), 'UFC'];
  return <section className={`agx flex flex-col p-4 sm:p-6 ${variant === 'dark' ? 'agx-dark' : 'dcard'}`} data-variant={variant} data-testid="panel-agent-showcase" aria-labelledby="agx-title">
    {showDisclaimer && <p className="agx-kick">{x('Demo ALFA, sem dinheiro real', 'ALPHA demo, no real money', 'Demo ALFA, sin dinero real')}</p>}
    <h2 id="agx-title" className="agx-title">{x('Vem aí: Esportes com Value Betting', 'Coming next: Sports Value Betting', 'Próximamente: Deportes con Value Betting')}</h2>
    <article data-testid="card-agent-sports" aria-disabled="true" data-next="true" className="agx-hero">
      <div>
        <div className="agx-next">
          <span className="agx-badge">{x('Próximo lançamento', 'Next release', 'Próximo lanzamiento')}</span>
          <span data-testid="status-agent-sports" className="agx-badge agx-badge-2"><Lock className="h-3 w-3" aria-hidden />{sportsNext}</span>
        </div>
        <h3>{x('Inteligência artificial para encontrar apostas de valor.', 'AI built to find value in sports betting.', 'Inteligencia artificial para detectar apuestas de valor.')}</h3>
        <p>{x('O próximo agente vai comparar odds com probabilidades estimadas para identificar oportunidades de valor em diferentes esportes.', 'Our next agent will compare odds with estimated probabilities to identify value opportunities across sports.', 'El próximo agente comparará cuotas con probabilidades estimadas para identificar oportunidades de valor en distintos deportes.')}</p>
        <ul className="agx-sports" aria-label={x('Exemplos de esportes', 'Sport examples', 'Ejemplos de deportes')}>{sports.map(s => <li key={s}>{s}</li>)}</ul>
        <p className="agx-note">{x('Ainda não está ativo nesta demo. Análise de probabilidades não garante resultado nem lucro.', 'Not active in this demo yet. Probability analysis does not guarantee any result or profit.', 'Aún no está activo en esta demo. El análisis de probabilidades no garantiza resultado ni ganancia.')}</p>
      </div>
      <ValueViz label={x('Ilustração: odds, probabilidade e oportunidade de valor', 'Illustration: odds, probability and value opportunity', 'Ilustración: cuotas, probabilidad y oportunidad de valor')} />
    </article>
    <div className="agx-row">
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
        {off.map(a => <li key={a.id} data-testid={`card-agent-${a.id}`} aria-disabled="true" className="agx-off pointer-events-none select-none" style={{ ['--agx-c' as string]: a.color }}>
          <span className="agx-top"><span className="agx-ic"><a.Icon className="h-5 w-5" aria-hidden /></span>
          <span data-testid={`status-agent-${a.id}`} className="agx-st"><Lock className="h-3 w-3" aria-hidden />{x('Futuro · desativado', 'Future · disabled', 'Futuro · desactivado')}</span></span>
          <span className="agx-tx"><b>{a.name}</b><small>{a.tag}</small></span>
          <a.Art />
        </li>)}
      </ul>
    </div>
  </section>;
}
