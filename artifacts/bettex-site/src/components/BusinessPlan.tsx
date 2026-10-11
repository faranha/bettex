/** @jsxImportSource react */
import { t, useLocale } from '@/lib/i18n';
import g from '@/lib/growth-strategy.json';

export function BusinessPlan() {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  return <div id="documentacao-plano-negocios" className="whitepaper__prose">
    <span id="documentacao-piloto" aria-hidden="true" />
    <span id="documentacao-receita-piloto" aria-hidden="true" />
    <span id="documentacao-aquisicao-retencao" aria-hidden="true" />
    <h3 id="documentacao-financiamento-fundacao" className="whitepaper__subhead">{x('Financiamento: origem e destino dos recursos', 'Financing: sources and uses of funds', 'Financiación: origen y destino de los recursos')}</h3>
    <p>{t(g.launch.angelFundingUse)}</p>
    <div data-i18n="translated">
      <h4 id="documentacao-fontes-financiamento" className="whitepaper__subhead">{x('Destino dos recursos', 'Use of funds', 'Destino de los recursos')}</h4>
      <ul>
        <li><strong>{t('Mint público inicial:')}</strong>{t('10% da emissão, a preço fixo, para financiar o projeto. Execução própria ou launchpad parceiro; captação não é lucro distribuível.')}</li>
        <li><strong>{t('Comunidade em vesting:')}</strong>{t('55% da emissão em 24 meses. A venda de tokens já liberados destina 100% do preço em USDC à tesouraria.')}</li>
        <li><strong>{x('Aportes-anjo: ', 'Angel contributions: ', 'Aportes de inversores ángeles: ')}</strong>{x('Produto, tecnologia e marketing, sem salário ou retiradas do fundador. Não existe divisão obrigatória de 50% para a tesouraria.', 'Product, technology and marketing, with no founder salary or withdrawals. There is no mandatory 50% allocation to the treasury.', 'Producto, tecnología y marketing, sin salario ni retiros del fundador. No existe reparto obligatorio del 50% para la tesorería.')}</li>
        <li><strong>{x('Revendas: ', 'Resales: ', 'Reventas: ')}</strong>{x('O preço pertence ao vendedor. Não gera nova captação ou lucro da tesouraria, nem antecipa o vesting.', 'The price belongs to the seller. It creates no new funding or treasury profit and does not accelerate vesting.', 'El precio pertenece al vendedor. No genera nueva captación ni beneficio de la tesorería, ni adelanta el vesting.')}</li>
      </ul>
      <p>{x('A alocação de 15% dos tokens não determina, por si só, o destino de todo aporte. Os termos de cada financiamento precisam identificar sua origem, uso e direitos, sem alterar oferta, vesting ou participação no lucro.', 'The 15% token allocation does not by itself determine the use of every contribution. Each financing agreement must identify its source, uses and rights without changing supply, vesting or profit participation.', 'La asignación del 15% de los tokens no determina por sí sola el destino de todo aporte. Los términos de cada financiación deben identificar su origen, uso y derechos, sin alterar la oferta, el vesting ni la participación en resultados.')}</p>
      <p>{x('As metas comerciais e o lançamento estão no Pitch.', 'Commercial targets and launch plans are in the Pitch.', 'Las metas comerciales y el lanzamiento están en el Pitch.')}</p>
    </div>
    <p><a href={`${import.meta.env.BASE_URL}pitch#publico`} data-testid="link-documentacao-pitch-comercial">{t('Plano comercial e lançamento no Pitch')}</a></p>
  </div>;
}