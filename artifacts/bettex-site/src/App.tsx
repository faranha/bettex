import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDown, ArrowRight, Check, ChevronDown, CircleHelp, Copy, LockKeyhole, Menu, Minus, Plus, ShieldCheck, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const TOKEN_PRICE = 5;
const WALLET = '0x4A72...91c8';
const STORAGE_KEY = 'bettex-demo-balances';

type Agent = {
  name: string;
  eyebrow: string;
  description: string;
  tone: string;
  status: string;
  result: string;
  contribution: string;
  share: string;
};

type Balances = { free: number; staked: number };

const agents: Agent[] = [
  { name: 'PREDIX', eyebrow: 'Mercados de previsão', description: 'Analisa eventos e probabilidades para construir cenários antes que eles aconteçam.', tone: 'mint', status: 'Em proposta', result: 'R$ 12.000', contribution: 'R$ 6.000', share: '52,2%' },
  { name: 'SPORTIX', eyebrow: 'Esportes', description: 'Organiza sinais e limites para leituras quantitativas de competições esportivas.', tone: 'blue', status: 'Em proposta', result: 'R$ 7.000', contribution: 'R$ 3.500', share: '30,4%' },
  { name: 'BETTIX', eyebrow: 'Cassino', description: 'Uma frente experimental com regras e limites ainda em discussão e revisão.', tone: 'amber', status: 'Regras propostas', result: '− R$ 3.200', contribution: 'R$ 0', share: '—' },
  { name: 'TRADIX', eyebrow: 'Cripto', description: 'Pesquisa movimentos de ativos digitais; regras de operação ainda serão definidas.', tone: 'violet', status: 'Em definição', result: 'R$ 4.000', contribution: 'R$ 2.000', share: '17,4%' },
];

const initialBalances: Balances = { free: 0, staked: 0 };

function readBalances(): Balances {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialBalances;
    const parsed = JSON.parse(saved) as Partial<Balances>;
    return { free: Math.max(0, Number(parsed.free) || 0), staked: Math.max(0, Number(parsed.staked) || 0) };
  } catch {
    return initialBalances;
  }
}

function currency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
}

function Logo() {
  return (
    <a href="#inicio" className="focus-ring flex items-center gap-3" aria-label="BETTEX, voltar ao início">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/45 bg-primary/10">
        <span className="absolute h-4 w-4 rotate-45 border-2 border-primary" />
        <span className="absolute h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">BETTEX<span className="text-primary">.</span></span>
    </a>
  );
}

function SectionKicker({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`font-code text-[11px] uppercase tracking-[.19em] ${light ? 'text-primary' : 'text-muted-foreground'}`}>{children}</p>;
}

