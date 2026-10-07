/** @jsxImportSource react */
import { Link } from 'wouter';
import { ArrowRight, Bitcoin, Dices, Lock, Trophy, Vote } from 'lucide-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';

export function AgentShowcase({ variant = 'light', onEnter }: { variant?: 'light' | 'dark'; onEnter?: () => void }) {
  const { x, loc } = useX();
  const off = [
    { id: 'prediction', Icon: Vote, color: '#6B5FA8', name: x('Mercados de previsão', 'Prediction Markets', 'Mercados de predicción'), tag: x('Probabilidades', 'Probabilities', 'Probabilidades') },
    { id: 'sports', Icon: Trophy, color: '#B8692F', name: x('Esportes', 'Sports', 'Deportes'), tag: x('Odds e jogos', 'Odds and games', 'Cuotas y juegos') },
    { id: 'casino', Icon: Dices, color: '#A8453F', name: x('Cassino', 'Casino', 'Casino'), tag: x('Rodadas e mesas', 'Rounds and tables', 'Rondas y mesas') },
  ];
  return <section className={`agx flex flex-col p-4 sm:p-6 ${variant === 'dark' ? 'agx-dark' : 'dcard'}`} data-variant={variant} data-testid="panel-agent-showcase" aria-labelledby="agx-title">
    <p className="text-[11px] font-bold uppercase tracking-widest text-[#0A6657]">{x('Demo ALFA, sem dinheiro real', 'ALPHA demo, no real money', 'Demo ALFA, sin dinero real')}</p>
    <h2 id="agx-title" className="mt-1 text-2xl font-extrabold text-[#1B2A41] sm:text-3xl">{x('Quatro agentes. Cripto já está ativo.', 'Four agents. Crypto is already active.', 'Cuatro agentes. Cripto ya está activo.')}</h2>
    <div className="order-2 mt-5 grid gap-3 lg:order-1 lg:grid-cols-[1.4fr_1fr]">
      <article data-testid="card-agent-crypto" className="agx-on rounded-3xl border-2 border-[#F6D77E] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span data-testid="status-agent-crypto" className="inline-flex items-center gap-1.5 rounded-full bg-[#F6D77E] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0B2A2A]"><span className="console-dot !h-1.5 !w-1.5 !bg-[#0B2A2A]" />{x('Ativo', 'Active', 'Activo')}</span>
          <Bitcoin className="h-8 w-8 text-[#F6D77E]" aria-hidden />
        </div>
        <h3 className="mt-4 text-3xl font-extrabold sm:text-4xl">{x('Cripto', 'Crypto', 'Cripto')}</h3>
        <p className="mt-2 max-w-md text-base text-[#D5F3E6]">{x('Foco em BTC, ETH e SOL. Acompanhe as decisões na Central da IA.', 'Focused on BTC, ETH and SOL. Follow the decisions in the AI Center.', 'Enfoque en BTC, ETH y SOL. Sigue las decisiones en la Central de IA.')}</p>
        <div className="mono mt-5 flex gap-3" aria-label={x("BTC ETH SOL","BTC ETH SOL","BTC ETH SOL")}>
          {['BTC', 'ETH', 'SOL'].map(t => <span key={t} className="agx-coin">{t.slice(0, 1)}<span className="sr-only">{t}</span></span>)}
          <span className="self-center text-xs font-bold tracking-widest text-[#F6D77E]">{x('BTC · ETH · SOL', 'BTC · ETH · SOL', 'BTC · ETH · SOL')}</span>
        </div>
      </article>
      <ul className="grid gap-3">
        {off.map(a => <li key={a.id} data-testid={`card-agent-${a.id}`} aria-disabled="true" className="agx-off pointer-events-none flex select-none items-center gap-3 rounded-2xl border border-dashed border-[#BDB39C] p-3">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#DDD5C3] grayscale" style={{ color: a.color }}><a.Icon className="h-5 w-5" aria-hidden /></span>
          <span className="min-w-0 flex-1"><span className="block font-extrabold text-[#3F4B60]">{a.name}</span><span className="block text-xs text-[#5B6B85]">{a.tag}</span></span>
          <span data-testid={`status-agent-${a.id}`} className="inline-flex items-center gap-1 rounded-full bg-[#D9D2C0] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4A566B]"><Lock className="h-3 w-3" aria-hidden />{x('Desativado', 'Disabled', 'Desactivado')}</span>
        </li>)}
        <li className="px-1 text-xs text-[#5B6B85]">{x('Os outros agentes ficam desativados durante a ALFA.', 'The other agents stay disabled during ALPHA.', 'Los otros agentes siguen desactivados durante la ALFA.')}</li>
      </ul>
    </div>
    <Link href={demoPath('central', loc)} onClick={onEnter} data-testid="link-agent-showcase-central" className="group order-1 mt-5 inline-flex min-h-11 max-w-full self-start items-center gap-2 rounded-xl bg-[#0E7C6B] px-5 text-sm font-bold text-white hover:bg-[#0A6657] lg:order-2">{onEnter ? x('Entrar no demo da Central da IA', 'Enter the AI Center demo', 'Entrar en la demo de la Central de IA') : x('Abrir a Central da IA', 'Open the AI Center', 'Abrir la Central de IA')}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></Link>
  </section>;
}
