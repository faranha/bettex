import { type ReactNode, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, ChartCandlestick, Check, ChevronDown, Menu, Minus, Plus, Radar, ShieldCheck, Spade, Trophy, Wallet, X, type LucideIcon } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { TechnologySection } from '@/components/technology/TechnologySection';
import { InvestorSection } from '@/components/investor/InvestorSection';
import { HeroBenefit } from '@/components/hero/HeroBenefit';
import { BettexMark } from '@/components/BettexMark';
import { AgentMark, type AgentKind } from '@/components/hero/AgentMark';
import '@/components/hero/AgentCard.css';
import { ProjectModelSection } from '@/components/ProjectModelSection';
import { HumanStorySection } from '@/components/HumanStorySection';
import { TokenHeroSection } from '@/components/TokenHeroSection';
import { tokenomics } from '@/lib/tokenomics';

const queryClient = new QueryClient();
const KEY = 'bettex-demo-balances';
const PRICE = tokenomics.priceBRL;
type Balance = { free: number; participating: number };
type Agent = {
  name: string;
  kind: AgentKind;
  icon: LucideIcon;
  visual: string;
  area: string;
  intro: string;
  detail: string;
  platform: string;
  platformLogo?: string;
};

const agents: Agent[] = [
  { name: 'PREDIX', kind: 'predix', icon: Radar, visual: 'máquina cilíndrica sem rosto com ícone de cenários ramificados', area: 'Previsões', intro: 'Inteligência de cenários.', detail: 'Analisa mercados de previsão na Polymarket para a BETTEX.', platform: 'Polymarket', platformLogo: 'polymarket.svg' },
  { name: 'TRADEX', kind: 'tradex', icon: ChartCandlestick, visual: 'máquina cilíndrica sem rosto com ícone de gráfico de negociação', area: 'Ações e cripto', intro: 'Negociação de ações e criptoativos.', detail: 'Negocia ações e criptoativos na Robinhood como parte da BETTEX.', platform: 'Robinhood', platformLogo: 'robinhood.svg' },
  { name: 'SPORTIX', kind: 'sportix', icon: Trophy, visual: 'máquina cilíndrica sem rosto com pequeno ícone de bola de futebol', area: 'Esportes', intro: 'Análise esportiva.', detail: 'Opera em mercados esportivos na Kalshi como parte da BETTEX.', platform: 'Kalshi', platformLogo: 'kalshi.webp' },
  { name: 'BETTIX', kind: 'bettix', icon: Spade, visual: 'máquina cilíndrica sem rosto com ícone de naipe de espadas', area: 'Cassino', intro: 'Análise de jogos.', detail: 'Opera somente nos jogos de cassino da Duel como parte da BETTEX.', platform: 'Duel', platformLogo: 'duel.webp' },
];

function readBalance(): Balance {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { free: 0, participating: 0 };
    const parsed = JSON.parse(raw) as Partial<Balance>;
    const clean = (n: unknown) => Number.isFinite(n) ? Math.max(0, Math.floor(Number(n))) : 0;
    // Aceita dados de uma versão anterior da demonstração, quando existirem.
    const old = parsed as Partial<Balance> & { staked?: number };
    return { free: clean(parsed.free), participating: clean(parsed.participating ?? old.staked) };
  } catch {
    return { free: 0, participating: 0 };
  }
}

const money = (number: number) => number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function Logo({ pale = false }: { pale?: boolean }) {
  return <a href="#inicio" className={`inline-flex items-center gap-2.5 rounded-md font-bold ${pale ? 'text-[#f6f4e9]' : 'text-[#103739]'}`} aria-label="BETTEX, voltar ao início">
    <BettexMark className={`h-9 w-9 shrink-0 rounded-[11px] ${pale ? 'ring-1 ring-[#a4eacb]/70' : ''}`} />
    <span className="display text-[23px] leading-none tracking-[-.07em]">BETTEX<span className={pale ? 'text-[#94ebcb]' : 'text-[#219c79]'}>.</span></span>
  </a>;
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`mono text-[10px] font-bold uppercase tracking-[.16em] ${light ? 'text-[#a2efce]' : 'text-[#168367]'}`}>{children}</p>;
}

