import { useEffect, type ReactNode } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import g from '@/lib/growth-strategy.json';
import thesis from '@/lib/new-economy-thesis.json';
import { FounderProfile } from '@/components/FounderProfile';
import './pitch.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;
const ANBIMA = 'https://www.anbima.com.br/data/files/BE/05/B0/55/1EABD91008E6DAD9F82BA2A8/Raio-X-do-Investidor-9-edicao.pdf';
const ILO = 'https://www.ilo.org/sites/default/files/2025-05/Research%20brief_GenAI%202025%20Update.pdf';

const MEDIA = `${BASE}/pitch-media`;
const PHOTO = { casino: `${MEDIA}/casino-roulette.jpg`, markets: `${MEDIA}/investment-markets.jpg` };
function Sec({ id, n, kicker, title, dark = false, summary, photo, children }: { id: string; n: string; kicker: string; title: ReactNode; dark?: boolean; summary?: string; photo?: 'casino' | 'markets'; children: ReactNode }) {
  const head = photo || dark;
  return <section id={id} aria-labelledby={`${id}-t`} className={`slide ${dark ? 'slide--dark bg-[#070B1F] text-[#F4F1E8]' : 'bg-[#F4F1E8] text-[#070B1F]'}`}>
    <header className={`slide__head ${photo ? `slide__head--photo slide__head--${photo}` : ''} ${head ? 'slide__head--ink' : 'slide__head--paper'}`} style={photo ? { backgroundImage: `url(${PHOTO[photo]})` } : undefined}>
      <span className="slide__num display" aria-hidden="true">{n}</span>
      <div className="page-wrap slide__headin">
        <div className={`mono flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.18em] ${head ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}><span>{n} / 13</span><span className="h-px w-10 bg-current" aria-hidden="true" />{kicker}</div>
        <h2 id={`${id}-t`} className="display mt-4 max-w-[860px] text-[clamp(1.9rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-.06em]">{title}</h2>
        {summary ? <p className={`mt-5 max-w-[700px] text-base leading-7 ${head ? 'text-[#e3eaff]' : 'text-[#183173]'}`}>{summary}</p> : null}
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
const Doc = ({ hash, children, dark = false }: { hash: string; children: ReactNode; dark?: boolean }) => <a href={`${DOC}#${hash}`} className={`tap inline-flex min-h-11 items-center gap-2 text-sm font-bold underline underline-offset-4 ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}>{children}<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>;

const index = [['problema', 'Problema'], ['agora', 'Por que agora'], ['solucao', 'Solução'], ['diferencial', 'Diferencial'], ['fundador', 'Fundador'], ['economia', 'Economia'], ['token', 'Token'], ['estagio', 'Estágio'], ['piloto', 'Piloto'], ['publico', 'Aquisição'], ['recursos', 'Recursos'], ['riscos', 'Riscos'], ['fontes', 'Fontes']];

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
    <section className="cover relative overflow-hidden text-[#F4F1E8]" style={{ backgroundImage: `url(${PHOTO.casino})` }}>
      <div className="cover__shade absolute inset-0" aria-hidden="true" />
      <div className="page-wrap relative pb-8 pt-8 sm:pb-12 sm:pt-14">
        <div className="cover__grid">
          <div className="cover__copy">
            <h1 className="pitch-rise display text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-.06em]">Um fundo de investimentos gerido por IA. <span className="text-[#F2B632]">Participação nos lucros por token.</span></h1>
            <p className="pitch-rise mt-4 max-w-[520px] text-base leading-7 text-[#e3eaff]">A BETTEX reúne capital em uma tesouraria de estratégias geridas por IA. O token permite participar do lucro elegível em USDC, conforme as regras de staking, sem operar cada investimento por conta própria.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#solucao" className="tap inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2B59FF] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1E44D6]">Conhecer a BETTEX</a>
              <a href={DOC} className="tap inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#F4F1E8]/70 px-6 py-2.5 text-sm font-bold hover:bg-[#F4F1E8] hover:text-[#070B1F]">Ler a documentação</a>
            </div>
          </div>
          <figure className="cover__fred pitch-rise">
            <img src={`${BASE}/fred-azevedo.png`} alt="Retrato de Fred Azevedo, fundador da BETTEX" width={400} height={400} loading="eager" decoding="async" fetchPriority="high" />
            <figcaption className="mono">Fred Azevedo</figcaption>
          </figure>
          <div className="cover__markets" style={{ backgroundImage: `url(${PHOTO.markets})` }} role="presentation" aria-hidden="true" />
        </div>
        <nav id="pitch-index" className="pitch-index" data-testid="pitch-index" aria-label="Seções do pitch">
          <div className="pitch-index__links">
              {index.map(([id, label], i) => <a key={id} href={`#${id}`}>
                <span className="pitch-index__number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span>{label}</span>
              </a>)}
          </div>
        </nav>
      </div>
    </section>

    <Sec photo="casino" id="problema" summary="Hipótese de oportunidade a partir de pesquisa com público brasileiro; não comprova demanda pelo produto nem promete recuperar perdas." n="01" kicker="Problema e oportunidade" title={<>O problema: <span className="text-[#2B59FF]">perder o emprego e a renda.</span></>}>
      <p className="mb-6 max-w-[800px] text-[15px] leading-7 text-[#183173]">{thesis.exclusion}</p>
      <div className="pitch-metrics grid gap-4 md:grid-cols-3">
        {[['17%', 'apostaram online em 2025'], ['39%', 'dos apostadores buscavam dinheiro rápido em caso de necessidade'], ['20%', 'dos apostadores viam apostas como investir ou juntar dinheiro']].map(([v, t]) => <div key={v} className="rounded-2xl bg-[#070B1F] p-6 text-[#F4F1E8]"><div className="display text-6xl font-extrabold tracking-[-.07em] text-[#F2B632]">{v}</div><p className="mt-3 text-sm leading-6 text-[#c5d2f1]">{t}</p></div>)}
      </div>
      <p className="mt-6 max-w-[760px] text-[15px] leading-7 text-[#183173]">Fonte: <A href={ANBIMA}>ANBIMA/Datafolha, Raio X do Investidor, 9ª edição (2026)</A>: 5.832 entrevistas com pessoas de 16 anos ou mais, coletadas em novembro de 2025. Os números descrevem motivações declaradas. Não são retorno de apostas nem demanda medida pela BETTEX.</p>
      <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-[#183173]">A oportunidade é uma hipótese: uma experiência financeira compreensível, com custos e riscos à vista. O projeto não mira pessoas em dificuldade e não promete recuperar perdas de apostas.</p>
      <Doc hash="documentacao-oportunidade">Pesquisa completa na documentação</Doc>
    </Sec>

    <Sec photo="markets" id="agora" summary="O impacto da IA no trabalho e o acesso aos resultados da economia programável." n="02" kicker="Por que agora" dark title={<>{thesis.statement} <span className="text-[#F2B632]">{thesis.question}</span></>}>
      <p className="mb-5 max-w-[800px] text-[15px] leading-7 text-[#c5d2f1]">{thesis.vision}</p>
      <p className="mb-7 max-w-[800px] text-[15px] leading-7 text-[#c5d2f1]">{thesis.exclusion}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card dark label="Evidência" title="Um em cada quatro empregos tem alguma exposição">Em maio de 2025, a OIT estimou que cerca de um quarto dos empregos no mundo tem algum grau de exposição à IA generativa. Exposição não é previsão de demissões; transformação de tarefas é mais provável que substituição integral. <A dark href={ILO}>OIT, maio de 2025</A>.</Card>
        <Card dark label="Tese" title="Participação, não proteção garantida">A BETTEX propõe acesso a estratégias geridas por IA e participação condicionada em lucros elegíveis. Não substitui salário, qualificação ou proteção social, e não é carteira de ações de empresas de IA.</Card>
      </div>
      <p className="mt-5 max-w-[800px] text-sm leading-7 text-[#c5d2f1]">{thesis.teslaExample} <A dark href={thesis.teslaSource}>Tesla, Master Plan Part IV</A>.</p>
      <Doc dark hash="documentacao-tese-ia">Tese e evidências na documentação</Doc>
    </Sec>

    <Sec photo="markets" id="solucao" summary="Empresa privada, ainda a constituir, com identidade econômica de fundo gerido por IA; quatro frentes planejadas, nenhuma garantida como ativa." n="03" kicker="Solução" title={<>Um fundo gerido por IA, aberto por token.</>}>
      <p className="max-w-[760px] text-[15px] leading-7 text-[#183173]">Uma empresa privada, ainda a constituir, com identidade econômica de fundo de investimento gerido por IA. Não é operadora de apostas nem intermediária. Quatro frentes planejadas, todas sujeitas a autorização e compatibilidade, nenhuma garantida como ativa.</p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Como o cliente participa">
        {[
          ['Compra BETTEX', 'O preço da venda pública primária vai integralmente à tesouraria; a tarifa de serviço é separada.'],
          ['Participa pelo staking', 'BETTEX disponível e tempo elegível no aplicativo oficial definem o peso de cada participante.'],
          ['Acompanha a operação', 'Consulta resultados, custos, alocações e registros de conciliação previstos no modelo.'],
          ['Recebe em USDC', 'Quando a rodada diária atende às condições de lucro, reserva e liquidez, recebe sua parcela do pool dos stakers.'],
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

    <Sec photo="casino" id="diferencial" summary="O cliente participa do resultado da estratégia, sem escolher cada aposta ou depender apenas da revenda do token." n="04" kicker="Diferenciação proposta" dark title={<>A diferença está <span className="text-[#F2B632]">no direito econômico.</span></>}>
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

    <Sec photo="markets" id="fundador" summary="Aquisição founder-led, com audiência própria e experiência de distribuição." n="05" kicker="Fundador e distribuição" dark title={<>Experiência de aquisição <span className="text-[#F2B632]">e canais próprios.</span></>}>
      <FounderProfile dark portrait />
      <p className="mt-6 max-w-[760px] text-[15px] leading-7 text-[#c5d2f1]">Meta inicial: primeiros {g.launch.initialUsersGoal.toLocaleString('pt-BR')} usuários elegíveis e ativados no {g.launch.country}. A audiência dos canais se sobrepõe e não equivale a clientes; conversão e retenção da BETTEX serão medidas por coorte.</p>
      <Doc dark hash="documentacao-fundador">Apresentação na documentação</Doc>
    </Sec>

    <Sec photo="casino" id="economia" summary="Duas receitas separadas: tarifa fixa de US$ 2,50 em USDC e ganhos de investimento da tesouraria." n="06" kicker="Economia do negócio" title={<>O dinheiro da empresa <span className="text-[#2B59FF]">não se mistura ao da tesouraria.</span></>}>
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

    <Sec id="estagio" summary="Equipe, constituição da empresa e validação da operação." n="08" kicker="Estágio atual" dark title={<>Estrutura operacional.</>}>
      <div className="grid gap-4">
        <Card dark label="Próximas validações" title="Do projeto à operação">Validar demanda, desempenho e receita. Constituição da empresa e contratações fazem parte do plano: 6 funções em 5 pessoas, com 4 posições remuneradas. O fundador não recebe salário, conforme a regra documentada.</Card>
      </div>
    </Sec>

    <Sec photo="markets" id="piloto" summary="Demanda, estratégia e economia comercial: três validações antes da expansão." n="09" kicker="Proposta de piloto" title={<>O capital deve financiar <span className="text-[#2B59FF]">evidência.</span></>}>
      <ol className="grid gap-4 md:grid-cols-3">
        {[['Validar demanda', 'Medir intenção específica, compreensão dos direitos e disposição de pagar a tarifa nos tickets previstos.'], ['Validar produto e estratégia', 'Começar com dados autorizados e simulação em previsões. Medir o resultado após custos contra uma referência e validar o percurso do usuário e a conciliação.'], ['Validar a operação comercial', 'Após as validações jurídicas e de segurança, medir ativação, retenção D7/D30, receita de serviços e custo de operação em uma coorte limitada.']].map(([t, d], i) => <li key={t} className="rounded-2xl border border-[#070B1F]/15 p-6"><span className="display text-5xl font-extrabold text-[#2B59FF]">{i + 1}</span><h3 className="display mt-2 text-xl font-extrabold tracking-[-.04em]">{t}</h3><p className="mt-2 text-[15px] leading-7 text-[#183173]">{d}</p></li>)}
      </ol>
      <a href={`${BASE}/#roadmap`} className="tap mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#2B59FF] underline underline-offset-4">Ver o roadmap <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
    </Sec>

    <Sec photo="casino" id="publico" summary="Distribuição do fundador com consentimento e medição; taxas e custos ainda serão medidos." n="10" kicker="Aquisição, retenção e expansão" dark title={<>Primeiros 1.000 usuários no Brasil. <span className="text-[#F2B632]">Depois, expansão por evidência.</span></>}>
      <p className="max-w-[760px] text-[15px] leading-7 text-[#c5d2f1]">{g.launch.strategy} {g.media.status}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card dark label="Canais orgânicos" title="Comunidade, Instagram, YouTube e X">{g.launch.channels.map(c => c.name).join(', ')}: conteúdo do fundador, perguntas e feedback, combinados com performance, marca e narrativa (US$ {g.media.paidAllocation.map(x => x.amountUsd.toLocaleString('pt-BR')).join(' / ')} por mês dentro de US$ {g.media.monthlyPaidMediaUsd.toLocaleString('pt-BR')} de mídia paga; proposta, não campanha executada).</Card>
        <Card dark label="Funil" title="Consentimento até coorte">{g.launch.funnel.join(' → ')}. Ativação medida no onboarding e retenção D7 e D30 por coorte; taxas ainda serão medidas.</Card>
        <Card dark label="Retenção honesta" title="Resultados, perdas, suporte e saída">Relatórios com resultados positivos, negativos ou sem lucro, suporte com prazos, atualizações com escolha de frequência e opt-out. Sem pressão para aportar, urgência artificial, saques frequentes como objetivo, pagamento garantido ou gamificação que force tarifas.</Card>
        <Card dark label="Candidatos" title="Colômbia, México e Peru">Afinidade regional, presença digital e economia agregada comparável (Banco Mundial, {g.expansion.comparisonYear}); não são mercados liberados. Antes de gastar: entrevistas locais, testes de mensagem e custo, suporte local e permissões de oferta, publicidade, estratégias e USDC. Não presumir que cultura e demanda sejam como as do Brasil.</Card>
      </div>
      <p className="mt-6 max-w-[760px] text-sm leading-7 text-[#c5d2f1]">US$ 12 por primeiro comprador é só a sensibilidade antiga do plano, não CAC medido nem alvo para os 1.000 usuários.</p>
      <Doc dark hash="documentacao-aquisicao-retencao">Detalhes: orçamento, retenção e países</Doc>
    </Sec>

    <Sec id="recursos" summary="Financiamento inicial para validar produto, estratégia e aquisição; valor e termos ainda em estruturação." n="11" kicker="Uso dos recursos e marcos" title={<>Financiar o produto <span className="text-[#2B59FF]">e a tesouraria inicial.</span></>}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card label="Regra vigente" title="Aportes ligados a investidores">50% para desenvolvimento inicial e 50% para a tesouraria. O preço público primário do token vai inteiro à tesouraria.</Card>
        <Card label="Em aberto" title="Valor total e termos">Orçamento e marcos do piloto não estão aprovados. Valor total e termos contratuais serão definidos. Não há oferta formal de venda de tokens nem participação societária proposta aqui.</Card>
      </div>
      <Doc hash="documentacao-financiamento-fundacao">Financiamento na documentação</Doc>
    </Sec>

    <Sec photo="casino" id="riscos" n="12" kicker="Riscos" dark title={<>Alto risco: pode haver perda parcial ou total.</>}>
      <ul className="grid gap-3 md:grid-cols-2">
        {['Sem renda garantida; não substitui salário.', 'Parecer jurídico, permissões de provedores, contratos e segurança são necessários antes de qualquer fundo.', 'Frentes de esportes e cassinos dependem de compatibilidade regulatória e não estão todas autorizadas.', 'Demanda, desempenho da IA, custos e liquidez ainda não foram testados.'].map((r) => <li key={r} className="rounded-2xl border border-[#2B59FF]/40 bg-[#0d1536] p-5 text-[15px] leading-7 text-[#c5d2f1]">{r}</li>)}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <a href={DOC} className="tap inline-flex min-h-12 items-center gap-2 rounded-full bg-[#F2B632] px-7 py-3.5 text-sm font-bold text-[#070B1F]">Ler a documentação completa <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
        <a href={`${DOC}#documentacao-oportunidade`} className="tap inline-flex min-h-12 items-center rounded-full border-2 border-[#F4F1E8]/70 px-7 py-3.5 text-sm font-bold hover:bg-[#F4F1E8] hover:text-[#070B1F]">Pesquisa e fontes</a>
      </div>
    </Sec>

    <section id="fontes" className="bg-[#F4F1E8]"><div className="page-wrap py-12">
      <h2 className="mono text-[11px] font-bold uppercase tracking-[.18em] text-[#2B59FF]">Fontes citadas</h2>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-[#183173]">
        <li><A href={ANBIMA}>ANBIMA/Datafolha, Raio X do Investidor, 9ª edição</A>, publicado em 2026, 5.832 entrevistas (16+), coleta em novembro de 2025.</li>
        <li><A href={ILO}>OIT, Generative AI and Jobs: 2025 Update</A>, maio de 2025, escopo global.</li>
      </ul>
    </div></section>
  </main>;
}
export default PitchPage;
