/** @jsxImportSource react */
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { CryptoBarsArt } from './AgentArt';
import './AgentShowcase.css';

export function AgentShowcase({ variant = 'light', onEnter, showDisclaimer = true }: { variant?: 'light' | 'dark'; onEnter?: () => void; showDisclaimer?: boolean; showOtherAgents?: boolean }) {
  const { x, loc } = useX();
  const points = [
    x('Padrões de manipulação', 'Manipulation patterns', 'Patrones de manipulación'),
    x('Entradas e saídas possíveis', 'Possible entries and exits', 'Posibles entradas y salidas'),
    x('Universo aberto de moedas', 'Open coin universe', 'Universo abierto de monedas'),
  ];
  return <section className={`agx flex flex-col p-4 sm:p-6 ${variant === 'dark' ? 'agx-dark' : 'dcard'}`} data-variant={variant} data-testid="panel-agent-showcase" aria-labelledby="agx-title">
    {showDisclaimer && <p className="agx-kick">{x('Demo ALFA, sem dinheiro real', 'ALPHA demo, no real money', 'Demo ALFA, sin dinero real')}</p>}
    <h2 id="agx-title" className="agx-title">{x('IA para cripto, em desenvolvimento', 'AI for crypto, in development', 'IA para cripto, en desarrollo')}</h2>
    <article data-testid="card-agent-crypto" className="agx-crypto" style={{ marginTop: 16 }}>
      <CryptoBarsArt />
      <div className="agx-head"><h3>{x('Central da IA cripto', 'Crypto AI Center', 'Central de IA cripto')}</h3></div>
      <p>{x('Uma demonstração visual de como a IA pode ler o mercado de qualquer moeda, e não apenas de algumas. Os dados são simulados e não há operações reais.', 'A visual demonstration of how AI can read the market for any coin, not just a few. Data is simulated and there are no real transactions.', 'Una demostración visual de cómo la IA puede leer el mercado de cualquier moneda, no solo de unas pocas. Los datos son simulados y no hay operaciones reales.')}</p>
      <div className="agx-tick">{points.map(p => <span key={p}>{p}</span>)}</div>
      <p className="agx-note">{x('Sem garantia de resultado. O mercado cripto envolve risco.', 'No guarantee of results. Crypto markets involve risk.', 'Sin garantía de resultados. El mercado cripto implica riesgo.')}</p>
      <Link href={demoPath('central', loc)} onClick={onEnter} data-testid="link-agent-showcase-central" className="group agx-cta">{onEnter ? x('Entrar no demo cripto da Central da IA', 'Enter the crypto AI Center demo', 'Entrar en la demo cripto de la Central de IA') : x('Abrir a Central da IA (cripto)', 'Open the AI Center (crypto)', 'Abrir la Central de IA (cripto)')}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></Link>
    </article>
  </section>;
}
