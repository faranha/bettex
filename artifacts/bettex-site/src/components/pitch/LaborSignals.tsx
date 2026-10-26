import { BriefcaseBusiness, ChevronLeft, ChevronRight, Clock3, ExternalLink, Globe2, ShieldAlert, TrendingDown, UsersRound, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useX } from '@/components/demo/ui';
import { t, useLocale } from '@/lib/i18n';
import { LABOR_SIGNAL_PHOTOS } from '@/lib/localized/labor-signal-photos';
import './LaborSignals.css';

const BLS = 'https://www.bls.gov/news.release/pdf/empsit.pdf';
const IMG = `${import.meta.env.BASE_URL}pitch-future/labor/`;
const photoAlts = () => [
  t('Mãos sobre anotações e um notebook em uma mesa de escritório, em foto ilustrativa'),
  t('Pessoas conversando em uma feira de empregos, em foto ilustrativa'),
  t('Pessoas caminhando diante de uma entrada de estação de metrô em um distrito financeiro de Londres, em foto ilustrativa'),
  t('Trabalhador de uniforme laranja em obra viária no Distrito Federal, em foto ilustrativa'),
  t('Pessoas em um ponto de ônibus com vendedores ambulantes no Rio de Janeiro, em foto ilustrativa'),
  t('Vendedora ambulante ao lado de um carrinho de rua em um parque, em foto ilustrativa'),
];
const PNAD = 'https://biblioteca.ibge.gov.br/visualizacao/periodicos/3086/pnacm_2026_ago.pdf';

function Signal({ photo, icon: Icon, label, value, title, children, href, source }: {
  photo: number; icon: LucideIcon; label: string; value: string; title: string; children: ReactNode; href: string; source: string;
}) {
  const ph = LABOR_SIGNAL_PHOTOS[photo]; const alt = photoAlts()[photo];
  return <article className="fu-signal">
    <figure className="fu-signal-photo">
      <img src={IMG + ph.file} alt={alt} width={1200} height={800} loading="lazy" decoding="async" draggable={false} />
      <span className="mono fu-photo-badge">{t('Foto ilustrativa')}</span>
      <figcaption><a data-i18n="translated" href={ph.page} target="_blank" rel="noopener noreferrer" title={t('Imagem recortada e comprimida')} aria-label={`${t('Crédito da foto')}: ${ph.by}, ${ph.lic}. ${t('Imagem recortada e comprimida')}`}>{ph.by} · {ph.lic}</a></figcaption>
    </figure>
    <div className="fu-signal-head"><span className="fu-signal-icon"><Icon aria-hidden="true" /></span><span className="mono fu-tag">{label}</span></div>
    <p className="display fu-signal-value">{value}</p>
    <h3 className="display">{title}</h3>
    <div className="fu-signal-copy">{children}</div>
    <a className="fu-src" href={href} target="_blank" rel="noopener noreferrer">{source}<ExternalLink aria-hidden="true" /></a>
  </article>;
}

