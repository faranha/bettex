import { useEffect, type ReactNode } from 'react';
import { ArrowRight, ExternalLink, Instagram } from 'lucide-react';
import g from '@/lib/growth-strategy.json';
import { FounderProfile } from '@/components/FounderProfile';
import { founderSocials } from '@/lib/founder-socials';
import { ProblemSection } from '@/components/pitch/ProblemSection';
import { FutureSections } from '@/components/pitch/FutureSections';
import './pitch.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;
const LINKEDIN = founderSocials.find(({ name }) => name === 'LinkedIn')!.href;
const INSTAGRAM = founderSocials.find(({ name }) => name === 'Instagram')!.href;

function Sec({ id, n, kicker, title, dark = false, summary, children }: { id: string; n: string; kicker: string; title: ReactNode; dark?: boolean; summary?: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-t`} className={`slide ${dark ? 'slide--dark bg-[#070B1F] text-[#F4F1E8]' : 'bg-[#F4F1E8] text-[#070B1F]'}`}>
    <header className={`slide__head ${dark ? 'slide__head--ink' : 'slide__head--paper'}`}>
      <div className="page-wrap slide__headin">
        <div className={`mono flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.18em] ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}><span className="whitespace-nowrap">{n} / 10</span><span className="h-px w-10 shrink-0 bg-current" aria-hidden="true" />{kicker}</div>
        <h2 id={`${id}-t`} className="display mt-4 max-w-[860px] text-[clamp(1.9rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-.06em]">{title}</h2>
        {summary ? <p className={`mt-5 max-w-[700px] text-base leading-7 ${dark ? 'text-[#e3eaff]' : 'text-[#183173]'}`}>{summary}</p> : null}
      </div>
    </header>
    <div className="page-wrap slide__body">{children}</div>
  </section>;
}

function Card({ label, title, children, dark = false }: { label: string; title: string; children: ReactNode; dark?: boolean }) {
  return <div className={`rounded-2xl border p-6 ${dark ? 'border-[#2B59FF]/40 bg-[#0d1536]' : 'border-[#070B1F]/15 bg-white/50'}`}>
    <span className={`mono text-[10px] font-bold uppercase tracking-[.14em] ${dark ? 'text-[#5F86FF]' : 'text-[#2B59FF]'}`}>{label}</span>
    <h3 className="display mt-3 text-xl font-extrabold leading-tight tracking-[-.04em]">{title}</h3>
    <p className={`mt-3 text-[15px] leading-7 ${dark ? 'text-[#c5d2f1]' : 'text-[#183173]'}`}>{children}</p>
  </div>;
}

