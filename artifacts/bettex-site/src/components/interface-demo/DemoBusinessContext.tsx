/** @jsxImportSource react */
import { useX } from '../demo/ui';
import { businessIntelligence, businessRules } from '@/lib/documentation-business';

export function DemoParticipationRules() {
  const { x } = useX();
  return <aside data-testid="demo-participation-rules" className="space-y-2 rounded-xl border border-[#0E7C6B]/20 bg-[#F3F7EE] p-3 text-xs leading-relaxed text-[#254E43]">
    <p>{x(...businessRules.cap)}</p>
    <details data-demo-local>
      <summary className="cursor-pointer font-bold">{x('Base de cálculo e excedentes', 'Valuation and excess handling', 'Valoración y excedentes')}</summary>
      <p className="mt-2">{x(...businessRules.openEconomics)}</p>
      <p className="mt-2">{x('Os valores deste demo são exemplos. A cotação exibida é uma referência ilustrativa, não a definição do método final de avaliação.', 'Values in this demo are examples. The displayed quote is an illustrative reference, not the definition of the final valuation method.', 'Los valores de este demo son ejemplos. La cotización mostrada es una referencia ilustrativa, no la definición del método final de valoración.')}</p>
    </details>
  </aside>;
}

export function DemoBusinessContext({ area }: { area: 'central' | 'treasury' }) {
  const { x } = useX();
  return <aside data-testid={`demo-business-${area}`} className="space-y-2 rounded-xl border border-[#C9A227]/40 bg-[#FFFCF6] p-3 text-sm leading-relaxed text-[#1B2A41]">
    {area === 'central' ? <>
      <p>{x(...businessIntelligence.agP1)}</p>
      <p>{x(...businessIntelligence.agP2)}</p>
      <p>{x(...businessIntelligence.baseline)}</p>
    </> : <>
      <p>{x('A tesouraria financia o trading cripto, separada dos BETTEX dos participantes. O lucro elegível mantém a divisão 50% tesouraria, 25% participantes e 25% recompra. O teto individual de 1% não limita o retorno do trading e não autoriza redistribuir excedentes automaticamente.', 'The treasury funds crypto trading separately from participants’ BETTEX. Eligible profit retains the allocation of 50% treasury, 25% participants and 25% buyback. The individual 1% cap does not limit trading returns or authorize automatic redistribution of excess.', 'La tesorería financia el trading cripto, separado de los BETTEX de los participantes. El beneficio elegible conserva el reparto de 50% tesorería, 25% participantes y 25% recompra. El límite individual del 1% no limita el rendimiento del trading ni autoriza redistribuir excedentes automáticamente.')}</p>
      <details data-demo-local>
        <summary className="cursor-pointer font-bold">{x('Token, comunidade e desenvolvimento', 'Token, community and development', 'Token, comunidad y desarrollo')}</summary>
        <p className="mt-2">{x('Oferta máxima de 1 bilhão de BETTEX: 10% no mint inicial, 55% para a comunidade, 20% fundador/equipe e 15% investidores. Os 90% restantes têm vesting de 24 meses, com início previsto para março de 2027. Liberação não significa venda. A BETTEX não cobra taxas de serviço; custos externos não são receita da comunidade.', 'Maximum supply of 1 billion BETTEX: 10% initial mint, 55% community, 20% founder/team and 15% investors. The remaining 90% vest over 24 months, scheduled to begin in March 2027. Release does not mean sale. BETTEX charges no service fees; external costs are not community revenue.', 'Oferta máxima de 1.000 millones de BETTEX: 10% mint inicial, 55% comunidad, 20% fundador/equipo y 15% inversores. El 90% restante tiene vesting de 24 meses, previsto desde marzo de 2027. Liberación no significa venta. BETTEX no cobra tarifas de servicio; los costes externos no son ingresos de la comunidad.')}</p>
      </details>
    </>}
  </aside>;
}
