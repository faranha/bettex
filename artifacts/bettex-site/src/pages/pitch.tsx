import { useEffect, type ReactNode } from 'react';
import { ArrowRight, CircuitBoard, ExternalLink, ReceiptText, Landmark } from 'lucide-react';
import g from '@/lib/growth-strategy.json';
import { FounderProfile } from '@/components/FounderProfile';
import { TechnologyNetworks } from '@/components/technology/TechnologyNetworks';
import { ProblemSection } from '@/components/pitch/ProblemSection';
import { AudienceSection } from '@/components/pitch/AudienceSection';
import { FutureSections } from '@/components/pitch/FutureSections';
import { EconomicComparison } from '@/components/pitch/EconomicComparison';
import { economicComparisonRows } from '@/components/pitch/EconomicComparisonRows';
import { PitchTokenCharts } from '@/components/pitch/PitchTokenCharts';
import { TokenValueMechanisms } from '@/components/pitch/TokenValueMechanisms';
import { FounderLaunchFunnel } from '@/components/pitch/FounderLaunchFunnel';
import { RoadmapSection } from '@/components/RoadmapSection';
import { DemoAppLink } from '@/components/DemoAppLink';
import { SolutionParticipationFlow } from '@/components/pitch/SolutionParticipationFlow';
import { PitchObservations } from '@/components/pitch/PitchObservations';
import { ChapterHero } from '@/components/pitch/ChapterHero';
import { PitchEditorialImage, PitchEditorialSplit } from '@/components/pitch/PitchEditorialImage';
import { formatCryptoDailyBillions } from '@/components/pitch/marketFlow';
import { PitchProductResources } from '@/components/pitch/PitchProductResources';
import { t, useLocale } from '@/lib/i18n';
import './pitch.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;

