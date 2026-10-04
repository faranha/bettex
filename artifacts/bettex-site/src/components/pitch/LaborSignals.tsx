import { BriefcaseBusiness, Clock3, ExternalLink, Globe2, ShieldAlert, TrendingDown, UsersRound, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import './LaborSignals.css';

const BLS = 'https://www.bls.gov/news.release/pdf/empsit.pdf';
const PNAD = 'https://biblioteca.ibge.gov.br/visualizacao/periodicos/3086/pnacm_2026_ago.pdf';

function Signal({ icon: Icon, label, value, title, children, href, source }: {
  icon: LucideIcon; label: string; value: string; title: string; children: ReactNode; href: string; source: string;
}) {
  return <article className="fu-signal">
    <div className="fu-signal-head"><span className="fu-signal-icon"><Icon aria-hidden="true" /></span><span className="mono fu-tag">{label}</span></div>
    <p className="display fu-signal-value">{value}</p>
    <h3 className="display">{title}</h3>
    <div className="fu-signal-copy">{children}</div>
    <a className="fu-src" href={href} target="_blank" rel="noopener noreferrer">{source}<ExternalLink aria-hidden="true" /></a>
  </article>;
}

export function LaborSignals() {
  return <>
    <div className="fu-signals">
      <Signal icon={BriefcaseBusiness} label="EUA · setembro de 2026" value="−129 mil" title="Empregos eliminados no setor financeiro" href={BLS} source="BLS, 2 out. 2026">
        <p>O setor financeiro perdeu 129 mil postos desde o pico de maio de 2025. Só seguros e atividades relacionadas respondem por 90 mil dessas perdas.</p>
        <p>A economia criou +29 mil empregos não agrícolas em setembro, após média de apenas 45 mil por mês nos 12 meses anteriores. Há criação líquida, mas ela não impede perdas em setores inteiros.</p>
      </Signal>
      <Signal icon={Clock3} label="EUA · setembro de 2026" value="1,9 milhão" title="Sem trabalho há pelo menos 27 semanas" href={BLS} source="BLS, 2 out. 2026">
        <p>O desemprego de longa duração atinge 27,1% dos desempregados. Outros 5,8 milhões querem emprego, mas estão fora da força de trabalho e da taxa principal.</p>
        <p>Há ainda 4,5 milhões trabalhando em tempo parcial por razões econômicas, embora prefiram trabalhar em tempo integral. A taxa de 4,2% não resume essa falta de trabalho.</p>
      </Signal>
      <Signal icon={Globe2} label="Reino Unido · agosto de 2026" value="−145 mil" title="Menos pessoas na folha de pagamento" href="https://backup.ons.gov.uk/wp-content/uploads/sites/3/2026/09/Labour-market-overview-UK-September-2026.pdf" source="ONS, 15 set. 2026">
        <p>A estimativa preliminar mostra 145 mil pessoas a menos na folha de pagamento em um ano e queda de 26 mil entre julho e agosto. Esses dados estão sujeitos a revisão.</p>
        <p>As vagas abertas ficaram em 702 mil no trimestre de junho a agosto. Fora da pandemia, um nível tão baixo não era observado desde 2014.</p>
      </Signal>
      <Signal icon={TrendingDown} label="Brasil · janeiro a agosto de 2026" value="−25,2%" title="Menor criação de vagas no ano desde 2020" href="https://www.jornaldocomercio.com/economia/2026/09/1265045-caged-saldo-liquido-de-emprego-formal-e-positivo-em-165-827-vagas-em-agosto.html" source="Novo Caged / JC, 29 set. 2026">
        <p>O saldo formal caiu de 1.516.881 vagas em janeiro a agosto de 2025 para 1.134.033 no mesmo período de 2026. São 382.848 oportunidades líquidas a menos.</p>
        <p>Agosto teve saldo positivo de 165.827 vagas. O problema comprovado é a desaceleração no acumulado, não geração zero no mês.</p>
        <a className="fu-src" href="https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/novo-caged/2026/agosto/sumario-executivo_agosto-de-2026.pdf" target="_blank" rel="noopener noreferrer">MTE, agosto de 2026<ExternalLink aria-hidden="true" /></a>
      </Signal>
      <Signal icon={UsersRound} label="Brasil · junho a agosto de 2026" value="15 milhões" title="Pessoas com trabalho insuficiente ou sem acesso a ele" href={PNAD} source="IBGE, PNAD, 29 set. 2026">
        <p>A subutilização alcança 13,1% da força de trabalho ampliada: inclui desempregados, quem trabalha menos horas do que precisa e a força de trabalho potencial.</p>
        <p>O emprego privado com carteira ficou estatisticamente estável nas comparações trimestral e anual. Estabilidade na PNAD não significa zero criação líquida no Caged.</p>
      </Signal>
      <Signal icon={ShieldAlert} label="Brasil · junho a agosto de 2026" value="38,8 milhões" title="Trabalhadores na informalidade" href={PNAD} source="IBGE, PNAD, 29 set. 2026">
        <p>São 37,5% dos ocupados, incluindo trabalhadores sem carteira e pessoas por conta própria sem CNPJ. A informalidade era de 37,3% no trimestre de março a maio.</p>
        <p>Mesmo com desemprego de 5,3%, milhões seguem sem vínculo formal. O problema não é apenas conseguir trabalho, mas a proteção de quem depende dessa renda.</p>
      </Signal>
    </div>
    <p className="fu-signal-method">Dados disponíveis em 4 de outubro de 2026. São indicadores de populações, períodos e metodologias diferentes, não valores para somar. Eles mostram perdas e vulnerabilidade, mas não provam que a IA causou esses resultados. Desemprego mede pessoas sem trabalho que procuram e estão disponíveis, não a quantidade de vagas abertas.</p>
  </>;
}