function MoveControl({ title, available, value, onChange, onSubmit, button }: { title: string; available: number; value: string; onChange: (value: string) => void; onSubmit: () => void; button: string }) {
  return <div className="rounded-[22px] border border-[#c5d9ce] bg-[#fbfaf2] p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3"><label className="display text-lg font-bold leading-tight">{title}</label><span className="shrink-0 text-right text-xs text-[#5f7874]">Disponível: {available}</span></div>
    <div className="mt-5 flex gap-2">
      <input type="number" min="1" max={available} step="1" inputMode="numeric" aria-label={`Quantidade para ${title.toLowerCase()}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Quantidade" className="number-input min-w-0 flex-1 rounded-xl border border-[#b9d1c7] bg-white/80 px-3 py-3 text-sm text-[#103739] placeholder:text-[#7a918b]" />
      <button type="button" onClick={() => onChange(String(available))} disabled={available === 0} className="tap rounded-xl bg-[#e0f2e8] px-3 text-xs font-bold text-[#146d55] disabled:opacity-40">Tudo</button>
    </div>
    <button type="button" onClick={onSubmit} disabled={available === 0} className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#123a3b] px-4 py-3 text-sm font-bold text-[#f7f6ec] hover:bg-[#205658] disabled:opacity-40">{button}<ArrowRight className="h-4 w-4" /></button>
  </div>;
}

function AgentCard({ agent, number }: { agent: Agent; number: number }) {
  return <article className={`agent-card flex h-full flex-col overflow-hidden rounded-[18px] border border-[#123a3b]/15 bg-[#f5f6ef]`}>
    <div className="agent-card__stage relative flex h-[190px] shrink-0 items-center justify-center overflow-hidden sm:h-[205px]">
      <div className="agent-card__index absolute left-5 top-5 z-20 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em]"><agent.icon className="h-4 w-4" aria-hidden="true" />0{number} / {agent.area}</div>
      <span className="agent-card__crosshair agent-card__crosshair--tl" aria-hidden="true" />
      <span className="agent-card__crosshair agent-card__crosshair--br" aria-hidden="true" />
      <div className="agent-card__instrument relative z-10 h-[154px] w-[154px] sm:h-[166px] sm:w-[166px]" role="img" aria-label={`${agent.name}, ${agent.visual}`}>
        <img src={`${import.meta.env.BASE_URL}agents/predix-cycle.webp`} alt="" aria-hidden="true" loading="lazy" className="agent-card__image h-full w-full object-contain" />
        <span className="agent-card__emblem" aria-hidden="true"><AgentMark kind={agent.kind} /></span>
      </div>
      <div className="agent-card__stage-foot absolute bottom-3 left-5 right-5 z-20 flex justify-between border-t border-white/15 pt-2 text-[8px] font-bold uppercase tracking-[.16em]"><span>BETTEX / AGENTE</span><span>0{number} / 04</span></div>
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <div className="min-h-[75px]"><h4 className="display text-[25px] font-extrabold leading-none tracking-[-.055em] text-[#123a3b]">{agent.name}</h4><p className="display mt-2 text-base font-bold leading-5 text-[#294d4a]">{agent.intro}</p></div>
      <p className="mono mt-4 text-[9px] font-bold uppercase tracking-[.12em] text-[#44776b]">O que faz</p>
      <p className="mt-2 min-h-[70px] text-[13px] leading-[1.55] text-[#455f5b]">{agent.detail}</p>
      <div className="mt-auto flex min-h-[76px] items-center rounded-[10px] border border-[#294e4b] bg-[#123a3b] px-4 py-3 text-[#f7f4e9]">
        <div>
          <p className="mono text-[9px] font-bold uppercase tracking-[.09em] text-[#c9e0d6]">{agent.platformLogo ? 'Plataforma' : 'Onde atua'}</p>
          {agent.platformLogo
            ? <div className="agent-card__platform-logo-slot"><img src={`${import.meta.env.BASE_URL}platforms/${agent.platformLogo}`} alt={`Marca da ${agent.platform}`} loading="lazy" className={`agent-card__platform-logo agent-card__platform-logo--${agent.kind}`} /></div>
            : <p className="display mt-1 text-base font-extrabold leading-tight text-[#f7f4e9]">{agent.platform}</p>}
        </div>
      </div>
    </div>
  </article>;
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState<Balance>(readBalance);
  const [quantity, setQuantity] = useState(40);
  const [toParticipating, setToParticipating] = useState('');
  const [toFree, setToFree] = useState('');
  const [toSell, setToSell] = useState('');
  const [feedback, setFeedback] = useState('Este é um teste. Nenhum dinheiro ou token real é usado.');

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const scrollToSection = () => {
      const target = document.getElementById(id);
      if (!target) return;
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
      root.style.scrollBehavior = previousBehavior;
    };
    const frame = requestAnimationFrame(scrollToSection);
    window.addEventListener('load', scrollToSection, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('load', scrollToSection);
    };
  }, []);

  const save = (next: Balance) => {
    setBalance(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* A experiência continua mesmo sem armazenamento local. */ }
  };
  const buy = () => {
    const amount = Math.floor(Number(quantity));
    if (!Number.isFinite(amount) || amount < 1 || amount > 500) { setFeedback('Escolha entre 1 e 500 tokens para testar.'); return; }
    setConnected(true);
    save({ ...balance, free: balance.free + amount });
    setFeedback(`Pronto! ${amount} tokens de exemplo entraram no seu saldo livre. ${money(amount * PRICE)} foi só uma conta: você não pagou nada.`);
  };
  const validate = (raw: string, available: number): number | null => {
    const number = Number(raw);
    if (!Number.isInteger(number) || number < 1) { setFeedback('Digite uma quantidade inteira maior que zero.'); return null; }
    if (number > available) { setFeedback(`Você tem apenas ${available} tokens disponíveis para essa ação.`); return null; }
    return number;
  };
  const leaveParticipating = () => {
    const amount = validate(toParticipating, balance.free);
    if (amount === null) return;
    save({ free: balance.free - amount, participating: balance.participating + amount });
    setToParticipating('');
    setFeedback(`${amount} tokens agora estão participando na demonstração. Isso não gera pagamento nem rendimento real.`);
  };
  const withdraw = () => {
    const amount = validate(toFree, balance.participating);
    if (amount === null) return;
    save({ free: balance.free + amount, participating: balance.participating - amount });
    setToFree('');
    setFeedback(`${amount} tokens foram tirados da participação e voltaram ao seu saldo livre de exemplo.`);
  };
  const sell = () => {
    const amount = validate(toSell, balance.free);
    if (amount === null) return;
    save({ ...balance, free: balance.free - amount });
    setToSell('');
    setFeedback(`Venda simulada: ${amount} tokens livres saíram do seu saldo. Nenhum dinheiro foi recebido.`);
  };

  return <div className="min-h-[100dvh] overflow-x-hidden bg-[#f7f4e9]">
    <header className="sticky top-0 z-40 border-b border-[#d6e1d7] bg-[#f7f4e9]/95 backdrop-blur-lg">
      <div className="page-wrap flex h-[72px] items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          <a href="#participacao" className="text-sm font-semibold hover:text-[#168367]">O que é a BETTEX</a>
          <a href="#agentes" className="text-sm font-semibold hover:text-[#168367]">Agentes</a>
          <a href="#tecnologia" className="text-sm font-semibold hover:text-[#168367]">Operações</a>
          <a href="#token" className="text-sm font-semibold hover:text-[#168367]">Token BETTEX</a>
          <a href="#comprar" className="text-sm font-semibold hover:text-[#168367]">Demonstração</a>
        </nav>
        <a href="#participacao" className="tap hidden items-center gap-2 rounded-full bg-[#123a3b] px-5 py-3 text-xs font-bold text-[#f7f4e9] hover:bg-[#245d57] sm:inline-flex"><ArrowRight className="h-4 w-4" />Entenda o projeto</a>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} className="rounded-xl border border-[#bdd5c8] p-2.5 lg:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {menuOpen && <nav className="page-wrap flex flex-col gap-1 border-t border-[#d6e1d7] py-3 lg:hidden" aria-label="Navegação móvel">
        {([['O que é a BETTEX', 'participacao'], ['Agentes', 'agentes'], ['Operações', 'tecnologia'], ['Token BETTEX', 'token'], ['Demonstração', 'comprar']] as const).map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-bold hover:bg-[#e6f0e7]">{label}</a>)}
      </nav>}
    </header>

    <main>
      <section id="inicio" className="hero-bg relative overflow-hidden text-[#f7f4e9]">
        <div className="hero-pattern pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_right,transparent,black)]" />
        <div className="page-wrap relative grid items-center gap-10 pb-10 pt-12 sm:pt-16 md:min-h-[690px] md:grid-cols-[1.08fr_.92fr] md:gap-8 md:py-16 lg:min-h-[730px] lg:gap-14">
          <div className="entrance relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#94ebcb]/35 bg-[#94ebcb]/10 px-4 py-2 text-[11px] font-bold text-[#aff3d7]"><span className="h-2 w-2 rounded-full bg-[#a6edcb]" /> BETTEX · SUA IA PARA MERCADOS DE RISCO</div>
            <h1 className="hero-title mt-7 max-w-[690px] text-[clamp(2rem,5vw,4.6rem)] font-extrabold">
              <span className="block whitespace-nowrap">A melhor aposta é</span>
              <span className="block whitespace-nowrap text-[#a4eacb]">um investimento.</span>
            </h1>
            <p className="mt-7 max-w-[550px] text-[17px] leading-[1.6] text-[#d7e9df] sm:text-lg">Em vez de colocar o dinheiro do mês em uma aposta, conheça a BETTEX: seja dono de uma IA que opera em diferentes mercados de risco com resultados diários.</p>
            <p className="mt-4 max-w-[550px] text-[17px] leading-[1.6] text-[#d7e9df] sm:text-lg">Ao comprar tokens, você participa do <strong className="font-bold text-[#f7f4e9]">projeto BETTEX como um todo</strong>, não de um único palpite. O risco continua; resultados não são garantidos.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#participacao" data-testid="link-hero-participacao" className="tap inline-flex items-center gap-2 rounded-full bg-[#a4eacb] px-6 py-4 text-sm font-bold text-[#103739] hover:bg-[#c0f5dc]">Entenda como funciona <ArrowRight className="h-4 w-4" /></a><a href="#token" data-testid="link-hero-token" className="tap inline-flex items-center gap-2 rounded-full border border-[#a4eacb]/45 px-6 py-4 text-sm font-bold text-[#f7f4e9] hover:bg-white/10">Entenda o token <ArrowDown className="h-4 w-4" /></a></div>
            <p className="mt-7 max-w-lg border-l-2 border-[#ffcb9b] pl-4 text-xs leading-5 text-[#c9e0d6]">Investir em mercados de risco pode gerar perdas. Lucro e valorização do token não são garantidos.</p>
          </div>
          <div className="entrance entrance-delay relative mx-auto w-full max-w-[510px]">
            <HeroBenefit />
          </div>
        </div>
      </section>

      <ProjectModelSection />
      <HumanStorySection />

       <TechnologySection>
         {agents.map((agent, index) => <div className="technology-section__agent-slot" key={agent.name}><AgentCard agent={agent} number={index + 1} /></div>)}
       </TechnologySection>
      <InvestorSection />
      <TokenHeroSection />

      <section id="comprar" className="scroll-mt-[72px] bg-[#f7f4e9] py-20 sm:py-28">
        <div className="page-wrap">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-16">
          <div><Eyebrow>Área de demonstração</Eyebrow><h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.8rem)] font-extrabold leading-[1.04] tracking-[-.055em]">Teste o pré-lançamento.</h2><p className="mt-6 max-w-md text-base leading-7 text-[#526e69]">O token BETTEX custa <strong className="text-[#123a3b]">R$ {PRICE}</strong>. Experimente calcular uma quantidade e veja como seria movimentar tokens. O teste não reserva unidades da oferta pública.</p><div className="mt-8 flex max-w-md items-start gap-3 rounded-[22px] bg-[#ffe7d0] p-5"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b95c36]" /><p className="text-sm leading-6 text-[#654d3e]">Os saldos deste teste ficam apenas no navegador e não correspondem a tokens adquiridos.</p></div></div>
          <div className="rounded-[32px] border border-[#bad5c6] bg-[#e3f2e7] p-4 shadow-[0_24px_60px_rgba(20,78,64,.09)] sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><span className="mono text-[10px] font-bold uppercase tracking-[.1em] text-[#168367]">Simulação do pré-lançamento</span><h3 className="display mt-2 text-2xl font-extrabold tracking-[-.04em]">Escolha uma quantidade</h3></div><span className="rounded-full bg-[#c9e9d7] px-3 py-1.5 text-[10px] font-bold text-[#176d54]">SEM CUSTO</span></div>
            <div className="mt-8 flex items-center justify-between gap-2 rounded-[22px] bg-[#fcfbf3] p-3 sm:p-4">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, Number(q) - 10))} aria-label="Diminuir quantidade" className="tap grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e2f1e7] hover:bg-[#cbebd9]"><Minus className="h-5 w-5" /></button>
              <div className="min-w-0 text-center"><label htmlFor="token-amount" className="block text-xs text-[#526e69]">Tokens de exemplo</label><input id="token-amount" type="number" min="1" max="500" step="1" aria-describedby="test-limit" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="number-input display w-full bg-transparent text-center text-4xl font-extrabold tracking-[-.05em] outline-none sm:text-5xl" /></div>
              <button type="button" onClick={() => setQuantity((q) => Math.min(500, Number(q) + 10))} aria-label="Aumentar quantidade" className="tap grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e2f1e7] hover:bg-[#cbebd9]"><Plus className="h-5 w-5" /></button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{[10, 40, 100].map((number) => <button key={number} type="button" onClick={() => setQuantity(number)} className={`tap rounded-full border px-4 py-2 text-xs font-bold ${quantity === number ? 'border-[#123a3b] bg-[#123a3b] text-white' : 'border-[#b5d1c3] bg-[#f9fbf3] text-[#123a3b]'}`}>{number} tokens</button>)}</div>
            <p id="test-limit" className="mt-2 text-xs leading-5 text-[#526e69]">Limite deste teste: 500 tokens por vez. Isso não limita a oferta pública de 1.000.000.</p>
            <div className="mt-8 flex items-end justify-between border-b border-[#b6d5c5] pb-5"><div><p className="text-sm text-[#526e69]">Total da simulação</p><p className="display mt-1 text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">{Number.isFinite(quantity) && quantity >= 1 ? money(quantity * PRICE) : money(0)}</p></div><span className="text-right text-xs text-[#526e69]">Preço BETTEX<br />R$ {PRICE} por token</span></div>
            <button type="button" onClick={buy} className="tap mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#123a3b] px-5 py-4 text-sm font-bold text-[#f6f5ea] hover:bg-[#235956]">Colocar tokens na minha demonstração <ArrowRight className="h-4 w-4" /></button>
            <p className="mt-4 text-center text-xs text-[#526e69]">Esta ação adiciona apenas tokens de exemplo à demonstração; não confirma compra nem disponibilidade.</p>
          </div>
          </div>
        </div>
      </section>

      <section id="meus-tokens" className="bg-[#d9eee3] py-20 sm:py-28">
        <div className="page-wrap">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><Eyebrow>Seu espaço de teste</Eyebrow><h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.8rem)] font-extrabold leading-[1.04] tracking-[-.055em]">Explore os movimentos.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#526e69]">Somente neste teste, “deixar participando” muda a visualização dos saldos, sem movimentar tokens adquiridos.</p></div><div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#a8ceba] bg-[#f5faf2] px-4 py-2 text-xs font-bold text-[#176d54]"><span className="h-2 w-2 rounded-full bg-[#2aa983]" />{connected ? 'Demonstração iniciada' : 'Demonstração local'}</div></div>
          <div className="mt-10 grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
            <div className="rounded-[30px] bg-[#123a3b] p-6 text-[#f8f7ed] sm:p-8"><div className="flex items-center justify-between"><p className="text-sm text-[#c2d9cf]">Seus tokens de exemplo</p><Wallet className="h-5 w-5 text-[#a4eacb]" /></div><p className="display mt-5 text-6xl font-extrabold tracking-[-.07em]">{balance.free + balance.participating}</p><p className="mt-1 text-xs text-[#c2d9cf]">Unidades de exemplo no total</p><div className="mt-9 divide-y divide-[#b6dccb]/20 border-t border-[#b6dccb]/20"><div className="flex justify-between py-4 text-sm"><span className="text-[#c2d9cf]">Livres para usar</span><strong>{balance.free}</strong></div><div className="flex justify-between py-4 text-sm"><span className="text-[#c2d9cf]">Deixados participando</span><strong>{balance.participating}</strong></div></div><p className="mt-5 text-xs leading-5 text-[#b5d5c7]">Saldos ilustrativos, guardados apenas neste navegador.</p></div>
            <div className="rounded-[30px] border border-[#b9d6c5] bg-[#f2f8ef] p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="mono text-[10px] font-bold uppercase tracking-[.1em] text-[#168367]">Faça um teste</p><h3 className="display mt-1 text-2xl font-extrabold tracking-[-.04em]">O que você quer fazer?</h3></div><span className="hidden rounded-full bg-[#dfefe3] px-3 py-1.5 text-[10px] font-bold text-[#176d54] sm:inline-block">SÓ NA TELA</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><MoveControl title="Deixar tokens participando" available={balance.free} value={toParticipating} onChange={setToParticipating} onSubmit={leaveParticipating} button="Deixar participando" /><MoveControl title="Tirar tokens da participação" available={balance.participating} value={toFree} onChange={setToFree} onSubmit={withdraw} button="Tirar meus tokens" /></div><div className="mt-3"><MoveControl title="Simular venda dos tokens livres" available={balance.free} value={toSell} onChange={setToSell} onSubmit={sell} button="Simular venda" /><p className="mt-2 text-xs leading-5 text-[#526e69]">Esta simulação representa a escolha de vender no futuro; não envia ordens a corretoras parceiras.</p></div></div>
          </div>
          <div role="status" aria-live="polite" className="mt-4 flex items-start gap-3 rounded-[18px] border border-[#9ccdb1] bg-[#f9faf1] px-5 py-4 text-sm leading-6 text-[#285b4b]"><Check className="mt-0.5 h-4 w-4 shrink-0" />{feedback}</div>
        </div>
      </section>

      <section className="bg-[#ffe6cc] py-16 sm:py-20"><div className="page-wrap flex flex-col gap-7 md:flex-row md:items-center md:justify-between"><div><Eyebrow>Seu próximo passo</Eyebrow><h2 className="display mt-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-[-.04em] sm:text-4xl">Pare de apostar. Comece a investir na IA da BETTEX.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#61534a]">Conheça o token, veja como o projeto funciona e descubra o que significa participar da BETTEX.</p></div><a href="#token" className="tap inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#123a3b] px-5 py-3.5 text-sm font-bold text-[#f7f4e9]">Conheça o token <ArrowUpRight className="h-4 w-4" /></a></div></section>
    </main>

    <footer className="bg-[#123a3b] py-10 text-[#d0e5d9]"><div className="page-wrap flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><Logo pale /><p className="max-w-[550px] text-xs leading-6">BETTEX é um negócio de investimento com agentes de IA. Conheça seus agentes, a tecnologia e os tokens perpétuos.</p><a href="#inicio" className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#a4eacb]">Voltar ao topo <ChevronDown className="h-4 w-4 rotate-180" /></a></div></footer>
  </div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;