import { type ReactNode, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, ChartCandlestick, Check, ChevronDown, Dices, Menu, Minus, Plus, Radar, ShieldCheck, Trophy, Wallet, X, type LucideIcon } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { TechnologySection } from '@/components/technology/TechnologySection';
import { InvestorSection } from '@/components/investor/InvestorSection';
import { PrelaunchTokenomics } from '@/components/PrelaunchTokenomics';
import { ProjectModelSection } from '@/components/ProjectModelSection';
import { TokenHeroSection } from '@/components/TokenHeroSection';
import { tokenomics } from '@/lib/tokenomics';

const queryClient = new QueryClient();
const KEY = 'bettex-demo-balances';
const PRICE = tokenomics.priceBRL;
const image = (name: string) => `${import.meta.env.BASE_URL}agents/${name}.webp?v=role-art`;

type Balance = { free: number; participating: number };
type Agent = {
  name: string;
  image: string;
  icon: LucideIcon;
  visual: string;
  area: string;
  intro: string;
  detail: string;
  platform: string;
  platformLogo?: string;
  status: string;
  background: string;
  imageBackground: string;
};

const agents: Agent[] = [
  { name: 'PREDIX', image: 'predix', icon: Radar, visual: 'uma lupa com possíveis cenários', area: 'Previsões', intro: 'Mais inteligência para ler cenários.', detail: 'Já opera na Polymarket. Com apoio do serviço da Allora, analisa cenários em mercados de previsão para a BETTEX.', platform: 'Polymarket', platformLogo: 'polymarket', status: 'Em operação', background: '#d9f5e8', imageBackground: '#ace5d2' },
  { name: 'TRADIX', image: 'tradix', icon: ChartCandlestick, visual: 'um gráfico de preços e uma moeda digital', area: 'Cripto', intro: 'A BETTEX no mercado cripto.', detail: 'Já opera na Robinhood. Usa o serviço da Allora em sua atuação no mercado cripto, dentro da mesma BETTEX.', platform: 'Robinhood', platformLogo: 'robinhood', status: 'Em operação', background: '#eee0f8', imageBackground: '#d9b9ed' },
  { name: 'SPORTIX', image: 'sportix', icon: Trophy, visual: 'uma bola de futebol', area: 'Esportes', intro: 'Uma nova frente em construção.', detail: 'Em desenvolvimento para ampliar a BETTEX à análise de jogos e mercados esportivos. Ainda não realiza operações.', platform: 'Esportes', status: 'Em desenvolvimento', background: '#dae9ff', imageBackground: '#a9c9fa' },
  { name: 'BETTIX', image: 'bettix', icon: Dices, visual: 'dados e uma roleta', area: 'Cassino', intro: 'Mais uma frente para a IA.', detail: 'Em desenvolvimento para atuar na frente de jogos de cassino da BETTEX. Ainda não realiza operações.', platform: 'Cassino', status: 'Em desenvolvimento', background: '#ffe8d4', imageBackground: '#facb9f' },
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
    <span className={`relative grid h-9 w-9 place-items-center rounded-[11px] ${pale ? 'bg-[#94ebcb]' : 'bg-[#123a3b]'}`}>
      <span className={`absolute h-4 w-4 rotate-45 rounded-[3px] border-[2.5px] ${pale ? 'border-[#123a3b]' : 'border-[#a2efce]'}`} />
      <span className={`absolute h-1.5 w-1.5 rounded-full ${pale ? 'bg-[#123a3b]' : 'bg-[#a2efce]'}`} />
    </span>
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
  return <article className="agent-card overflow-hidden rounded-[30px]" style={{ backgroundColor: agent.background }}>
    <div className="relative flex min-h-[270px] items-end justify-center overflow-hidden sm:min-h-[320px]" style={{ backgroundColor: agent.imageBackground }}>
      <div className="absolute left-5 top-5 z-10 flex items-center gap-1.5 rounded-full bg-[#123a3b]/85 px-3 py-1.5 text-[11px] font-bold text-white"><agent.icon className="h-3.5 w-3.5" aria-hidden="true" />0{number} · {agent.area}</div>
      <div className="absolute right-[-10%] top-[-60%] h-[480px] w-[480px] rounded-full border-[50px] border-white/20" />
      <img src={image(agent.image)} alt={`Ilustração de ${agent.name} com ${agent.visual}`} loading="lazy" className="agent-image relative z-10 h-[270px] w-[270px] object-contain sm:h-[330px] sm:w-[330px]" />
    </div>
    <div className="p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3"><div><h4 className="display text-[30px] font-extrabold leading-none tracking-[-.055em]">{agent.name}</h4><p className="display mt-2 text-lg font-bold">{agent.intro}</p></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#123a3b]/20"><agent.icon className="h-5 w-5" aria-hidden="true" /></span></div>
      <p className="mono mt-5 text-[10px] font-bold uppercase tracking-[.13em] text-[#168367]">Quem é o {agent.name}?</p>
      <p className="mt-2 max-w-[440px] text-sm leading-6 text-[#455f5b]">{agent.detail}</p>
      <div className={`mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 ${agent.platformLogo ? 'bg-[#123a3b] text-white' : 'bg-white/55'}`}>
        <div>
          <p className={`mono text-[10px] font-bold uppercase tracking-[.09em] ${agent.platformLogo ? 'text-[#c9e0d6]' : 'text-[#435d58]'}`}>{agent.platformLogo ? 'Plataforma onde opera' : 'Área em desenvolvimento'}</p>
          {agent.platformLogo
            ? <img src={`${import.meta.env.BASE_URL}platforms/${agent.platformLogo}.svg`} alt={`Marca da ${agent.platform}`} loading="lazy" className="mt-2 h-8 w-auto max-w-[150px] object-contain object-left" />
            : <p className="display mt-1 text-lg font-extrabold">{agent.platform}</p>}
        </div>
        <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${agent.status === 'Em operação' ? 'bg-[#d1f1de] text-[#116247]' : 'bg-[#fff0da] text-[#83513d]'}`}>{agent.status}</span>
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
          <a href="#participacao" className="text-sm font-semibold hover:text-[#168367]">Como funciona</a>
          <a href="#tecnologia" className="text-sm font-semibold hover:text-[#168367]">Tecnologia</a>
          <a href="#agentes" className="text-sm font-semibold hover:text-[#168367]">Agentes</a>
          <a href="#token" className="text-sm font-semibold hover:text-[#168367]">Token BETTEX</a>
          <a href="#comprar" className="text-sm font-semibold hover:text-[#168367]">Demonstração</a>
        </nav>
        <a href="#participacao" className="tap hidden items-center gap-2 rounded-full bg-[#123a3b] px-5 py-3 text-xs font-bold text-[#f7f4e9] hover:bg-[#245d57] sm:inline-flex"><ArrowRight className="h-4 w-4" />Entenda o projeto</a>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} className="rounded-xl border border-[#bdd5c8] p-2.5 lg:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {menuOpen && <nav className="page-wrap flex flex-col gap-1 border-t border-[#d6e1d7] py-3 lg:hidden" aria-label="Navegação móvel">
        {([['Como funciona', 'participacao'], ['Tecnologia', 'tecnologia'], ['Agentes', 'agentes'], ['Token BETTEX', 'token'], ['Demonstração', 'comprar']] as const).map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-bold hover:bg-[#e6f0e7]">{label}</a>)}
      </nav>}
    </header>

    <main>
      <section id="inicio" className="hero-bg relative overflow-hidden text-[#f7f4e9]">
        <div className="hero-pattern pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_right,transparent,black)]" />
        <div className="page-wrap relative grid min-h-[660px] items-center gap-10 pb-10 pt-8 sm:pt-16 md:grid-cols-[1fr_.95fr] md:py-20 lg:min-h-[715px]">
          <div className="entrance relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#94ebcb]/35 bg-[#94ebcb]/10 px-4 py-2 text-[11px] font-bold text-[#aff3d7]"><span className="h-2 w-2 rounded-full bg-[#a6edcb]" /> BETTEX · INVESTIMENTO EM IA</div>
            <h1 className="hero-title mt-7 max-w-[650px] text-[clamp(3.05rem,5.4vw,5.7rem)] font-extrabold">Pare de apostar.<br /><span className="text-[#a4eacb]">Comece a investir.</span></h1>
            <p className="mt-6 max-w-[555px] text-[17px] leading-[1.7] text-[#d7e9df] sm:text-lg"><strong className="font-bold text-[#f7f4e9]">Com tokens BETTEX, você é dono de uma parte do projeto de IA que reúne quatro agentes.</strong> Quando as operações geram lucro, ele é distribuído diariamente aos titulares. Você participa da comunidade que decide os próximos passos e acompanha a movimentação dos agentes em tempo real no sistema do investidor.</p>
            <div className="mt-7 grid grid-cols-2 gap-2.5 md:hidden" aria-label="Agentes da BETTEX em operação">
              {agents.filter((agent) => agent.status === 'Em operação').map((agent) => <a href="#agentes" key={agent.name} className="hero-mini-agent tap relative h-[118px] overflow-hidden rounded-[18px]" style={{ backgroundColor: agent.imageBackground }}>
                <img src={image(agent.image)} alt="" className="absolute -right-2 -top-2 h-[113px] w-[113px] object-contain" />
                <span className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#103739]/95 to-transparent px-3 pb-2.5 pt-9 text-[#f7f4e9]"><strong className="display block text-sm leading-none">{agent.name}</strong><span className="mt-1 block text-[10px]">{agent.platform} · Em operação</span></span>
              </a>)}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#c9e0d6] md:hidden">SPORTIX e BETTIX também fazem parte da BETTEX. Veja os quatro agentes abaixo.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#participacao" className="tap inline-flex items-center gap-2 rounded-full bg-[#a4eacb] px-6 py-4 text-sm font-bold text-[#103739] hover:bg-[#c0f5dc]">Entenda como funciona <ArrowRight className="h-4 w-4" /></a><a href="#token" className="tap inline-flex items-center gap-2 rounded-full border border-[#a4eacb]/45 px-6 py-4 text-sm font-bold text-[#f7f4e9] hover:bg-white/10">Entenda o token <ArrowDown className="h-4 w-4" /></a></div>
            <p className="mt-8 max-w-lg border-l-2 border-[#ffcb9b] pl-4 text-xs leading-5 text-[#c9e0d6]">Investimentos envolvem riscos. Lucros e valorização do token não são garantidos.</p>
          </div>
          <div className="entrance entrance-delay relative mx-auto hidden h-[380px] w-full max-w-[530px] sm:h-[480px] md:block md:h-[530px]" aria-label="Ilustração dos quatro agentes de IA">
            <div className="absolute inset-[9%] rounded-full border border-[#a4eacb]/30" />
            <div className="absolute inset-[19%] rounded-full border border-dashed border-[#a4eacb]/30" />
            <div className="absolute inset-[30%] rounded-full bg-[#a4eacb]/10 blur-2xl" />
            <div className="absolute left-[34%] top-[39%] z-10 grid h-[31%] w-[31%] place-items-center rounded-[27%] border border-[#a4eacb]/45 bg-[#1c5953] shadow-2xl"><span className="display text-center text-[clamp(1.1rem,2.7vw,1.8rem)] font-extrabold tracking-[-.06em]">BETTEX<span className="text-[#a4eacb]">.</span></span></div>
            {agents.map((agent, i) => <div key={agent.name} className={`hero-agent absolute ${['left-[-1%] top-[1%] w-[54%]', 'right-[-3%] top-[0%] w-[53%]', 'bottom-[-4%] left-[0%] w-[52%]', 'bottom-[-4%] right-[-2%] w-[52%]'][i]}`}>
              <img src={image(agent.image)} alt={`${agent.name}, agente de ${agent.area.toLowerCase()} com ${agent.visual}`} className="w-full" />
            </div>)}
            <span className="stamp absolute right-[-1%] top-[47%] z-20 rounded-full bg-[#ffd39e] px-4 py-2.5 text-center text-[11px] font-extrabold text-[#173b3a] shadow-lg sm:text-xs">PREDIX + TRADIX<br />em operação.</span>
          </div>
        </div>
      </section>

      <ProjectModelSection />
      <TechnologySection />

      <section id="agentes" className="bg-[#e8efe7] py-20 sm:py-28">
        <div className="page-wrap">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><Eyebrow>A IA por trás do seu token</Eyebrow><h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.8rem)] font-extrabold leading-[1.04] tracking-[-.055em]">Quatro agentes.<br /><span className="text-[#168367]">Uma IA que também é sua.</span></h2></div><div className="max-w-[390px]"><p className="text-base font-semibold leading-7 text-[#123a3b]">Seu token dá participação no projeto inteiro, não em um único agente.</p><p className="mt-3 text-sm leading-6 text-[#526e69]">PREDIX e TRADIX já atuam em seus mercados. SPORTIX e BETTIX estão em desenvolvimento para ampliar a BETTEX.</p></div></div>
          <div className="mt-12 rounded-[30px] bg-[#123a3b] p-6 text-[#f7f4e9] sm:p-9" aria-label="Os quatro agentes fazem parte do mesmo ecossistema BETTEX">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><p className="mono text-[10px] font-bold uppercase tracking-[.16em] text-[#a4eacb]">O que isso significa para você</p><h3 className="display mt-2 text-3xl font-extrabold tracking-[-.05em] sm:text-4xl">Sua parte é na BETTEX inteira.</h3></div>
              <span className="rounded-full border border-[#a4eacb]/40 px-4 py-2 text-xs font-bold text-[#a4eacb]">4 agentes · 1 projeto</span>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-[#d0e5d9]">Um token conecta você ao ecossistema que reúne os quatro agentes. O investimento total é dividido entre eles; quando as operações geram lucro, os titulares participam da distribuição diária e podem acompanhar a evolução do projeto no sistema do investidor.</p>
            <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {agents.map((agent) => <div key={agent.name} className="flex items-center gap-2.5 rounded-2xl border border-[#a4eacb]/20 bg-white/5 px-3 py-4 sm:flex-col sm:items-start sm:gap-4 sm:p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#a4eacb]/15 text-[#a4eacb]"><agent.icon className="h-5 w-5" aria-hidden="true" /></span>
                <span><strong className="display block text-sm font-extrabold sm:text-lg">{agent.name}</strong><span className="block text-[10px] text-[#c1dbce] sm:text-xs">{agent.area}</span></span>
              </div>)}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#a4eacb]/20 pt-5"><p className="max-w-2xl text-xs leading-5 text-[#c1dbce]">Em operação: PREDIX e TRADIX. Em desenvolvimento: SPORTIX e BETTIX. Todos fazem parte da mesma BETTEX.</p><a href="#token" className="tap inline-flex items-center gap-2 rounded-full bg-[#a4eacb] px-5 py-3 text-xs font-bold text-[#123a3b] hover:bg-[#c0f5dc]">Conheça o token <ArrowRight className="h-4 w-4" /></a></div>
          </div>
          <div className="mt-12" aria-labelledby="agentes-em-operacao">
            <div className="flex items-center gap-3 border-b border-[#c4d9ca] pb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#219c79]" aria-hidden="true" />
              <h3 id="agentes-em-operacao" className="display text-2xl font-extrabold">Já operam no mercado</h3>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {agents.filter((agent) => agent.status === 'Em operação').map((agent) => <AgentCard key={agent.name} agent={agent} number={agents.indexOf(agent) + 1} />)}
            </div>
          </div>
          <div className="mt-16" aria-labelledby="agentes-em-desenvolvimento">
            <div className="flex items-center gap-3 border-b border-[#c4d9ca] pb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#db936c]" aria-hidden="true" />
              <h3 id="agentes-em-desenvolvimento" className="display text-2xl font-extrabold">Na BETTEX, em desenvolvimento</h3>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {agents.filter((agent) => agent.status === 'Em desenvolvimento').map((agent) => <AgentCard key={agent.name} agent={agent} number={agents.indexOf(agent) + 1} />)}
            </div>
          </div>
        </div>
      </section>

      <InvestorSection />
      <TokenHeroSection />

      <section id="oferta" className="scroll-mt-[72px] bg-[#e8efe7] py-20 sm:py-28">
        <div className="page-wrap">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3"><Eyebrow>Pré-lançamento em detalhes</Eyebrow><p className="text-sm text-[#526e69]">Conheça a distribuição antes de experimentar o teste.</p></div>
          <PrelaunchTokenomics />
        </div>
      </section>

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
            <div className="mt-8 flex items-end justify-between border-b border-[#b6d5c5] pb-5"><div><p className="text-sm text-[#526e69]">Total da simulação</p><p className="display mt-1 text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">{Number.isFinite(quantity) && quantity >= 1 ? money(quantity * PRICE) : '—'}</p></div><span className="text-right text-xs text-[#526e69]">Preço BETTEX<br />R$ {PRICE} por token</span></div>
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