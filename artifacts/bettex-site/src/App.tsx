import { type ReactNode, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, Minus, Plus, ShieldCheck, Wallet, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();
const KEY = 'bettex-demo-balances';
const WALLET = '0x4A72...91c8';
const PRICE = 5;
const image = (name: string) => `${import.meta.env.BASE_URL}agents/${name}.webp`;

type Balance = { free: number; participating: number };
type Agent = {
  name: string;
  image: string;
  area: string;
  intro: string;
  detail: string;
  result: string;
  sent: string;
  percent: string;
  background: string;
  imageBackground: string;
  negative?: boolean;
};

const agents: Agent[] = [
  { name: 'PREDIX', image: 'predix', area: 'Previsões', intro: 'O curioso do futuro.', detail: 'Estudaria acontecimentos e chances de cada cenário. É uma proposta, não uma previsão de ganho.', result: 'R$ 12.000', sent: 'R$ 6.000', percent: '52,2%', background: '#d9f5e8', imageBackground: '#ace5d2' },
  { name: 'SPORTIX', image: 'sportix', area: 'Esportes', intro: 'De olho no jogo.', detail: 'Analisaria dados de partidas, sempre dentro de limites a serem definidos.', result: 'R$ 7.000', sent: 'R$ 3.500', percent: '30,4%', background: '#dae9ff', imageBackground: '#a9c9fa' },
  { name: 'BETTIX', image: 'bettix', area: 'Cassino', intro: 'Só com regras claras.', detail: 'Essa frente ainda precisaria de regras e limites. Perdas também fazem parte dos exemplos.', result: '− R$ 3.200', sent: 'R$ 0', percent: '—', background: '#ffe8d4', imageBackground: '#facb9f', negative: true },
  { name: 'TRADIX', image: 'tradix', area: 'Cripto', intro: 'Atento ao mercado.', detail: 'Estudaria ativos digitais. As regras dessa frente ainda não foram definidas.', result: 'R$ 4.000', sent: 'R$ 2.000', percent: '17,4%', background: '#eee0f8', imageBackground: '#d9b9ed' },
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

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState<Balance>(readBalance);
  const [quantity, setQuantity] = useState(40);
  const [toParticipating, setToParticipating] = useState('');
  const [toFree, setToFree] = useState('');
  const [toSell, setToSell] = useState('');
  const [feedback, setFeedback] = useState('Este é um teste. Nenhum dinheiro ou token real é usado.');

  const save = (next: Balance) => {
    setBalance(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* A experiência continua mesmo sem armazenamento local. */ }
  };
  const startDemo = () => {
    setConnected(true);
    setMenuOpen(false);
    setFeedback(`Demonstração iniciada. Sua carteira de exemplo é ${WALLET}. Nada foi conectado de verdade.`);
    document.getElementById('comprar')?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="bg-[#ffdeb9] px-4 py-2.5 text-center text-[11px] font-semibold leading-snug text-[#173b3a] sm:text-xs">
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#e27652] align-middle" />
      Aqui é só uma demonstração. Não há venda, aposta, operação ou pagamento real.
    </div>
    <header className="sticky top-0 z-40 border-b border-[#d6e1d7] bg-[#f7f4e9]/95 backdrop-blur-lg">
      <div className="page-wrap flex h-[72px] items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          <a href="#ideia" className="text-sm font-semibold hover:text-[#168367]">A ideia</a>
          <a href="#agentes" className="text-sm font-semibold hover:text-[#168367]">Agentes</a>
          <a href="#comprar" className="text-sm font-semibold hover:text-[#168367]">Teste grátis</a>
          <a href="#meus-tokens" className="text-sm font-semibold hover:text-[#168367]">Meus tokens</a>
        </nav>
        <button type="button" onClick={startDemo} className="tap hidden items-center gap-2 rounded-full bg-[#123a3b] px-5 py-3 text-xs font-bold text-[#f7f4e9] hover:bg-[#245d57] sm:inline-flex"><Wallet className="h-4 w-4" />{connected ? WALLET : 'Entrar na demonstração'}</button>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} className="rounded-xl border border-[#bdd5c8] p-2.5 lg:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {menuOpen && <nav className="page-wrap flex flex-col gap-1 border-t border-[#d6e1d7] py-3 lg:hidden" aria-label="Navegação móvel">
        {([['A ideia', 'ideia'], ['Agentes', 'agentes'], ['Teste grátis', 'comprar'], ['Meus tokens', 'meus-tokens']] as const).map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-bold hover:bg-[#e6f0e7]">{label}</a>)}
        <button type="button" onClick={startDemo} className="mt-1 flex items-center gap-2 rounded-xl bg-[#123a3b] px-4 py-3 text-sm font-bold text-[#f7f4e9]"><Wallet className="h-4 w-4" />{connected ? WALLET : 'Entrar na demonstração'}</button>
      </nav>}
    </header>

    <main>
      <section id="inicio" className="hero-bg relative overflow-hidden text-[#f7f4e9]">
        <div className="hero-pattern pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_right,transparent,black)]" />
        <div className="page-wrap relative grid min-h-[660px] items-center gap-10 pb-10 pt-8 sm:pt-16 md:grid-cols-[1fr_.95fr] md:py-20 lg:min-h-[715px]">
          <div className="entrance relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#94ebcb]/35 bg-[#94ebcb]/10 px-4 py-2 text-[11px] font-bold text-[#aff3d7]"><span className="h-2 w-2 rounded-full bg-[#a6edcb]" /> Uma proposta de participação em IA</div>
            <div className="mt-6 flex gap-1.5 md:hidden" aria-hidden="true">
              {agents.map((agent) => <div key={agent.name} className="relative h-[78px] min-w-0 flex-1 overflow-hidden rounded-[18px]" style={{ backgroundColor: agent.imageBackground }}><img src={image(agent.image)} alt="" className="absolute inset-0 h-full w-full object-contain" /></div>)}
            </div>
            <h1 className="hero-title mt-7 max-w-[650px] text-[clamp(3.5rem,6.2vw,6.3rem)] font-extrabold">Uma ideia de IA.<br /><span className="text-[#a4eacb]">Sua parte nela.</span></h1>
            <p className="mt-6 max-w-[555px] text-[17px] leading-[1.7] text-[#d7e9df] sm:text-lg">A BETTEX quer ser um projeto de investimento em IA, não mais uma aposta. A ideia é participar por tokens enquanto quatro agentes estudariam mercados diferentes. <strong className="font-bold text-[#f7f4e9]">Por enquanto, não há investimento disponível nem operação real.</strong></p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#ideia" className="tap inline-flex items-center gap-2 rounded-full bg-[#a4eacb] px-6 py-4 text-sm font-bold text-[#103739] hover:bg-[#c0f5dc]">Entender em 30 segundos <ArrowRight className="h-4 w-4" /></a><a href="#comprar" className="tap inline-flex items-center gap-2 rounded-full border border-[#a4eacb]/45 px-6 py-4 text-sm font-bold text-[#f7f4e9] hover:bg-white/10">Testar sem gastar <ArrowDown className="h-4 w-4" /></a></div>
            <p className="mt-8 max-w-lg border-l-2 border-[#ffcb9b] pl-4 text-xs leading-5 text-[#c9e0d6]">Aposta não é investimento. Não use dinheiro do salário, das contas ou de necessidades essenciais. O token pode perder todo o valor.</p>
          </div>
          <div className="entrance entrance-delay relative mx-auto hidden h-[380px] w-full max-w-[530px] sm:h-[480px] md:block md:h-[530px]" aria-label="Ilustração dos quatro agentes de IA">
            <div className="absolute inset-[9%] rounded-full border border-[#a4eacb]/30" />
            <div className="absolute inset-[19%] rounded-full border border-dashed border-[#a4eacb]/30" />
            <div className="absolute inset-[30%] rounded-full bg-[#a4eacb]/10 blur-2xl" />
            <div className="absolute left-[34%] top-[39%] z-10 grid h-[31%] w-[31%] place-items-center rounded-[27%] border border-[#a4eacb]/45 bg-[#1c5953] shadow-2xl"><span className="display text-center text-[clamp(1.1rem,2.7vw,1.8rem)] font-extrabold tracking-[-.06em]">BETTEX<span className="text-[#a4eacb]">.</span></span></div>
            {agents.map((agent, i) => <div key={agent.name} className={`hero-agent absolute ${['left-[-1%] top-[1%] w-[54%]', 'right-[-3%] top-[0%] w-[53%]', 'bottom-[-4%] left-[0%] w-[52%]', 'bottom-[-4%] right-[-2%] w-[52%]'][i]}`}>
              <img src={image(agent.image)} alt={`${agent.name}, agente de ${agent.area.toLowerCase()}`} className="w-full" />
            </div>)}
            <span className="stamp absolute right-[-1%] top-[47%] z-20 rounded-full bg-[#ffd39e] px-4 py-2.5 text-center text-[11px] font-extrabold text-[#173b3a] shadow-lg sm:text-xs">4 ideias.<br />0 operações reais.</span>
          </div>
        </div>
      </section>

      <section id="ideia" className="py-20 sm:py-28">
        <div className="page-wrap">
          <div className="mx-auto max-w-3xl text-center"><Eyebrow>A ideia, sem complicar</Eyebrow><h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.8rem)] font-extrabold leading-[1.04] tracking-[-.055em]">Não é você contra<br /><span className="text-[#208c70]">a próxima aposta.</span></h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#526e69]">A proposta é criar um projeto de IA que siga regras. Se um dia ele existir, o token seria uma forma de participar. Hoje você só pode entender a ideia e testar uma simulação gratuita.</p></div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              { number: '01', title: 'Conheça a ideia', copy: 'Quatro agentes de IA, cada um voltado a um tipo de mercado.', color: '#d9f5e8' },
              { number: '02', title: 'Teste com tokens fictícios', copy: 'Escolha uma quantidade. O preço de R$ 5 é apenas proposto. Nada será cobrado.', color: '#ffe5cd' },
              { number: '03', title: 'Veja como seria participar', copy: 'Deixe, tire ou “venda” tokens na tela. Tudo acontece só neste navegador.', color: '#dfe7fc' },
            ].map((step) => <div key={step.number} className="relative min-h-[245px] overflow-hidden rounded-[28px] p-7" style={{ backgroundColor: step.color }}><span className="display absolute -right-1 -top-7 text-[130px] font-extrabold leading-none text-[#123a3b]/[.055]">{step.number}</span><span className="mono relative text-xs font-bold text-[#146d55]">{step.number} / 03</span><h3 className="display relative mt-14 text-2xl font-extrabold leading-tight tracking-[-.035em]">{step.title}</h3><p className="relative mt-3 max-w-[280px] text-sm leading-6 text-[#435d58]">{step.copy}</p></div>)}
          </div>
        </div>
      </section>

      <section id="agentes" className="bg-[#e8efe7] py-20 sm:py-28">
        <div className="page-wrap">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><Eyebrow>Conheça os agentes</Eyebrow><h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.8rem)] font-extrabold leading-[1.04] tracking-[-.055em]">Quatro agentes.<br />Cada um no seu mundo.</h2></div><p className="max-w-[360px] text-sm leading-6 text-[#526e69]">Conheça as quatro áreas que a BETTEX quer explorar.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {agents.map((agent, i) => <article key={agent.name} className="agent-card overflow-hidden rounded-[30px]" style={{ backgroundColor: agent.background }}>
              <div className="relative flex min-h-[270px] items-end justify-center overflow-hidden sm:min-h-[320px]" style={{ backgroundColor: agent.imageBackground }}>
                <div className="absolute left-5 top-5 z-10 rounded-full bg-[#123a3b]/85 px-3 py-1.5 text-[11px] font-bold text-white">0{i + 1} · {agent.area}</div>
                <div className="absolute right-[-10%] top-[-60%] h-[480px] w-[480px] rounded-full border-[50px] border-white/20" />
                <img src={image(agent.image)} alt={`Ilustração de ${agent.name}`} loading="lazy" className="agent-image relative z-10 h-[270px] w-[270px] object-contain sm:h-[330px] sm:w-[330px]" />
              </div>
              <div className="p-6 sm:p-7"><div className="flex items-start justify-between gap-3"><div><h3 className="display text-[30px] font-extrabold leading-none tracking-[-.055em]">{agent.name}</h3><p className="display mt-2 text-lg font-bold">{agent.intro}</p></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#123a3b]/20"><ArrowUpRight className="h-4 w-4" /></span></div><p className="mt-3 max-w-[440px] text-sm leading-6 text-[#455f5b]">{agent.detail}</p>
                <div className="mt-6 rounded-2xl bg-white/55 p-4"><p className="mono text-[10px] font-bold uppercase tracking-[.09em] text-[#435d58]">Exemplo fictício · não é resultado real</p><div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#123a3b]/15 pt-3"><div><p className="text-[10px] text-[#526e69]">Resultado</p><p className={`mt-1 text-sm font-bold sm:text-base ${agent.negative ? 'text-[#b44838]' : ''}`}>{agent.result}</p></div><div><p className="text-[10px] text-[#526e69]">Foi para o grupo</p><p className="mt-1 text-sm font-bold sm:text-base">{agent.sent}</p></div><div><p className="text-[10px] text-[#526e69]">Parte do total</p><p className="mt-1 text-sm font-bold sm:text-base">{agent.percent}</p></div></div></div>
              </div>
            </article>)}
          </div>
          <div className="mt-5 rounded-[22px] border border-[#b9d3c4] bg-[#f9faf3] px-6 py-5 text-sm leading-6 text-[#435d58]"><strong className="text-[#123a3b]">Exemplo fictício:</strong> neste cenário, R$ 11.500 teriam sido enviados para a participação em conjunto hoje. Esses números não são histórico, promessa de retorno nem dinheiro disponível.</div>
        </div>
      </section>

      <section id="comprar" className="py-20 sm:py-28">
        <div className="page-wrap grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-16">
          <div><Eyebrow>Experimente sem gastar</Eyebrow><h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.8rem)] font-extrabold leading-[1.04] tracking-[-.055em]">E se você tivesse alguns tokens?</h2><p className="mt-6 max-w-md text-base leading-7 text-[#526e69]">Escolha quantos quiser testar. A conta usa o preço <strong className="text-[#123a3b]">proposto</strong> de R$ 5 por token. Não existe token à venda aqui, nem cobrança.</p><div className="mt-8 flex max-w-md items-start gap-3 rounded-[22px] bg-[#ffe7d0] p-5"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b95c36]" /><p className="text-sm leading-6 text-[#654d3e]">Tudo que você fizer nesta área é de mentira e fica apenas neste navegador. Nenhuma carteira, pagamento ou serviço externo é chamado.</p></div></div>
          <div className="rounded-[32px] border border-[#bad5c6] bg-[#e3f2e7] p-4 shadow-[0_24px_60px_rgba(20,78,64,.09)] sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><span className="mono text-[10px] font-bold uppercase tracking-[.1em] text-[#168367]">Sua compra de mentirinha</span><h3 className="display mt-2 text-2xl font-extrabold tracking-[-.04em]">Escolha uma quantidade</h3></div><span className="rounded-full bg-[#c9e9d7] px-3 py-1.5 text-[10px] font-bold text-[#176d54]">SEM CUSTO</span></div>
            <div className="mt-8 flex items-center justify-between gap-2 rounded-[22px] bg-[#fcfbf3] p-3 sm:p-4">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, Number(q) - 10))} aria-label="Diminuir quantidade" className="tap grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e2f1e7] hover:bg-[#cbebd9]"><Minus className="h-5 w-5" /></button>
              <div className="min-w-0 text-center"><label htmlFor="token-amount" className="block text-xs text-[#526e69]">Tokens fictícios</label><input id="token-amount" type="number" min="1" max="500" step="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="number-input display w-full bg-transparent text-center text-4xl font-extrabold tracking-[-.05em] outline-none sm:text-5xl" /></div>
              <button type="button" onClick={() => setQuantity((q) => Math.min(500, Number(q) + 10))} aria-label="Aumentar quantidade" className="tap grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e2f1e7] hover:bg-[#cbebd9]"><Plus className="h-5 w-5" /></button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{[10, 40, 100].map((number) => <button key={number} type="button" onClick={() => setQuantity(number)} className={`tap rounded-full border px-4 py-2 text-xs font-bold ${quantity === number ? 'border-[#123a3b] bg-[#123a3b] text-white' : 'border-[#b5d1c3] bg-[#f9fbf3] text-[#123a3b]'}`}>{number} tokens</button>)}</div>
            <div className="mt-8 flex items-end justify-between border-b border-[#b6d5c5] pb-5"><div><p className="text-sm text-[#526e69]">Valor apenas ilustrativo</p><p className="display mt-1 text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">{Number.isFinite(quantity) && quantity >= 1 ? money(quantity * PRICE) : '—'}</p></div><span className="text-right text-xs text-[#526e69]">R$ 5 por token<br />preço proposto</span></div>
            <button type="button" onClick={buy} className="tap mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#123a3b] px-5 py-4 text-sm font-bold text-[#f6f5ea] hover:bg-[#235956]">Colocar tokens na minha demonstração <ArrowRight className="h-4 w-4" /></button>
            <p className="mt-4 text-center text-xs text-[#526e69]">Sem cartão, sem Pix, sem compra real.</p>
          </div>
        </div>
      </section>

      <section id="meus-tokens" className="bg-[#d9eee3] py-20 sm:py-28">
        <div className="page-wrap">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><Eyebrow>Seu espaço de teste</Eyebrow><h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.8rem)] font-extrabold leading-[1.04] tracking-[-.055em]">Agora, veja como seria.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#526e69]">Os tokens são fictícios. “Deixar participando” só muda o lugar deles na tela — não ativa uma operação e não cria rendimentos.</p></div><div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#a8ceba] bg-[#f5faf2] px-4 py-2 text-xs font-bold text-[#176d54]"><span className="h-2 w-2 rounded-full bg-[#2aa983]" />{connected ? `Carteira fictícia ${WALLET}` : 'Demonstração local'}</div></div>
          <div className="mt-10 grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
            <div className="rounded-[30px] bg-[#123a3b] p-6 text-[#f8f7ed] sm:p-8"><div className="flex items-center justify-between"><p className="text-sm text-[#c2d9cf]">Seus tokens de exemplo</p><Wallet className="h-5 w-5 text-[#a4eacb]" /></div><p className="display mt-5 text-6xl font-extrabold tracking-[-.07em]">{balance.free + balance.participating}</p><p className="mt-1 text-xs text-[#c2d9cf]">BETTEX fictícios no total</p><div className="mt-9 divide-y divide-[#b6dccb]/20 border-t border-[#b6dccb]/20"><div className="flex justify-between py-4 text-sm"><span className="text-[#c2d9cf]">Livres para usar</span><strong>{balance.free}</strong></div><div className="flex justify-between py-4 text-sm"><span className="text-[#c2d9cf]">Deixados participando</span><strong>{balance.participating}</strong></div></div><p className="mt-5 text-xs leading-5 text-[#b5d5c7]">Saldos guardados apenas neste navegador. Não representam propriedade ou valor real.</p></div>
            <div className="rounded-[30px] border border-[#b9d6c5] bg-[#f2f8ef] p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="mono text-[10px] font-bold uppercase tracking-[.1em] text-[#168367]">Faça um teste</p><h3 className="display mt-1 text-2xl font-extrabold tracking-[-.04em]">O que você quer fazer?</h3></div><span className="hidden rounded-full bg-[#dfefe3] px-3 py-1.5 text-[10px] font-bold text-[#176d54] sm:inline-block">SÓ NA TELA</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><MoveControl title="Deixar tokens participando" available={balance.free} value={toParticipating} onChange={setToParticipating} onSubmit={leaveParticipating} button="Deixar participando" /><MoveControl title="Tirar tokens da participação" available={balance.participating} value={toFree} onChange={setToFree} onSubmit={withdraw} button="Tirar meus tokens" /></div><div className="mt-3"><MoveControl title="Simular venda dos tokens livres" available={balance.free} value={toSell} onChange={setToSell} onSubmit={sell} button="Simular venda" /></div></div>
          </div>
          <div role="status" aria-live="polite" className="mt-4 flex items-start gap-3 rounded-[18px] border border-[#9ccdb1] bg-[#f9faf1] px-5 py-4 text-sm leading-6 text-[#285b4b]"><Check className="mt-0.5 h-4 w-4 shrink-0" />{feedback}</div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="page-wrap grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-16"><div><Eyebrow>Ainda é uma proposta</Eyebrow><h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.4rem)] font-extrabold leading-[1.04] tracking-[-.055em]">Os números precisam estar claros.</h2><p className="mt-5 max-w-md text-base leading-7 text-[#526e69]">A distribuição pensada é de <strong className="text-[#123a3b]">2 milhões de tokens</strong>. O preço proposto é de R$ 5 por token. Ainda não existe venda real ou oferta aprovada.</p></div><div className="overflow-hidden rounded-[30px] border border-[#c6d7cc] bg-[#fdfcf6] p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><h3 className="display text-2xl font-extrabold">Divisão proposta</h3><span className="rounded-full bg-[#e9efe8] px-3 py-1 text-[10px] font-bold uppercase text-[#526e69]">Não é oferta</span></div><div className="mt-6 flex h-7 overflow-hidden rounded-full"><div className="w-1/2 bg-[#39a985]" /><div className="w-1/4 bg-[#72a6e6]" /><div className="w-1/4 bg-[#ef9a6c]" /></div><div className="mt-7 space-y-4">{[['Público', '50%', '#39a985'], ['Investidores', '25%', '#72a6e6'], ['Dono / criador do sistema', '25%', '#ef9a6c']].map(([label, percent, color]) => <div key={label} className="flex items-center justify-between border-b border-[#dbe3d7] pb-4 text-sm last:border-0 last:pb-0"><span className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />{label}</span><strong className="display text-xl">{percent}</strong></div>)}</div><p className="mt-6 text-xs leading-5 text-[#526e69]">Esta é a divisão planejada; ainda não há tokens à venda.</p></div></div>
      </section>

      <section className="bg-[#ffe6cc] py-16 sm:py-20"><div className="page-wrap flex flex-col gap-7 md:flex-row md:items-center md:justify-between"><div><Eyebrow>Antes de ir</Eyebrow><h2 className="display mt-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-[-.04em] sm:text-4xl">Cuide primeiro do que é essencial.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#61534a]">Aposta não é investimento. Não use dinheiro do salário, das contas ou de necessidades essenciais. Tokens podem perder todo o valor. Apostas não são tratamento. Se o jogo deixou de ser diversão e está afetando sua vida, procure apoio.</p></div><a href="#inicio" className="tap inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#123a3b] px-5 py-3.5 text-sm font-bold text-[#f7f4e9]">Voltar ao começo <ArrowUpRight className="h-4 w-4" /></a></div></section>
    </main>

    <footer className="bg-[#123a3b] py-10 text-[#d0e5d9]"><div className="page-wrap flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><Logo pale /><p className="max-w-[550px] text-xs leading-6">Demonstração da BETTEX. Sem tokens reais, apostas ou pagamentos nesta página.</p><a href="#inicio" className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#a4eacb]">Voltar ao topo <ChevronDown className="h-4 w-4 rotate-180" /></a></div></footer>
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