function Notice({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2 border-y border-primary/15 bg-primary/[.04] px-4 py-2.5 font-code text-[10px] uppercase tracking-[.11em] text-primary/80"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />{children}</div>;
}

function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [quantity, setQuantity] = useState(40);
  const [balances, setBalances] = useState<Balances>(initialBalances);
  const [stakeInput, setStakeInput] = useState('');
  const [withdrawInput, setWithdrawInput] = useState('');
  const [sellInput, setSellInput] = useState('');
  const [feedback, setFeedback] = useState('A simulação começa com saldo zerado. Nenhuma operação real é executada.');

  useEffect(() => {
    setBalances(readBalances());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(balances));
  }, [balances]);

  const totalTokens = balances.free + balances.staked;
  const selectedTotal = quantity * TOKEN_PRICE;
  const setActionFeedback = (message: string) => setFeedback(message);
  const connectWallet = () => {
    setConnected((current) => !current);
    setActionFeedback(connected ? 'Carteira fictícia desconectada. Seus dados continuam apenas neste navegador.' : `Carteira fictícia conectada: ${WALLET}. Nenhuma carteira real foi acessada.`);
  };
  const buyTokens = () => {
    if (!connected) {
      setActionFeedback('Conecte a carteira fictícia antes de simular uma compra.');
      return;
    }
    setBalances((current) => ({ ...current, free: current.free + quantity }));
    setActionFeedback(`${quantity} BETTEX adicionados ao saldo livre. Simulação de ${currency(selectedTotal)} concluída, sem cobrança.`);
  };
  const moveToStaking = () => {
    const amount = Number(stakeInput);
    if (!Number.isFinite(amount) || amount <= 0) return setActionFeedback('Informe uma quantidade válida para mover ao staking.');
    if (amount > balances.free) return setActionFeedback('O saldo livre não tem BETTEX suficientes para essa simulação.');
    setBalances((current) => ({ free: current.free - amount, staked: current.staked + amount }));
    setStakeInput('');
    setActionFeedback(`${amount} BETTEX movidos para o staking simulado. O saldo foi atualizado localmente.`);
  };
  const withdrawTokens = () => {
    const amount = Number(withdrawInput);
    if (!Number.isFinite(amount) || amount <= 0) return setActionFeedback('Informe uma quantidade válida para retirar.');
    if (amount > balances.staked) return setActionFeedback('O staking simulado não tem BETTEX suficientes para essa retirada.');
    setBalances((current) => ({ free: current.free + amount, staked: current.staked - amount }));
    setWithdrawInput('');
    setActionFeedback(`${amount} BETTEX retirados do staking simulado e devolvidos ao saldo livre.`);
  };
  const sellTokens = () => {
    const amount = Number(sellInput);
    if (!Number.isFinite(amount) || amount <= 0) return setActionFeedback('Informe uma quantidade válida para simular a venda.');
    if (amount > balances.free) return setActionFeedback('A simulação de venda aceita apenas tokens livres disponíveis.');
    setBalances((current) => ({ ...current, free: current.free - amount }));
    setSellInput('');
    setActionFeedback(`${amount} BETTEX removidos do saldo livre. Nenhum valor foi pago: a venda é apenas demonstrativa.`);
  };

  const balanceRows = useMemo(() => [
    { label: 'Tokens livres', value: balances.free },
    { label: 'No staking', value: balances.staked },
    { label: 'Total BETTEX', value: totalTokens },
  ], [balances.free, balances.staked, totalTokens]);

  return (
    <div className="bettex-shell noise">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-[hsl(218_33%_8%/.88)] backdrop-blur-xl">
        <Notice>BETTEX É UMA DEMONSTRAÇÃO · sem venda, cobrança ou operação real</Notice>
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Navegação principal">
            <a className="focus-ring text-xs text-muted-foreground transition-colors hover:text-foreground" href="#ideia">A ideia</a>
            <a className="focus-ring text-xs text-muted-foreground transition-colors hover:text-foreground" href="#agentes">Agentes</a>
            <a className="focus-ring text-xs text-muted-foreground transition-colors hover:text-foreground" href="#comprar">Comprar</a>
            <a className="focus-ring text-xs text-muted-foreground transition-colors hover:text-foreground" href="#meus-tokens">Meus tokens</a>
          </nav>
          <button onClick={connectWallet} className="focus-ring hidden items-center gap-2 rounded-full border border-primary/45 bg-primary/10 px-4 py-2.5 font-code text-[11px] uppercase tracking-wider text-primary transition hover:bg-primary/20 md:flex">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-primary' : 'bg-muted-foreground'}`} />
            {connected ? WALLET : 'Conectar carteira'}
          </button>
          <button onClick={() => setMobileOpen((value) => !value)} className="focus-ring rounded-lg border border-border p-2 text-muted-foreground md:hidden" aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && <nav className="border-t border-border bg-[hsl(218_33%_8%)] px-5 py-4 md:hidden" aria-label="Navegação móvel">
          <div className="flex flex-col gap-4">
            {['ideia', 'agentes', 'comprar', 'meus-tokens'].map((item) => <a key={item} onClick={() => setMobileOpen(false)} href={`#${item}`} className="focus-ring font-code text-xs uppercase tracking-wider text-muted-foreground">{item.replace('-', ' ')}</a>)}
            <button onClick={connectWallet} className="focus-ring flex w-fit items-center gap-2 rounded-full border border-primary/45 bg-primary/10 px-4 py-2.5 font-code text-[11px] uppercase tracking-wider text-primary">{connected ? WALLET : 'Conectar carteira'}</button>
          </div>
        </nav>}
      </header>

      <main>
        <section id="inicio" className="relative mx-auto grid max-w-[1240px] gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-28">
          <div className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="reveal">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[.06] px-3 py-2 font-code text-[10px] uppercase tracking-[.14em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Participação por token · proposta em estruturação</div>
            <h1 className="max-w-3xl font-display text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[.92] tracking-[-.075em] text-balance">A IA opera.<br /><span className="text-primary">Você acompanha.</span></h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">BETTEX propõe uma participação por token em agentes de inteligência artificial aplicados a mercados de previsão, esportes, cassino e cripto — com limites claros e sem promessa de resultado.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#ideia" className="focus-ring inline-flex items-center justify-center gap-3 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(157,255,207,.16)]">Entenda a proposta <ArrowDown className="h-4 w-4" /></a>
              <a href="#agentes" className="focus-ring inline-flex items-center justify-center gap-3 rounded-full border border-border bg-card/50 px-5 py-3.5 text-sm font-semibold text-foreground transition hover:border-primary/45">Conheça os agentes <ArrowRight className="h-4 w-4 text-primary" /></a>
            </div>
            <p className="mt-6 max-w-lg font-code text-[10px] uppercase leading-5 tracking-[.1em] text-muted-foreground">Aviso responsável: o token pode perder todo o valor. Não use dinheiro de necessidades essenciais. Apostas não são tratamento.</p>
          </div>
          <div className="reveal reveal-2 relative">
            <div className="absolute -inset-10 bg-primary/[.045] blur-3xl" />
            <div className="dash-card hero-glow relative overflow-hidden rounded-[1.6rem] p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-border/70 pb-5">
                <div><SectionKicker light>Arquitetura de participação</SectionKicker><p className="mt-1 font-display text-xl font-semibold">Uma máquina, quatro frentes</p></div>
                <span className="font-code text-[10px] text-muted-foreground">DEMO / 001</span>
              </div>
              <div className="relative py-10">
                <div className="absolute left-[21px] top-[53px] h-[calc(100%-106px)] border-l border-dashed border-primary/35" />
                {[
                  ['01', 'VOCÊ', 'Participa por meio do token'],
                  ['02', 'BETTEX', 'A IA segue limites definidos'],
                  ['03', '4 AGENTES', 'Cada um pesquisa uma especialidade'],
                ].map(([index, title, copy], i) => <div key={title} className="relative mb-7 flex items-center gap-5 last:mb-0">
                  <span className={`relative z-10 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border ${i === 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-primary/30 bg-background text-primary'} font-code text-[10px]`}>{index}</span>
                  <div><p className="font-display text-lg font-semibold tracking-tight">{title}</p><p className="mt-1 text-xs text-muted-foreground">{copy}</p></div>
                </div>)}
              </div>
              <div className="grid grid-cols-4 gap-2 border-t border-border/70 pt-5">{['PREDIX', 'SPORTIX', 'BETTIX', 'TRADIX'].map((name) => <span key={name} className="text-center font-code text-[9px] tracking-wider text-muted-foreground">{name}</span>)}</div>
            </div>
            <div className="float-slow absolute -bottom-5 -left-5 hidden rounded-xl border border-accent/30 bg-[hsl(218_28%_11%)] px-4 py-3 shadow-xl sm:block"><p className="font-code text-[9px] uppercase tracking-wider text-accent">Regra central</p><p className="mt-1 text-xs text-muted-foreground">Sem promessa de retorno</p></div>
          </div>
        </section>

        <section id="ideia" className="border-y border-border/70 bg-card/35">
          <div className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
              <div><SectionKicker>01 / A ideia</SectionKicker><h2 className="mt-4 max-w-lg font-display text-4xl font-semibold leading-tight tracking-[-.04em] md:text-5xl">Você participa.<br /><span className="text-primary">A máquina pesquisa.</span></h2><p className="mt-6 max-w-md leading-7 text-muted-foreground">A proposta tira a decisão do calor do momento e coloca o foco em agentes que trabalham dentro de parâmetros. Você decide se quer ter tokens e se quer deixá-los no staking único.</p></div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['01', 'Tenha tokens', 'O token seria a forma de participar do projeto. A compra nesta página é somente uma simulação.'],
                  ['02', 'Deixe seus tokens', 'Um staking único reuniria a participação. Se não houver resultado para dividir, o pagamento pode ser zero.'],
                  ['03', 'Decida quando sair', 'Você pode simular retirar e vender tokens livres. Uma venda real exigiria mercado e comprador.'],
                ].map(([num, title, copy]) => <article key={num} className="rounded-2xl border border-border bg-background/50 p-5 transition hover:-translate-y-1 hover:border-primary/30"><span className="font-code text-xs text-primary">{num}</span><h3 className="mt-10 font-display text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p></article>)}
              </div>
            </div>
            <div className="mt-16 flex flex-col gap-4 rounded-2xl border border-accent/25 bg-accent/[.06] p-5 sm:flex-row sm:items-start sm:p-6"><CircleHelp className="h-5 w-5 shrink-0 text-accent" /><p className="text-sm leading-6 text-muted-foreground"><strong className="font-semibold text-foreground">Transparência antes de tudo.</strong> Isto é uma proposta de produto, não um convite para apostar. Toda estrutura depende de desenvolvimento, governança e revisão regulatória. Nenhum agente está operando agora.</p></div>
          </div>
        </section>

        <section id="agentes" className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><SectionKicker>02 / Agentes</SectionKicker><h2 className="mt-4 font-display text-4xl font-semibold tracking-[-.04em] md:text-5xl">Quatro leituras.<br /><span className="text-primary">Um só staking.</span></h2></div><p className="max-w-sm text-sm leading-6 text-muted-foreground">Painel de exemplo para demonstrar como a contribuição poderia ser visualizada. Nada aqui é histórico ou previsão.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {agents.map((agent, index) => <article key={agent.name} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/35">
              <div className={`absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl ${agent.tone === 'mint' ? 'bg-primary/10' : agent.tone === 'blue' ? 'bg-cyan-300/10' : agent.tone === 'amber' ? 'bg-accent/10' : 'bg-violet-300/10'}`} />
              <div className="relative flex items-start justify-between gap-4"><div><span className="font-code text-[10px] text-muted-foreground">0{index + 1} / {agent.status}</span><h3 className="mt-3 font-display text-2xl font-semibold">{agent.name}</h3><p className="mt-1 text-xs uppercase tracking-wider text-primary/80">{agent.eyebrow}</p></div><ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div>
              <p className="relative mt-8 max-w-sm text-sm leading-6 text-muted-foreground">{agent.description}</p>
              <div className="relative mt-8 grid grid-cols-3 gap-3 border-t border-border/70 pt-4"><div><span className="font-code text-[9px] uppercase text-muted-foreground">Resultado</span><p className={`mt-1 text-sm font-semibold ${agent.result.startsWith('−') ? 'text-destructive' : 'text-foreground'}`}>{agent.result}</p></div><div><span className="font-code text-[9px] uppercase text-muted-foreground">Contribuição</span><p className="mt-1 text-sm font-semibold">{agent.contribution}</p></div><div><span className="font-code text-[9px] uppercase text-muted-foreground">Parte</span><p className="mt-1 text-sm font-semibold text-primary">{agent.share}</p></div></div>
            </article>)}
          </div>
          <p className="mt-5 font-code text-[10px] uppercase tracking-[.1em] text-muted-foreground">Cenário fictício · enviado ao staking hoje: <span className="text-foreground">R$ 11.500</span> · valores meramente ilustrativos</p>
        </section>

        <section id="comprar" className="border-y border-border/70 bg-card/35">
          <div className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
              <div><SectionKicker>03 / Comprar</SectionKicker><h2 className="mt-4 font-display text-4xl font-semibold tracking-[-.04em] md:text-5xl">Simule sua<br /><span className="text-primary">participação.</span></h2><p className="mt-6 max-w-md leading-7 text-muted-foreground">Preço proposto de R$ 5 por token. Use o controle para enxergar o valor demonstrativo — sem pagamento, carteira real ou emissão.</p><div className="mt-8 grid max-w-sm grid-cols-2 gap-3"><div className="rounded-xl border border-border bg-background/50 p-4"><span className="font-code text-[9px] uppercase tracking-wider text-muted-foreground">Preço proposto</span><p className="mt-2 font-display text-2xl font-semibold">R$ 5</p></div><div className="rounded-xl border border-border bg-background/50 p-4"><span className="font-code text-[9px] uppercase tracking-wider text-muted-foreground">Supply proposto</span><p className="mt-2 font-display text-2xl font-semibold">2 mi</p></div></div></div>
              <div className="rounded-2xl border border-border bg-background p-5 shadow-lg sm:p-7">
                <div className="flex items-center justify-between"><div><span className="font-code text-[10px] uppercase tracking-wider text-primary">Simulador local</span><h3 className="mt-2 font-display text-2xl font-semibold">Comprar BETTEX</h3></div><LockKeyhole className="h-5 w-5 text-muted-foreground" /></div>
                <div className="mt-8 rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Quantidade de tokens</span><span className="font-code text-xs text-primary">{quantity} BETTEX</span></div><div className="mt-5 flex items-center gap-4"><button aria-label="Diminuir quantidade" onClick={() => setQuantity((value) => Math.max(1, value - 10))} className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"><Minus className="h-4 w-4" /></button><input aria-label="Quantidade de tokens" type="range" min="10" max="500" step="10" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="accent-[hsl(var(--primary))] h-1.5 flex-1 cursor-pointer" /><button aria-label="Aumentar quantidade" onClick={() => setQuantity((value) => Math.min(500, value + 10))} className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"><Plus className="h-4 w-4" /></button></div><div className="mt-4 flex justify-between font-code text-[10px] text-muted-foreground"><span>10</span><span>500</span></div></div>
                <div className="mt-5 flex items-end justify-between border-b border-border pb-5"><div><p className="text-xs text-muted-foreground">Valor da simulação</p><p className="mt-1 font-display text-4xl font-semibold">{currency(selectedTotal)}</p></div><p className="font-code text-[10px] uppercase text-muted-foreground">R$ 5 / token</p></div>
                <button onClick={buyTokens} className="focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">{connected ? 'Simular compra' : 'Conectar para simular'} <ArrowRight className="h-4 w-4" /></button>
                <p className="mt-4 text-center font-code text-[10px] uppercase leading-5 tracking-wider text-muted-foreground">Nenhuma cobrança · nenhum token real · apenas demonstração</p>
              </div>
            </div>
          </div>
        </section>

        <section id="meus-tokens" className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><SectionKicker>04 / Meus tokens</SectionKicker><h2 className="mt-4 font-display text-4xl font-semibold tracking-[-.04em] md:text-5xl">Seu painel de<br /><span className="text-primary">demonstração.</span></h2></div><div className="flex items-center gap-2 font-code text-[10px] uppercase tracking-wider text-muted-foreground"><span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-primary' : 'bg-muted-foreground'}`} />{connected ? WALLET : 'Carteira não conectada'}</div></div>
          <div className="mt-12 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7"><div className="flex items-start justify-between"><div><span className="font-code text-[10px] uppercase tracking-wider text-muted-foreground">Saldo total</span><p className="mt-3 font-display text-5xl font-semibold">{totalTokens}<span className="ml-2 text-xl text-primary">BETTEX</span></p></div><div className="rounded-xl bg-primary/10 p-3 text-primary"><Copy className="h-5 w-5" /></div></div><div className="mt-8 divide-y divide-border">{balanceRows.map((row) => <div key={row.label} className="flex items-center justify-between py-3 text-sm"><span className="text-muted-foreground">{row.label}</span><span className="font-code text-xs">{row.value} BETTEX</span></div>)}</div><button onClick={connectWallet} className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:border-primary/50">{connected ? 'Desconectar carteira fictícia' : 'Conectar carteira fictícia'} <ArrowRight className="h-4 w-4 text-primary" /></button></div>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7"><div className="flex items-start justify-between"><div><span className="font-code text-[10px] uppercase tracking-wider text-muted-foreground">Movimentar tokens</span><h3 className="mt-2 font-display text-2xl font-semibold">Staking e retirada</h3></div><span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-code text-[9px] uppercase tracking-wider text-accent">Local</span></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><ActionBox label="Mover ao staking" value={stakeInput} setValue={setStakeInput} max={balances.free} action={moveToStaking} buttonText="Mover tokens" hint={`Disponível: ${balances.free}`} /><ActionBox label="Retirar do staking" value={withdrawInput} setValue={setWithdrawInput} max={balances.staked} action={withdrawTokens} buttonText="Retirar tokens" hint={`No staking: ${balances.staked}`} /></div><div className="mt-4 border-t border-border pt-5"><ActionBox label="Simular venda de tokens livres" value={sellInput} setValue={setSellInput} max={balances.free} action={sellTokens} buttonText="Simular venda" hint={`Tokens livres: ${balances.free}`} /></div></div>
          </div>
          <div role="status" aria-live="polite" className="mt-5 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[.05] p-4 text-sm leading-6 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{feedback}</div>
        </section>

        <section className="border-t border-border/70 bg-[hsl(218_28%_11%)]">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-20 lg:grid-cols-[1fr_.7fr] lg:px-8">
            <div><SectionKicker light>Proposta em revisão</SectionKicker><h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-[-.03em] md:text-4xl">Clareza é parte do produto.</h2><p className="mt-5 max-w-xl leading-7 text-muted-foreground">Tokenomics e regras são propostas: supply de 2 milhões, 50% público, 30% investidores, 20% IA, preço proposto de R$ 5. Tudo depende de estruturação, governança e revisão regulatória. O painel acima é um cenário fictício.</p></div>
            <div className="rounded-2xl border border-border bg-background/50 p-5"><div className="flex items-center justify-between border-b border-border pb-4"><span className="font-code text-[10px] uppercase tracking-wider text-muted-foreground">Distribuição proposta</span><span className="font-code text-[10px] text-primary">100%</span></div>{[['Público', '50%'], ['Investidores', '30%'], ['IA', '20%']].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-border/70 py-4 text-sm"><span>{label}</span><span className="font-code text-xs text-primary">{value}</span></div>)}<p className="mt-4 text-xs leading-5 text-muted-foreground">A distribuição ainda não é uma oferta e pode mudar.</p></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-8 lg:px-8"><div className="mx-auto flex max-w-[1240px] flex-col gap-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><Logo /><p className="max-w-lg leading-5">Demonstração sem cobrança, mercado, agente em operação, blockchain ou pagamento. Não use dinheiro de necessidades essenciais. O token pode perder todo o valor. Apostas não são tratamento.</p><a href="#inicio" className="focus-ring inline-flex items-center gap-2 font-code text-[10px] uppercase tracking-wider text-primary">Voltar ao topo <ChevronDown className="h-3 w-3 rotate-180" /></a></div></footer>
    </div>
  );
}

function ActionBox({ label, value, setValue, max, action, buttonText, hint }: { label: string; value: string; setValue: (value: string) => void; max: number; action: () => void; buttonText: string; hint: string }) {
  return <div className="rounded-xl border border-border bg-background/50 p-4"><div className="flex items-center justify-between gap-2"><label className="text-xs font-semibold">{label}</label><span className="font-code text-[9px] text-muted-foreground">{hint}</span></div><div className="mt-3 flex gap-2"><input min="1" max={max} value={value} onChange={(event) => setValue(event.target.value.replace(/[^0-9]/g, ''))} placeholder="0" inputMode="numeric" className="focus-ring min-w-0 flex-1 rounded-lg border border-input bg-card px-3 py-2.5 font-code text-sm text-foreground outline-none placeholder:text-muted-foreground" /><button disabled={!max} onClick={action} className="focus-ring rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">{buttonText}</button></div><div className="mt-2 flex items-center justify-between font-code text-[9px] uppercase tracking-wider text-muted-foreground"><span>Máximo: {max}</span><button onClick={() => setValue(String(max))} className="focus-ring text-primary disabled:opacity-40" disabled={!max}>Usar tudo</button></div></div>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;