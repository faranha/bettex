import { useEffect, type ReactNode } from 'react';
import { ArrowRight, ChevronDown, ExternalLink, List } from 'lucide-react';
import g from '@/lib/growth-strategy.json';
import thesis from '@/lib/new-economy-thesis.json';
import { FounderProfile } from '@/components/FounderProfile';
import { ReadingDisclosure, ExpandControls } from '@/components/ReadingDisclosure';
import './pitch.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;
const ANBIMA = 'https://www.anbima.com.br/data/files/BE/05/B0/55/1EABD91008E6DAD9F82BA2A8/Raio-X-do-Investidor-9-edicao.pdf';
const ILO = 'https://www.ilo.org/sites/default/files/2025-05/Research%20brief_GenAI%202025%20Update.pdf';

function Sec({ id, n, kicker, title, dark = false, summary, plain = false, children }: { id: string; n: string; kicker: string; title: ReactNode; dark?: boolean; summary?: string; plain?: boolean; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-t`} className={dark ? 'bg-[#070B1F] text-[#F4F1E8]' : 'bg-[#F4F1E8] text-[#070B1F]'}>
    <div className="page-wrap py-16 sm:py-24">
      <div className={`mono flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.18em] ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}><span>{n}</span><span className="h-px w-10 bg-current" aria-hidden="true" />{kicker}</div>
      <h2 id={`${id}-t`} className="display mt-5 max-w-[860px] text-[clamp(1.9rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-.06em]">{title}</h2>
      {summary ? <p className={`mt-6 max-w-[760px] text-base leading-7 ${dark ? 'text-[#c5d2f1]' : 'text-[#183173]'}`}>{summary}</p> : null}
      <div className="mt-8">{plain ? children : <ReadingDisclosure sectionDetail title="Ver detalhes desta seção" hint="Evidências, números e links">{children}</ReadingDisclosure>}</div>
    </div>
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

const index = [['fundador', 'Fundador'], ['problema', 'Problema'], ['agora', 'Por que agora'], ['solucao', 'Solução'], ['diferencial', 'Diferencial'], ['economia', 'Economia'], ['estagio', 'Estágio'], ['piloto', 'Piloto'], ['publico', 'Aquisição'], ['recursos', 'Recursos'], ['riscos', 'Riscos'], ['fontes', 'Fontes']];