const A = ({ href, children, dark = false }: { href: string; children: ReactNode; dark?: boolean }) => <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 font-bold underline underline-offset-4 ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}>{children}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>;
const Doc = ({ hash, children, dark = false }: { hash: string; children: ReactNode; dark?: boolean }) => <a href={`${DOC}#${hash}`} target="_blank" rel="noopener noreferrer" className={`tap inline-flex min-h-11 items-center gap-2 text-sm font-bold underline underline-offset-4 ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}>{children}<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>;

export function PitchPage() {
  useEffect(() => {
    let mounted = true;
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!mounted || !id) return;
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    const frame = requestAnimationFrame(scrollToHash);
    void document.fonts.ready.then(scrollToHash);
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (anchor?.closest('.pitch')) requestAnimationFrame(scrollToHash);
    };
    document.addEventListener('click', onAnchorClick);
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      document.removeEventListener('click', onAnchorClick);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, []);
  return <main className="pitch">
    <section className="cover relative overflow-hidden text-[#F4F1E8]">
      <div className="page-wrap relative pb-8 pt-8 sm:pb-12 sm:pt-14">
        <div className="cover__grid">
          <div className="cover__copy">
            <span className="cover__audience mono mb-5 block text-xs font-bold uppercase tracking-[.12em] text-[#F2B632]">Tecnologia de investimento com IA</span>
            <h1 className="pitch-rise display text-[clamp(1.65rem,3.3vw,2.65rem)] font-extrabold leading-[1.08] tracking-[-.05em]">Tecnologia de investimento para o apostador brasileiro, <span className="text-[#F2B632]">gerida por IA.</span></h1>
            <p className="pitch-rise mt-4 max-w-[740px] text-base leading-7 text-[#e3eaff]"><strong>Uma alternativa de investimento para o apostador brasileiro.</strong>{' '}A BETTEX reúne o capital em uma tesouraria com estratégias geridas por IA, limites de risco e supervisão humana. Com o token BETTEX, o investidor participa dessas estratégias sem escolher ou executar cada operação. Pelo aplicativo, o investidor acompanha saldo, resultados e custos. Quando há lucro elegível e as condições de distribuição são atendidas, a parcela do investidor é paga em USDC, conforme as regras de staking.{' '}<strong>A comunidade ajuda a determinar a evolução dos agentes de IA.</strong></p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#solucao" target="_blank" rel="noopener noreferrer" className="tap inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2B59FF] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1E44D6]">Conhecer a BETTEX</a>
              <a href={DOC} target="_blank" rel="noopener noreferrer" className="tap inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#F4F1E8]/70 px-6 py-2.5 text-sm font-bold hover:bg-[#F4F1E8] hover:text-[#070B1F]">Ler a documentação</a>
            </div>
          </div>
          <figure className="cover__fred pitch-rise">
            <a className="cover__photo-link" href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="Ver o LinkedIn de Fred Azevedo">
              <img src={`${BASE}/fred-azevedo.png`} alt="Retrato de Fred Azevedo, fundador da BETTEX" width={400} height={400} loading="eager" decoding="async" fetchPriority="high" />
            </a>
            <figcaption className="mono">
              <span><strong>Fred Azevedo</strong><small>Fundador da BETTEX</small></span>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="Ver o LinkedIn de Fred Azevedo">LinkedIn<ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" /></a>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section id="publico-alvo" aria-labelledby="publico-alvo-t" className="pitch-audience">
      <div className="page-wrap pitch-audience__layout">
        <div className="pitch-audience__identity">
          <p className="mono pitch-audience__kicker">Público da iniciativa</p>
          <h2 id="publico-alvo-t" className="display pitch-audience__title">O apostador brasileiro como público inicial.</h2>
          <p className="pitch-audience__statement">Foco em quem busca migrar das apostas para investimentos.</p>
        </div>
        <div className="pitch-audience__details">
          <div className="pitch-audience__detail">
            <h3 className="mono">Como o investidor participa</h3>
            <p>O investidor participa, via token, de uma tesouraria que realiza investimentos em mercados de risco com estratégias geridas por IA, sem selecionar ou executar cada operação.</p>
          </div>
          <div className="pitch-audience__detail">
            <h3 className="mono">Primeiros usuários</h3>
            <p>O mercado inicial é o Brasil. A estratégia de onboarding começa pela audiência e comunidade de{' '}<a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Fred Azevedo" className="inline-flex items-center gap-1 font-bold text-[#F2B632] underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B632]">Fred Azevedo<Instagram className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></a>, fundador do{' '}<a href="https://sosjogador.com.br" target="_blank" rel="noopener noreferrer" data-i18n="translated" className="font-bold text-[#F2B632] underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B632]">SOS Jogador</a>.</p>
          </div>
        </div>
      </div>
    </section>

    <ProblemSection />

    <FutureSections />

    <Sec id="solucao" summary="Empresa privada, ainda a constituir, com identidade econômica de fundo gerido por IA; quatro frentes planejadas, nenhuma garantida como ativa." n="03" kicker="Solução" title={<>Um fundo gerido por IA, aberto por token.</>}>
      <p className="max-w-[760px] text-[15px] leading-7 text-[#183173]">Uma empresa privada, ainda a constituir, com identidade econômica de fundo de investimento gerido por IA. Não é operadora de apostas nem intermediária. Quatro frentes planejadas, todas sujeitas a autorização e compatibilidade, nenhuma garantida como ativa.</p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Etapas de participação do investidor">
        {[
          ['Aquisição de BETTEX', 'O investidor adquire o token. O preço da venda pública primária vai integralmente à tesouraria; a tarifa de serviço é separada.'],
          ['Participação pelo staking', 'BETTEX disponível e tempo elegível no aplicativo oficial definem o peso de cada investidor.'],
          ['Acompanhamento da operação', 'O investidor consulta resultados, custos, alocações e registros de conciliação previstos no modelo.'],
          ['Distribuição em USDC', 'Quando a rodada diária atende às condições de lucro, reserva e liquidez, o investidor recebe a parcela correspondente ao peso elegível no pool dos stakers.'],
        ].map(([title, description], i) => <li key={title} className="rounded-2xl border border-[#070B1F]/15 bg-white/50 p-5">
          <span className="mono text-[11px] font-bold text-[#2B59FF]">0{i + 1}</span>
          <h3 className="display mt-3 text-xl font-extrabold leading-tight tracking-[-.04em]">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-[#183173]">{description}</p>
        </li>)}
      </ol>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {['Previsões', 'Ações e cripto', 'Esportes (surebet)', 'Cassinos (bônus)'].map((m, i) => <div key={m} className="rounded-2xl border border-[#070B1F]/15 p-5"><span className="mono text-[10px] font-bold text-[#2B59FF]">0{i + 1} / PLANEJADA</span><div className="display mt-3 text-lg font-extrabold leading-tight tracking-[-.04em]">{m}</div></div>)}
      </div>
      <div className="mt-8 rounded-2xl bg-[#070B1F] p-6 text-[#F4F1E8]">
        <span className="mono text-[10px] font-bold uppercase tracking-[.14em] text-[#F2B632]">Regra do lucro</span>
        <p className="mt-3 text-[15px] leading-7 text-[#c5d2f1]">Só há lucro elegível após custos reais, tributos, obrigações, avaliação das posições abertas, reservas e liquidez.</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {[['50%', 'Tesouraria', 'Retenção e reinvestimento.'], ['25%', 'Stakers', 'Pool global, rateado pelo peso elegível.'], ['25%', 'Carteira de recompra', 'USDC exclusivo para recompras autorizadas.']].map(([share, destination, explanation]) => <div key={destination} className="border-t border-[#5F86FF]/40 pt-4"><dt className="text-sm font-bold">{destination}</dt><dd className="display mt-2 text-4xl font-extrabold text-[#F2B632]">{share}</dd><dd className="mt-2 text-sm leading-6 text-[#c5d2f1]">{explanation}</dd></div>)}
        </dl>
        <p className="mt-5 text-sm leading-7 text-[#c5d2f1]">Exemplo ilustrativo: 10.000 USDC de lucro elegível destinam 5.000 à tesouraria, 2.500 ao pool global dos stakers e 2.500 à carteira de recompra. Os 25% não são uma taxa de retorno individual. Sem peso elegível ou condições de reserva e liquidez, não há split: 100% fica retido. Rodadas encerradas não acumulam direitos a lucros futuros.</p>
        <p className="mt-4 text-sm leading-7 text-[#c5d2f1]">A administração autoriza as recompras, preservando a multisig; não são compras diárias automáticas. O saldo exclusivo não utilizado acumula e não financia estratégias ou despesas. O destino dos tokens adquiridos permanece pendente. O token não é ação, não dá propriedade do patrimônio e não garante resgate.</p>
      </div>
      <Doc hash="documentacao-oportunidade">Ver regras na documentação</Doc>
    </Sec>

    <Sec id="diferencial" summary="O investidor participa dos resultados das estratégias, sem escolher cada operação ou depender apenas da revenda do token." n="04" kicker="Diferenciação proposta" dark title={<>A diferença está <span className="text-[#F2B632]">no direito econômico.</span></>}>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card dark label="Alternativa" title="Aposta individual">O resultado depende de cada aposta escolhida pelo usuário.</Card>
        <Card dark label="Alternativa" title="Token centrado no preço">O resultado depende da variação de preço e da possibilidade de revenda.</Card>
        <Card dark label="BETTEX" title="Participação nos resultados">O token combina participação condicionada no lucro elegível das estratégias e possibilidade de revenda, com risco de preço e liquidez.</Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card dark label="Direitos" title="Regras escritas antes">Os direitos e créditos ficam separados em contas distintas. Qualquer saída de BETTEX, mesmo parcial, cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado.</Card>
        <Card dark label="Custos" title="Bruto e líquido à vista">Tarifa fixa de serviço informada antes da operação, em USDC, sem taxa de performance.</Card>
        <Card dark label="Controle" title="Rastro e limites">Tesouraria separada do caixa operacional, com registros conciliáveis e condições antes de usar dinheiro real.</Card>
      </div>
      <p className="mt-6 max-w-[720px] text-sm leading-7 text-[#c5d2f1]">Nenhuma promessa de que a IA supere o mercado. Desempenho líquido contra uma referência é justamente o que o piloto precisa medir.</p>
    </Sec>

    <Sec id="fundador" summary="Aquisição founder-led, com audiência própria e experiência de distribuição." n="05" kicker="Fundador e distribuição" dark title={<>Experiência de aquisição <span className="text-[#F2B632]">e canais próprios.</span></>}>
      <FounderProfile dark portrait noDashes />
      <p className="mt-6 max-w-[760px] text-[15px] leading-7 text-[#c5d2f1]">Meta inicial: primeiros {g.launch.initialUsersGoal.toLocaleString('pt-BR')} usuários elegíveis e ativados no {g.launch.country}. A audiência dos canais se sobrepõe e não equivale a clientes; conversão e retenção da BETTEX serão medidas por coorte.</p>
      <Doc dark hash="documentacao-fundador">Apresentação na documentação</Doc>
    </Sec>

    <Sec id="economia" summary="Duas receitas separadas: tarifa fixa de US$ 2,50 em USDC e ganhos de investimento da tesouraria." n="06" kicker="Economia do negócio" title={<>O dinheiro da empresa <span className="text-[#2B59FF]">não se mistura ao da tesouraria.</span></>}>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card label="Venda pública primária" title="100% para a tesouraria">O preço dos tokens financia as estratégias. A venda não é lucro distribuível nem receita livre da empresa.</Card>
        <Card label="Aporte vinculado a tokens" title="50% / 50%">Metade financia o desenvolvimento inicial; metade vai para a tesouraria. É a regra para aportes vinculados aos tokens dos investidores, não para qualquer rodada societária.</Card>
        <Card label="Tarifas de serviço" title="100% para o caixa operacional">A tarifa de US$ 2,50 é receita bruta da empresa, antes de custos e tributos, fora do split do lucro da tesouraria.</Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card label="Operadora" title="Tarifa fixa de US$ 2,50 em USDC">Receita de serviço da empresa, em carteira operacional própria, fora da tesouraria e do split 50/25/25. Não é taxa de performance.</Card>
        <Card label="Tesouraria" title="Ganhos de investimento">Resultado das estratégias. O preço público primário do token vai integralmente à tesouraria; a tarifa é registrada à parte.</Card>
      </div>
      <div className="mt-6 rounded-2xl border border-[#070B1F]/15" role="region" aria-label="Exemplos de custo" tabIndex={0}>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#070B1F] text-[#F4F1E8]"><tr><th className="p-3">Movimentação</th><th className="p-3">Tarifa</th><th className="p-3">Resultado</th></tr></thead>
          <tbody className="text-[#183173]">
            {[['Saque de US$ 10', 'US$ 2,50', 'US$ 7,50 líquidos'], ['Saque de US$ 15', 'US$ 2,50', 'US$ 12,50 líquidos'], ['Compra de US$ 10', 'US$ 2,50 adicionais', 'US$ 12,50 desembolsados'], ['Compra de US$ 15', 'US$ 2,50 adicionais', 'US$ 17,50 desembolsados']].map((r) => <tr key={r[0]} className="border-t border-[#070B1F]/10">{r.map((c) => <td key={c} className="p-3">{c}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-[#183173]">Antes de custos externos de rede e conversão. Movimentos de US$ 10 ou 15 e saques frequentes são hipóteses do fundador, não ticket ou disposição medidos. O modelo financeiro ainda não foi recalibrado para tickets pequenos; volumes e CAC antigos não são dados observados.</p>
      <Doc hash="documentacao-plano-negocios">Plano-base de negócios na documentação</Doc>
    </Sec>

    <Sec id="token" n="07" kicker="Oferta e direitos do token" title={<>1 bilhão de BETTEX. <span className="text-[#2B59FF]">Três alocações.</span></>}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Público" title="65% · 650 milhões">Tokens destinados à venda pública, cujo preço primário financia integralmente a tesouraria.</Card>
        <Card label="Fundador" title="20% · 200 milhões">Livre destinação após a liberação, sem antecipação do vesting.</Card>
        <Card label="Investidores" title="15% · 150 milhões">Tokens vinculados ao financiamento inicial, conforme os termos da rodada.</Card>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card label="Liberação" title="Parcelas mensais durante 36 meses">Todas as alocações começam a liberar no mês da abertura da venda pública e terminam no mês 36. Liberação não significa venda realizada nem início dos investimentos.</Card>
        <Card label="Participação" title="Token disponível × tempo elegível">Tokens bloqueados, estoque público e valores indisponíveis ficam fora do rateio. A liberação de novos tokens pode alterar a participação individual; fundador e investidores seguem os mesmos critérios.</Card>
      </div>
      <p className="mt-6 max-w-[800px] text-[15px] leading-7 text-[#183173]">O titular tem os direitos de participação nos resultados definidos pelo token, não ações da empresa, propriedade da tesouraria, voto societário ou resgate pelo valor patrimonial. Pode ganhar ou perder na revenda, se houver liquidez. Oferta fixa não significa pagamento fixo.</p>
      <Doc hash="documentacao-emissao">Oferta, vesting e direitos na documentação</Doc>
    </Sec>

    <Sec id="piloto" summary="Demanda, estratégia e economia comercial: três validações antes da expansão." n="08" kicker="Proposta de piloto" title={<>O capital deve financiar <span className="text-[#2B59FF]">evidência.</span></>}>
      <ol className="grid gap-4 md:grid-cols-3">
        {[['Validar demanda', 'Medir intenção específica, compreensão dos direitos e disposição de pagar a tarifa nos tickets previstos.'], ['Validar produto e estratégia', 'Começar com dados autorizados e simulação em previsões. Medir o resultado após custos contra uma referência e validar o percurso do usuário e a conciliação.'], ['Validar a operação comercial', 'Após as validações jurídicas e de segurança, medir ativação, retenção D7/D30, receita de serviços e custo de operação em uma coorte limitada.']].map(([t, d], i) => <li key={t} className="rounded-2xl border border-[#070B1F]/15 p-6"><span className="display text-5xl font-extrabold text-[#2B59FF]">{i + 1}</span><h3 className="display mt-2 text-xl font-extrabold tracking-[-.04em]">{t}</h3><p className="mt-2 text-[15px] leading-7 text-[#183173]">{d}</p></li>)}
      </ol>
      <a href={`${BASE}/#roadmap`} target="_blank" rel="noopener noreferrer" className="tap mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#2B59FF] underline underline-offset-4">Ver o roadmap <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
    </Sec>

    <Sec id="publico" summary="Distribuição do fundador com consentimento e medição; taxas e custos ainda serão medidos." n="09" kicker="Aquisição, retenção e expansão" dark title={<>Primeiros 1.000 usuários no Brasil. <span className="text-[#F2B632]">Depois, expansão por evidência.</span></>}>
      <p className="max-w-[760px] text-[15px] leading-7 text-[#c5d2f1]">{g.launch.strategy} {g.media.status}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card dark label="Canais orgânicos" title="Telegram, Instagram, YouTube e X">{g.launch.channels.map(c => c.name).join(', ')}: conteúdo do fundador, perguntas e feedback, combinados com performance, marca e narrativa (US$ {g.media.paidAllocation.map(x => x.amountUsd.toLocaleString('pt-BR')).join(' / ')} por mês dentro de US$ {g.media.monthlyPaidMediaUsd.toLocaleString('pt-BR')} de mídia paga; proposta, não campanha executada).</Card>
        <Card dark label="Funil" title="Consentimento até coorte">{g.launch.funnel.join(' → ')}. Ativação medida no onboarding e retenção D7 e D30 por coorte; taxas ainda serão medidas.</Card>
        <Card dark label="Retenção honesta" title="Resultados, perdas, suporte e saída">Relatórios com resultados positivos, negativos ou sem lucro, suporte com prazos, atualizações com escolha de frequência e opt-out. Sem pressão para aportar, urgência artificial, saques frequentes como objetivo, pagamento garantido ou gamificação que force tarifas.</Card>
        <Card dark label="Candidatos" title="Colômbia, México e Peru">Afinidade regional, presença digital e economia agregada comparável (Banco Mundial, {g.expansion.comparisonYear}); não são mercados liberados. Antes de gastar: entrevistas locais, testes de mensagem e custo, suporte local e permissões de oferta, publicidade, estratégias e USDC. Não presumir que cultura e demanda sejam como as do Brasil.</Card>
      </div>
      <p className="mt-6 max-w-[760px] text-sm leading-7 text-[#c5d2f1]">US$ 12 por primeiro comprador é só a sensibilidade antiga do plano, não CAC medido nem alvo para os 1.000 usuários.</p>
      <Doc dark hash="documentacao-aquisicao-retencao">Detalhes: orçamento, retenção e países</Doc>
    </Sec>

    <Sec id="recursos" summary="Financiamento inicial para validar produto, estratégia e aquisição; valor e termos ainda em estruturação." n="10" kicker="Recursos e riscos" title={<>Financiar o produto <span className="text-[#2B59FF]">e a tesouraria inicial.</span></>}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card label="Regra vigente" title="Aportes ligados a investidores">50% para desenvolvimento inicial e 50% para a tesouraria. O preço público primário do token vai inteiro à tesouraria.</Card>
        <Card label="Em aberto" title="Valor total e termos">Orçamento e marcos do piloto não estão aprovados. Valor total e termos contratuais serão definidos. Não há oferta formal de venda de tokens nem participação societária proposta aqui.</Card>
      </div>
      <Doc hash="documentacao-financiamento-fundacao">Financiamento na documentação</Doc>
      <div id="riscos" className="pitch-risk-panel">
        <h3 className="display max-w-[800px] text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold leading-tight tracking-[-.04em]">Alto risco: pode haver perda parcial ou total.</h3>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {['Sem renda garantida; não substitui salário.', 'Parecer jurídico, permissões de provedores, contratos e segurança são necessários antes de qualquer fundo.', 'Frentes de esportes e cassinos dependem de compatibilidade regulatória e não estão todas autorizadas.', 'Demanda, desempenho da IA, custos e liquidez ainda não foram testados.'].map((r) => <li key={r} className="rounded-2xl border border-[#2B59FF]/40 bg-[#0d1536] p-5 text-[15px] leading-7 text-[#c5d2f1]">{r}</li>)}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={DOC} target="_blank" rel="noopener noreferrer" className="tap inline-flex min-h-12 items-center gap-2 rounded-full bg-[#F2B632] px-7 py-3.5 text-sm font-bold text-[#070B1F]">Ler a documentação completa <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          <a href={`${DOC}#documentacao-oportunidade`} target="_blank" rel="noopener noreferrer" className="tap inline-flex min-h-12 items-center rounded-full border-2 border-[#F4F1E8]/70 px-7 py-3.5 text-sm font-bold hover:bg-[#F4F1E8] hover:text-[#070B1F]">Ver a pesquisa</a>
        </div>
      </div>
    </Sec>
  </main>;
}
export default PitchPage;