export function LaborSignals() {
  const { x } = useX();
  useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [total, setTotal] = useState(0);
  const sync = useCallback(() => {
    const el = ref.current; if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    setTotal(kids.length);
    if (el.clientWidth <= 0 || kids.length === 0) return;
    let best = 0, d = Infinity;
    const left = el.getBoundingClientRect().left;
    kids.forEach((k, i) => { const v = Math.abs(k.getBoundingClientRect().left - left); if (v < d) { d = v; best = i; } });
    if (el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) best = kids.length - 1;
    setActive(best);
  }, []);
  useEffect(() => {
    sync();
    const observer = new ResizeObserver(sync);
    if (ref.current) observer.observe(ref.current);
    window.addEventListener('resize', sync);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [sync]);
  const go = (i: number) => {
    const el = ref.current; if (!el) return;
    const k = el.children[Math.max(0, Math.min(total - 1, i))] as HTMLElement | undefined; if (!k) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: el.scrollLeft + k.getBoundingClientRect().left - el.getBoundingClientRect().left, behavior: reduce ? 'auto' : 'smooth' });
  };
  return <>
    <div className="fu-signals" data-i18n="translated" ref={ref} onScroll={sync} tabIndex={0} role="region" aria-roledescription={x('Carrossel', 'carousel', 'carrusel')} aria-label={x('Dados do mercado de trabalho', 'Labor market data', 'Datos del mercado laboral')}
      onKeyDown={e => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); } }}>
      <Signal photo={0} icon={BriefcaseBusiness} label="EUA · setembro de 2026" value="−129 mil" title="Empregos eliminados no setor financeiro" href={BLS} source="BLS, 2 out. 2026">
        <p>O setor financeiro perdeu 129 mil postos desde o pico de maio de 2025. Só seguros e atividades relacionadas respondem por 90 mil dessas perdas.</p>
        <p>A economia criou +29 mil empregos não agrícolas em setembro, após média de apenas 45 mil por mês nos 12 meses anteriores. Há criação líquida, mas ela não impede perdas em setores inteiros.</p>
      </Signal>
      <Signal photo={1} icon={Clock3} label="EUA · setembro de 2026" value="1,9 milhão" title="Sem trabalho há pelo menos 27 semanas" href={BLS} source="BLS, 2 out. 2026">
        <p>O desemprego de longa duração atinge 27,1% dos desempregados. Outros 5,8 milhões querem emprego, mas estão fora da força de trabalho e da taxa principal.</p>
        <p>Há ainda 4,5 milhões trabalhando em tempo parcial por razões econômicas, embora prefiram trabalhar em tempo integral. A taxa de 4,2% não resume essa falta de trabalho.</p>
      </Signal>
      <Signal photo={2} icon={Globe2} label="Reino Unido · agosto de 2026" value="−145 mil" title="Menos pessoas na folha de pagamento" href="https://backup.ons.gov.uk/wp-content/uploads/sites/3/2026/09/Labour-market-overview-UK-September-2026.pdf" source="ONS, 15 set. 2026">
        <p>A estimativa preliminar mostra 145 mil pessoas a menos na folha de pagamento em um ano e queda de 26 mil entre julho e agosto. Esses dados estão sujeitos a revisão.</p>
        <p>As vagas abertas ficaram em 702 mil no trimestre de junho a agosto. Fora da pandemia, um nível tão baixo não era observado desde 2014.</p>
      </Signal>
      <Signal photo={3} icon={TrendingDown} label="Brasil · janeiro a agosto de 2026" value="−25,2%" title="Menor criação de vagas no ano desde 2020" href="https://www.jornaldocomercio.com/economia/2026/09/1265045-caged-saldo-liquido-de-emprego-formal-e-positivo-em-165-827-vagas-em-agosto.html" source="Novo Caged / JC, 29 set. 2026">
        <p>O saldo formal caiu de 1.516.881 vagas em janeiro a agosto de 2025 para 1.134.033 no mesmo período de 2026. São 382.848 oportunidades líquidas a menos.</p>
        <p>Agosto teve saldo positivo de 165.827 vagas. O problema comprovado é a desaceleração no acumulado, não geração zero no mês.</p>
        <a className="fu-src" href="https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/novo-caged/2026/agosto/sumario-executivo_agosto-de-2026.pdf" target="_blank" rel="noopener noreferrer">MTE, agosto de 2026<ExternalLink aria-hidden="true" /></a>
      </Signal>
      <Signal photo={4} icon={UsersRound} label="Brasil · junho a agosto de 2026" value="15 milhões" title="Pessoas com trabalho insuficiente ou sem acesso a ele" href={PNAD} source="IBGE, PNAD, 29 set. 2026">
        <p>A subutilização alcança 13,1% da força de trabalho ampliada: inclui desempregados, quem trabalha menos horas do que precisa e a força de trabalho potencial.</p>
        <p>O emprego privado com carteira ficou estatisticamente estável nas comparações trimestral e anual. Estabilidade na PNAD não significa zero criação líquida no Caged.</p>
      </Signal>
      <Signal photo={5} icon={ShieldAlert} label="Brasil · junho a agosto de 2026" value="38,8 milhões" title="Trabalhadores na informalidade" href={PNAD} source="IBGE, PNAD, 29 set. 2026">
        <p>São 37,5% dos ocupados, incluindo trabalhadores sem carteira e pessoas por conta própria sem CNPJ. A informalidade era de 37,3% no trimestre de março a maio.</p>
        <p>Mesmo com desemprego de 5,3%, milhões seguem sem vínculo formal. O problema não é apenas conseguir trabalho, mas a proteção de quem depende dessa renda.</p>
      </Signal>
    </div>
    <div className="fu-signal-nav">
      <button type="button" data-i18n="translated" className="fu-nav-btn" onClick={() => go(active - 1)} disabled={active === 0} aria-label={x('Dado anterior', 'Previous data card', 'Dato anterior')}><ChevronLeft aria-hidden="true" /></button>
      <div className="fu-nav-mid">
        <span className="mono fu-nav-count" aria-live="polite">{active + 1} / {total}</span>
        <div className="fu-nav-dots">{Array.from({ length: total }, (_, i) => <button key={i} type="button" data-i18n="translated" className={'fu-dot' + (i === active ? ' on' : '')} onClick={() => go(i)} aria-label={`${x('Ir para o dado', 'Go to data card', 'Ir al dato')} ${i + 1}`} aria-current={i === active ? 'true' : undefined} />)}</div>
      </div>
      <button type="button" data-i18n="translated" className="fu-nav-btn" onClick={() => go(active + 1)} disabled={active === total - 1} aria-label={x('Próximo dado', 'Next data card', 'Siguiente dato')}><ChevronRight aria-hidden="true" /></button>
    </div>
    <p className="fu-signal-method">Dados disponíveis em 4 de outubro de 2026. São indicadores de populações, períodos e metodologias diferentes, não valores para somar. Eles mostram perdas e vulnerabilidade, mas não provam que a IA causou esses resultados. Desemprego mede pessoas sem trabalho que procuram e estão disponíveis, não a quantidade de vagas abertas.</p>
  </>;
}