export function PitchPage() {
  useEffect(() => {
    let mounted = true;
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!mounted || !id) return;
      const el = document.getElementById(id);
      if (!el) return;
      if (el instanceof HTMLDetailsElement) el.open = true;
      el.querySelectorAll<HTMLDetailsElement>('details[data-section-detail]').forEach((d) => { d.open = true; });
      for (let p = el.parentElement; p; p = p.parentElement) if (p instanceof HTMLDetailsElement) p.open = true;
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
    <section className="hero-bg relative overflow-hidden text-[#F4F1E8]">
      <div className="pitch-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="page-wrap relative pb-16 pt-14 sm:pb-24 sm:pt-24">
        <h1 className="pitch-rise display max-w-[980px] text-[clamp(2.6rem,8.4vw,6.4rem)] font-extrabold leading-[.98] tracking-[-.07em]">Participar dos resultados da IA, <span className="text-[#F2B632]">com regras que dá para conferir.</span></h1>
        <p className="pitch-rise mt-7 max-w-[640px] text-lg leading-8 text-[#c5d2f1]">Projeto founder-led liderado por Fred Azevedo. {thesis.purpose}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#solucao" className="tap inline-flex min-h-12 items-center gap-2 rounded-full bg-[#2B59FF] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#1E44D6]">Conhecer a BETTEX</a>
          <a href={DOC} className="tap inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-[#F4F1E8]/70 px-7 py-3.5 text-sm font-bold hover:bg-[#F4F1E8] hover:text-[#070B1F]">Ler a documentação</a>
        </div>
        <details id="pitch-index" className="pitch-index" data-testid="pitch-index" onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.currentTarget.open = false;
          event.currentTarget.querySelector('summary')?.focus({ preventScroll: true });
        }}>
          <summary className="pitch-index__trigger">
            <List size={18} aria-hidden="true" />
            <span>Seções do pitch</span>
            <ChevronDown className="pitch-index__chevron" size={18} aria-hidden="true" />
          </summary>
          <div className="pitch-index__body">
            <nav aria-label="Seções do pitch" className="pitch-index__links">
              {index.map(([id, label], i) => <a key={id} href={`#${id}`} onClick={(event) => {
                const menu = event.currentTarget.closest('details');
                if (menu) {
                  menu.open = false;
                  menu.querySelector('summary')?.focus({ preventScroll: true });
                }
              }}>
                <span className="pitch-index__number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span>{label}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>)}
            </nav>
            <ExpandControls scope=".pitch > section:not(:first-child)" label="Expandir ou recolher todo o pitch" />
          </div>
        </details>
      </div>
    </section>

    <Sec id="fundador" summary="A audiência do fundador é distribuição declarada; a tração do produto ainda não foi demonstrada." n="00" kicker="Fundador e distribuição" dark title={<>Founder-led: <span className="text-[#F2B632]">a distribuição já existe; o produto ainda precisa provar.</span></>}>
      <FounderProfile dark />
      <p className="mt-6 max-w-[760px] text-[15px] leading-7 text-[#c5d2f1]">Distinção: a audiência acima é distribuição declarada do fundador. Tração de produto da BETTEX, com usuários ativados e retenção, ainda não foi demonstrada. Meta: primeiros {g.launch.initialUsersGoal.toLocaleString('pt-BR')} usuários elegíveis e ativados no {g.launch.country}; não é número atual, e nem toda a audiência será cliente.</p>
      <Doc dark hash="documentacao-fundador">Apresentação na documentação</Doc>
    </Sec>

    <Sec id="problema" summary="Hipótese de oportunidade a partir de pesquisa com público brasileiro; não comprova demanda pelo produto nem promete recuperar perdas." n="01" kicker="Problema e oportunidade" title={<>O problema: <span className="text-[#2B59FF]">perder o emprego e a renda.</span></>}>
      <p className="mb-6 max-w-[800px] text-[15px] leading-7 text-[#183173]">{thesis.exclusion}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {[['17%', 'apostaram online em 2025'], ['39%', 'dos apostadores buscavam dinheiro rápido em caso de necessidade'], ['20%', 'dos apostadores viam apostas como investir ou juntar dinheiro']].map(([v, t]) => <div key={v} className="rounded-2xl bg-[#070B1F] p-6 text-[#F4F1E8]"><div className="display text-6xl font-extrabold tracking-[-.07em] text-[#F2B632]">{v}</div><p className="mt-3 text-sm leading-6 text-[#c5d2f1]">{t}</p></div>)}
      </div>
      <p className="mt-6 max-w-[760px] text-[15px] leading-7 text-[#183173]">Fonte: <A href={ANBIMA}>ANBIMA/Datafolha, Raio X do Investidor, 9ª edição (2026)</A>: 5.832 entrevistas com pessoas de 16 anos ou mais, coletadas em novembro de 2025. Os números descrevem motivações declaradas. Não são retorno de apostas nem demanda medida pela BETTEX.</p>
      <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-[#183173]">A oportunidade é uma hipótese: uma experiência financeira compreensível, com custos e riscos à vista. O projeto não mira pessoas em dificuldade e não promete recuperar perdas de apostas.</p>
      <Doc hash="documentacao-oportunidade">Pesquisa completa na documentação</Doc>
    </Sec>

    <Sec id="agora" summary="O impacto da IA no trabalho e o acesso aos resultados da economia programável." n="02" kicker="Por que agora" dark title={<>{thesis.statement} <span className="text-[#F2B632]">{thesis.question}</span></>}>
      <p className="mb-5 max-w-[800px] text-[15px] leading-7 text-[#c5d2f1]">{thesis.vision}</p>
      <p className="mb-7 max-w-[800px] text-[15px] leading-7 text-[#c5d2f1]">{thesis.exclusion}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card dark label="Evidência" title="Um em cada quatro empregos tem alguma exposição">Em maio de 2025, a OIT estimou que cerca de um quarto dos empregos no mundo tem algum grau de exposição à IA generativa. Exposição não é previsão de demissões; transformação de tarefas é mais provável que substituição integral. <A dark href={ILO}>OIT, maio de 2025</A>.</Card>
        <Card dark label="Tese" title="Participação, não proteção garantida">A BETTEX propõe acesso a estratégias geridas por IA e participação condicionada em lucros elegíveis. Não substitui salário, qualificação ou proteção social, e não é carteira de ações de empresas de IA.</Card>
      </div>
      <p className="mt-5 max-w-[800px] text-sm leading-7 text-[#c5d2f1]">{thesis.teslaExample} <A dark href={thesis.teslaSource}>Tesla, Master Plan Part IV</A>.</p>
      <Doc dark hash="documentacao-tese-ia">Tese e evidências na documentação</Doc>
    </Sec>

    <Sec id="solucao" summary="Empresa privada, ainda a constituir, com identidade econômica de fundo gerido por IA; quatro frentes planejadas, nenhuma garantida como ativa." n="03" kicker="Solução" title={<>Um fundo gerido por IA, aberto por token.</>}>
      <p className="max-w-[760px] text-[15px] leading-7 text-[#183173]">Uma empresa privada, ainda a constituir, com identidade econômica de fundo de investimento gerido por IA. Não é operadora de apostas nem intermediária. Quatro frentes planejadas, todas sujeitas a autorização e compatibilidade, nenhuma garantida como ativa.</p>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {['Previsões', 'Ações e cripto', 'Esportes (surebet)', 'Cassinos (bônus)'].map((m, i) => <div key={m} className="rounded-2xl border border-[#070B1F]/15 p-5"><span className="mono text-[10px] font-bold text-[#2B59FF]">0{i + 1} / PLANEJADA</span><div className="display mt-3 text-lg font-extrabold leading-tight tracking-[-.04em]">{m}</div></div>)}
      </div>
      <div className="mt-8 rounded-2xl bg-[#070B1F] p-6 text-[#F4F1E8]">
        <span className="mono text-[10px] font-bold uppercase tracking-[.14em] text-[#F2B632]">Regra do lucro</span>
        <p className="mt-3 text-[15px] leading-7 text-[#c5d2f1]">Só há lucro elegível após custos reais, tributos, recuperação de perdas, reservas e liquidez. Desse lucro, 75% ficam na tesouraria e 25% vão à distribuição condicionada, conforme as regras do token e do staking. O token não é ação, não dá propriedade do patrimônio e não garante resgate.</p>
      </div>
      <Doc hash="documentacao-oportunidade">Ver regras na documentação</Doc>
    </Sec>

    <Sec id="diferencial" summary="Governança verificável; nenhuma promessa de que a IA supere o mercado, e o desempenho ainda precisa ser validado." n="04" kicker="Diferenciação proposta" dark title={<>Governança verificável. <span className="text-[#F2B632]">Desempenho a validar.</span></>}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card dark label="Direitos" title="Regras escritas antes">Os direitos e créditos ficam separados em contas distintas. Qualquer saída de BETTEX, mesmo parcial, cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado.</Card>
        <Card dark label="Custos" title="Bruto e líquido à vista">Tarifa fixa de serviço informada antes da operação, em USDC, sem taxa de performance.</Card>
        <Card dark label="Controle" title="Rastro e limites">Tesouraria separada do caixa operacional, com registros conciliáveis e condições antes de usar dinheiro real.</Card>
      </div>
      <p className="mt-6 max-w-[720px] text-sm leading-7 text-[#c5d2f1]">Nenhuma promessa de que a IA supere o mercado. Desempenho líquido contra uma referência é justamente o que o piloto precisa medir.</p>
    </Sec>

    <Sec id="economia" summary="Duas receitas separadas: tarifa fixa de US$ 2,50 em USDC e ganhos de investimento da tesouraria." n="05" kicker="Economia do negócio" title={<>Duas receitas, mantidas separadas.</>}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card label="Operadora" title="Tarifa fixa de US$ 2,50 em USDC">Receita de serviço da empresa, em carteira operacional própria, fora da tesouraria e do split 75/25. Não é taxa de performance.</Card>
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

    <Sec id="estagio" summary="Equipe, constituição da empresa e validação da operação." n="06" kicker="Estágio atual" dark title={<>Estrutura operacional.</>}>
      <div className="grid gap-4">
        <Card dark label="Próximas validações" title="Do projeto à operação">Validar demanda, desempenho e receita. Constituição da empresa e contratações fazem parte do plano: 6 funções em 5 pessoas, com 4 posições remuneradas. O fundador não recebe salário, conforme a regra documentada.</Card>
      </div>
    </Sec>

    <Sec id="piloto" summary="Começar com dados autorizados, medir resultados e decidir sobre a continuidade." n="07" kicker="Proposta de piloto" title={<>Provar antes de operar dinheiro real.</>}>
      <ol className="grid gap-4 md:grid-cols-3">
        {[['Começar', 'Dados autorizados e simulação na frente de previsões.'], ['Medir', 'Resultado líquido de custos contra uma referência; se os usuários entendem direitos, custos e liquidez.'], ['Decidir', 'Critérios de seguir ou parar, com validações jurídicas e de segurança antes de qualquer dinheiro real.']].map(([t, d], i) => <li key={t} className="rounded-2xl border border-[#070B1F]/15 p-6"><span className="display text-5xl font-extrabold text-[#2B59FF]">{i + 1}</span><h3 className="display mt-2 text-xl font-extrabold tracking-[-.04em]">{t}</h3><p className="mt-2 text-[15px] leading-7 text-[#183173]">{d}</p></li>)}
      </ol>
      <a href={`${BASE}/#roadmap`} className="tap mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#2B59FF] underline underline-offset-4">Ver o roadmap <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
    </Sec>

    <Sec id="publico" summary="Distribuição do fundador com consentimento e medição; taxas e custos ainda serão medidos." n="08" kicker="Aquisição, retenção e expansão" dark title={<>Distribuição do fundador, com consentimento e medição.</>}>
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

    <Sec id="recursos" summary="Orçamento, valor total e termos não estão aprovados; não há oferta formal de tokens nem participação societária." n="09" kicker="Uso dos recursos e marcos" title={<>Conversa de financiamento para desenvolver e validar o piloto.</>}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card label="Regra vigente" title="Aportes ligados a investidores">50% para desenvolvimento inicial e 50% para a tesouraria. O preço público primário do token vai inteiro à tesouraria.</Card>
        <Card label="Em aberto" title="Valor total e termos">Orçamento e marcos do piloto não estão aprovados. Valor total e termos contratuais serão definidos. Não há oferta formal de venda de tokens nem participação societária proposta aqui.</Card>
      </div>
      <Doc hash="documentacao-financiamento-fundacao">Financiamento na documentação</Doc>
    </Sec>

    <Sec id="riscos" plain n="10" kicker="Riscos" dark title={<>Alto risco: pode haver perda parcial ou total.</>}>
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