function Sec({ id, n, kicker, title, dark = false, summary, hero, children }: { id: string; n?: string; kicker: string; title: ReactNode; dark?: boolean; summary?: string; hero?: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-t`} className={`slide ${dark ? 'slide--dark bg-[#070B1F] text-[#F4F1E8]' : 'bg-[#F4F1E8] text-[#070B1F]'}`}>
    {hero && n ? <ChapterHero id={id} n={n} kicker={kicker} title={title} summary={summary ?? ''} src={hero} tone={id === 'solucao' ? 'blue' : 'ink'} /> : <header className={`slide__head ${dark ? 'slide__head--ink' : 'slide__head--paper'}`}>
      <div className="page-wrap slide__headin">
        <div className={`mono flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.18em] ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}><span className="h-px w-10 shrink-0 bg-current" aria-hidden="true" />{kicker}</div>
        <h3 id={`${id}-t`} className="display mt-4 max-w-[860px] text-[clamp(1.9rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-.06em]">{title}</h3>
        {summary ? <p className={`mt-5 max-w-[700px] text-base leading-7 ${dark ? 'text-[#e3eaff]' : 'text-[#183173]'}`}>{summary}</p> : null}
      </div>
    </header>}
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
const Doc = ({ hash, children, dark = false }: { hash: string; children: ReactNode; dark?: boolean }) => <a href={`${DOC}#${hash}`} className={`tap inline-flex min-h-11 items-center gap-2 text-sm font-bold underline underline-offset-4 ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}>{children}<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>;

export function PitchPage() {
  useLocale();
  const cryptoDailyBillions = formatCryptoDailyBillions();
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
    <section id="visao" aria-label="Início" className="cover relative overflow-hidden text-[#F4F1E8]">
      <div className="page-wrap relative pb-8 pt-8 sm:pb-12 sm:pt-14">
        <div className="cover__grid">
          <div className="cover__copy">
            <span className="cover__audience mono mb-5 block text-xs font-bold uppercase tracking-[.12em] text-[#F2B632]">Início</span>
            <h1 className="pitch-rise display text-[clamp(1.65rem,3.3vw,2.65rem)] font-extrabold leading-[1.08] tracking-[-.05em]">Tecnologia de investimento para o apostador brasileiro, <span className="text-[#F2B632]">gerida por IA.</span></h1>
            <p className="pitch-rise cover__market mt-4"><strong data-i18n="translated">{t(`Mais de 60 milhões de brasileiros formam o público potencial estimado, enquanto o mercado de cripto movimenta cerca de R$ ${cryptoDailyBillions} bilhão em operações diárias e as bets têm uma referência histórica de R$ 600 milhões em depósitos por dia.`)}</strong>{' '}A oportunidade é oferecer um produto de investimento que fale a língua dessas pessoas.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#solucao" className="tap inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2B59FF] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1E44D6]">Conhecer a BETTEX</a>
              <a href={DOC} className="tap inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#F4F1E8]/70 px-6 py-2.5 text-sm font-bold hover:bg-[#F4F1E8] hover:text-[#070B1F]">Ler a documentação</a>
            </div>
          </div>
          <figure className="cover__project pitch-rise">
            <img src={`${BASE}/pitch-illustrations/pitch-software-development.webp`} alt="Ilustração de tecnologia e desenvolvimento do projeto BETTEX" width={400} height={400} loading="eager" decoding="async" fetchPriority="high" />
            <figcaption className="mono">
              <span><strong>BETTEX</strong><small>Tecnologia, comunidade e inteligência artificial</small></span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <TechnologyNetworks />

    <AudienceSection />
    <ProblemSection />

    <FutureSections />

    <Sec id="solucao" hero="pitch-illustrations/pitch-product-development.webp" summary="Produto de tecnologia com IA, descentralizado desde a origem. Quatro frentes de atuação." n="05" kicker="Solução" title={<>IA na operação, participação por token.</>}>
      <p className="mb-8 max-w-[800px] text-[15px] leading-7">A BETTEX nasce como projeto descentralizado. A constituição de uma entidade e sua formalização institucional não são prioridades imediatas, não estão previstas para o curto prazo e não têm data definida. A operação será limitada aos mercados onde a atividade for permitida, com as autorizações exigidas quando aplicáveis.</p>
      <p className="mb-8 max-w-[900px] text-base leading-7 text-[#183173]">A oportunidade da BETTEX é oferecer a esses públicos um produto de investimento com experiência familiar, linguagem acessível e estratégias geridas por IA. O objetivo é redirecionar a busca por retorno financeiro das apostas para a participação em resultados de investimentos em mercados de risco.</p>
      <div className="fu-position">
        <span className="fu-signal-icon fu-position-icon"><CircuitBoard aria-hidden="true" /></span>
        <p className="display fu-pos-lead">Resgatar o futuro, transformando a aposta em investimento.</p>
      </div>
      <SolutionParticipationFlow />
       <PitchProductResources />
      <div className="mt-8 rounded-2xl bg-[#070B1F] p-6 text-[#F4F1E8]">
        <span className="mono text-[10px] font-bold uppercase tracking-[.14em] text-[#F2B632]">Regra do lucro</span>
        <p className="mt-3 text-[15px] leading-7 text-[#c5d2f1]">Só há lucro elegível após custos reais, tributos, obrigações, avaliação das posições abertas, reservas e liquidez.</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {[['50%', 'Tesouraria', 'Retenção e reinvestimento.'], ['25%', 'Stakers', 'Pool global, rateado pelo peso elegível.'], ['25%', 'Carteira de recompra', 'USDC exclusivo para recompras autorizadas.']].map(([share, destination, explanation]) => <div key={destination} className="border-t border-[#5F86FF]/40 pt-4"><dt className="text-sm font-bold">{destination}</dt><dd className="display mt-2 text-4xl font-extrabold text-[#F2B632]">{share}</dd><dd className="mt-2 text-sm leading-6 text-[#c5d2f1]">{explanation}</dd></div>)}
        </dl>
        <p className="mt-5 text-sm leading-7 text-[#c5d2f1]">
          <span>Exemplo ilustrativo: 10.000 USDC de lucro elegível destinam 5.000 à tesouraria, 2.500 ao pool global dos stakers e 2.500 à carteira de recompra. Os 25% não são uma taxa de retorno individual. Sem peso elegível ou condições de reserva e liquidez, não há split: 100% fica retido. Rodadas encerradas não acumulam direitos a lucros futuros.</span>{' '}
          <span>A administração autoriza as recompras, preservando a multisig; não são compras diárias automáticas. O saldo exclusivo não utilizado acumula e não financia estratégias ou despesas. Todos os tokens adquiridos nas recompras são queimados permanentemente. O token não é ação, não dá propriedade do patrimônio e não garante resgate.</span>
        </p>
      </div>
      <Doc hash="documentacao-oportunidade">Ver regras na documentação</Doc>

    <Sec id="diferencial" summary="O usuário participa dos resultados do projeto, sem escolher cada operação ou depender apenas da revenda do token." kicker="Diferenciação proposta" title={<>A diferença está <span className="text-[#2B59FF]">no direito econômico.</span></>}>
      <EconomicComparison rows={economicComparisonRows} />
      <PitchObservations>
        <p>Custos, direitos e regras das alternativas variam conforme a plataforma e o contrato.</p>
        <p>Nenhuma promessa de que a IA supere o mercado. O desempenho líquido das estratégias precisa ser medido contra uma referência.</p>
      </PitchObservations>
    </Sec>
    </Sec>

    <Sec id="fundador" hero="pitch-illustrations/pitch-startup-team.webp" summary="Experiência no lançamento e na administração de operações, com IA e serviços externos especializados." n="06" kicker="Fundador" dark title={<>Experiência internacional. <span className="text-[#F2B632]">Fundador à frente da BETTEX.</span></>}>
      <FounderProfile dark portrait noDashes thirdPerson />
      <div className="mt-6">
        <Card dark label="Alinhamento do fundador" title="Sem salário. Sem retiradas da empresa.">{g.founder.bettexEarnings}</Card>
      </div>
      <Doc dark hash="documentacao-fundador">Apresentação na documentação</Doc>
    </Sec>

    <section id="tokenomics" aria-labelledby="economia-t">
    <Sec id="economia" hero="pitch-illustrations/pitch-token-participation.webp" summary="Financiamento e sustentabilidade operacional separados dos resultados da tesouraria." n="07" kicker="Tokenomics" title={<>Tokenomics.<br /><span className="text-[#2B59FF]">Receitas, tesouraria e direitos do token.</span></>}>
      <h3 className="display mb-6 text-2xl font-extrabold">O dinheiro da empresa não se mistura ao da tesouraria.</h3>
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card label="Mint público inicial" title="Financiamento do projeto">Mint aberto a preço fixo, separado da comunidade em vesting. Aplicação dos recursos e custos da oferta devem ser documentados antes da abertura.</Card>
        <Card label="Comunidade em vesting" title="100% para a tesouraria">O preço dos tokens da comunidade já liberados financia a tesouraria. A venda não é lucro distribuível; o mint inicial fica separado.</Card>
        <Card label="Investidores-anjo" title="100% para produto, tecnologia e marketing">{g.launch.angelFundingUse}</Card>
        <Card label="Sustentabilidade operacional" title="Decisão com a comunidade">No ALFA, serão cobradas apenas taxas de rede. A decisão de cobrar ou não uma contribuição por serviços será tomada posteriormente com a comunidade, como possível alternativa para sustentar as operações. Não há valor fixado nem adoção confirmada.</Card>
      </div>
      <div className="pitch-revenue">
        <article className="pitch-revenue__item">
          <div className="pitch-revenue__icon" aria-hidden="true"><ReceiptText size={36} strokeWidth={1.6} /></div>
          <div className="pitch-revenue__copy">
            <p className="mono text-[10px] font-bold uppercase tracking-[.14em] text-[#2B59FF]">Operadora</p>
            <h3 className="display">Sustentabilidade operacional</h3>
            <p>No ALFA, apenas taxas de rede. Uma contribuição por serviços será decidida posteriormente com a comunidade e, se adotada, ficará fora da tesouraria e do split 50/25/25.</p>
          </div>
        </article>
        <article className="pitch-revenue__item pitch-revenue__item--treasury">
          <div className="pitch-revenue__icon" aria-hidden="true"><Landmark size={36} strokeWidth={1.6} /></div>
          <div className="pitch-revenue__copy">
            <p className="mono text-[10px] font-bold uppercase tracking-[.14em] text-[#2B59FF]">Tesouraria</p>
            <h3 className="display">Ganhos de investimento</h3>
            <p>Resultado das estratégias. O preço dos tokens da comunidade já liberados vai à tesouraria; o mint inicial financia o projeto. Recursos operacionais são registrados à parte.</p>
          </div>
        </article>
      </div>
      <PitchObservations><p>A decisão de cobrar ou não por serviços será tomada posteriormente com a comunidade e depende de validação jurídica e comercial. Condições e valores deverão ser informados antes de eventual adoção. No ALFA, serão cobradas apenas taxas de rede.</p></PitchObservations>
    </Sec>

    <Sec id="token" kicker="Oferta, vesting e direitos do token" dark title={<>1 bilhão de BETTEX. <span className="text-[#F2B632]">Quatro destinações.</span></>}>
      <PitchTokenCharts />
      <TokenValueMechanisms />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card dark label="Mint público inicial" title="10% · 100 milhões">Mint aberto a qualquer pessoa, a preço fixo, para financiar o projeto. Execução própria ou por launchpad parceiro, sujeita à adequação legal da oferta.</Card>
        <Card dark label="Comunidade" title="55% · 550 milhões">Destinação posterior em vesting de 24 meses, separada dos 10% do mint inicial.</Card>
        <Card dark label="Fundador e equipe" title="20% · 200 milhões">Livre destinação após a liberação, sem antecipação do vesting.</Card>
        <Card dark label="Investidores" title="15% · 150 milhões">Tokens para investidores, sujeitos ao vesting de 24 meses. Aportes e liberação de tokens seguem condições distintas.</Card>
      </div>
      <div className="mt-8" />
      <PitchEditorialSplit dark side="right" image={<PitchEditorialImage dark name="pitch-token-participation" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card dark label="Liberação" title="Parcelas mensais durante 24 meses">Vesting dos 90% posteriores a partir de março de 2027: comunidade 55%, fundador/equipe 20% e investidores 15%. O mint inicial fica separado. Liberação não comprova venda ou circulação.</Card>
        <Card dark label="Participação" title="Elegibilidade na abertura da rodada">Quem entra durante a rodada recebe zero nela e espera a próxima, inclusive para lucros gerados depois da entrada. Tokens bloqueados, estoque público e valores indisponíveis ficam fora do rateio. Fundador e demais usuários seguem os mesmos critérios.</Card>
      </div>
      </PitchEditorialSplit>
      <p className="mt-6 max-w-[800px] text-[15px] leading-7 text-[#c5d2f1]">O titular tem os direitos de participação nos resultados definidos pelo token, não ações da empresa, propriedade da tesouraria, voto societário ou resgate pelo valor patrimonial. Pode ganhar ou perder na revenda, se houver liquidez. Oferta fixa não significa pagamento fixo.</p>
      <Doc dark hash="documentacao-emissao">Oferta, vesting e direitos na documentação</Doc>
    </Sec>
    </section>

    <RoadmapSection id="pitch-roadmap" />

    <Sec id="publico" hero="pitch-illustrations/pitch-brazil-community.webp" summary="Comunidade antes do mint público de dezembro de 2026; sistema/ALFA e vesting previstos para março de 2027, sujeitos à adequação jurídica." n="08" kicker="Fase atual e próximos passos" dark title={<>Preparação. <span className="text-[#F2B632]">Comunidade e mint.</span></>}>
      <aside className="pitch-validation-status" data-testid="pitch-current-phase" aria-label="Fase atual do projeto">
        <DemoAppLink className="mono">DEMO VISUAL DISPONÍVEL</DemoAppLink>
        <strong>Comunidade antes do lançamento</strong>
        <p>O demo apresenta a interface com dados ilustrativos, sem dinheiro real ou execução de operações. O mint público está previsto para 10 de dezembro de 2026; sistema/ALFA, captação de investidores e início do vesting, para março de 2027. BETA e go to market vêm depois do ALFA, com data a definir. Cada lançamento depende de adequação legal por atividade e território.</p>
        <DemoAppLink data-testid="pitch-open-alpha-demo" />
      </aside>
      <p className="mb-8 max-w-[800px] text-[15px] leading-7 text-[#c5d2f1]">A promoção para a comunidade precede o mint inicial, cuja receita financia o projeto. A abertura pode começar com baixa captação, sem reduzir automaticamente o preço fixo nem exigir a venda de todo o teto. Preço, janela, plataforma e destino da parcela não mintada ainda serão definidos.</p>
      <FounderLaunchFunnel />
      {/* Launch simulation intentionally unpublished; its component is retained for future reactivation. */}
      <div className="pitch-community" id="pitch-community">
        <div className="pitch-community__copy">
          <p className="mono text-[11px] font-bold uppercase tracking-[.18em] text-[#5F86FF]">Community-driven</p>
          <h3 className="display">Construído com a comunidade.</h3>
          <p>A proposta é construir com os usuários: ouvir feedback, validar melhorias e estimular recomendações orgânicas. A comunidade no Telegram reúne dúvidas e feedback para orientar a evolução do produto.</p>
        </div>
        <img src={`${BASE}/pitch-illustrations/pitch-community-people-cutout.webp`} alt={t('Pessoas sorrindo e interagindo com notebook, tablet e celular, em um recorte sem fundo com elementos tecnológicos')} width={1021} height={886} loading="lazy" decoding="async" />
      </div>
      <PitchObservations dark><p>A validação acompanha a primeira compra elegível, o primeiro uso útil e o retorno dos usuários. Compradores e usuários ativados serão medidos separadamente; a meta não representa resultados já alcançados. Oferta e publicidade dependem de revisão jurídica e elegibilidade.</p></PitchObservations>
    </Sec>

    <Sec id="recursos" hero="pitch-illustrations/pitch-product-development.webp" summary="Capital para construir o produto e desenvolver o mercado, não para remunerar o fundador ou financiar uma folha salarial." n="09" kicker="Recursos e riscos" title={<>100% do aporte anjo. <span className="text-[#2B59FF]">Produto, tecnologia e marketing.</span></>}>
      <PitchEditorialSplit image={<PitchEditorialImage name="pitch-product-development" />}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Destino do capital" title="Tecnologia e marketing, sem salários">{g.launch.angelFundingUse}</Card>
        <Card label="Alinhamento do fundador" title="Ganhos somente com seus tokens">{g.founder.bettexEarnings}</Card>
        <Card label="Em aberto" title="Valor total e termos">Orçamento e marcos do lançamento ainda serão definidos, assim como o valor total e os termos contratuais. Não há oferta formal de venda de tokens nem participação societária proposta aqui.</Card>
      </div>
      </PitchEditorialSplit>
      <Doc hash="documentacao-financiamento-fundacao">Financiamento na documentação</Doc>
    </Sec>
  </main>;
}
export default PitchPage;
