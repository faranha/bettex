import { Topics } from './ReadingDisclosure';
import { distributionRemainderProjectionRule } from '@/lib/staking-rounding-policy';
import team from '@/lib/entity-team.json';
import { businessAssumptions as a, businessMonths, businessPlan as p, businessMoney as money, businessCount as count } from '@/lib/business-plan';
import { DocFacts } from './DocFacts';
import { TechnicalDetails } from './TechnicalDetails';
import { BusinessPlanTable } from './BusinessPlanTable';
import { GlobalOperatingModel } from './GlobalOperatingModel';
import { GrowthStrategy } from './GrowthStrategy';

export function BusinessPlan() {
  const equilibrium = businessMonths.find(m => m.month === p.firstBreakEvenMonth);
  return <section id="documentacao-plano-negocios" aria-labelledby="plano-negocios-title">
    <h3 id="plano-negocios-title" className="whitepaper__subhead">Plano-base de negócios e lançamento</h3>
    <div className="whitepaper__prose">
      <p><strong>Primeira proposta para feedback, não contratação ou previsão comprovada.</strong> A decisão do criador é fundador sem salário, com sua alocação originária de tokens. Salários dos outros quatro integrantes, fornecedores, provisões, volumes e calendário abaixo são hipóteses negociáveis. Os meses contam da implantação; não substituem automaticamente as datas do Roadmap ou o vesting aprovado.</p>
    </div>
    <DocFacts title="Plano-base calculado" cols={3} facts={[
      { label: 'CUSTO NO EQUILÍBRIO', value: money(p.costAtBreakEven), text: `${money(p.fixed)} fixos + ${money(p.breakEvenOperations * a.variableCostPerOperationUsd)} variáveis + ${money(p.breakEvenOperations * p.fee * a.revenueTaxProvisionRate)} de provisão fiscal.` },
      { label: 'OPERAÇÕES TARIFADAS', value: `${count(p.breakEvenOperations)}/mês`, text: `${money(p.fee)} por operação; contribuição planejada ${money(p.contribution)}.` },
      { label: 'EQUILÍBRIO NA RAMPA', value: p.firstBreakEvenMonth ? `Mês ${p.firstBreakEvenMonth}` : 'Não atingido', text: 'Condicionado a volumes reais, custos e capacidade; não recuperação do investimento inicial.' },
    ]} />
    <Topics bare={[GrowthStrategy, GlobalOperatingModel, TechnicalDetails]}>
    <h3 className="whitepaper__subhead">Lançamento e aquisição (Go To Market)</h3>
    <div className="whitepaper__status-grid">
      <div><span>01 / MESES 1–2</span><strong>Preparar, validar e financiar</strong><p>Definir territórios e serviços permitidos, formalizar contratos, contratar por escopo, montar produto mínimo, base de suporte e controles. Testes, auditoria e disponibilidade do caixa antecedem uso de fundos reais. Formar lista de interessados sem contabilizar inscrição como compra.</p></div>
      <div><span>02 / MÊS 3</span><strong>Piloto limitado e condicionado</strong><p>Brasil como mercado inicial, após as validações aplicáveis, com entrada controlada, limite de usuários e capital. Medir compreensão, ativação e suporte; operações com USDC, compras e saques somente quando autorizadas. Só operar conectores autorizados e prontos; não lançar todos os mercados por obrigação.</p></div>
      <div><span>03 / MESES 4–6</span><strong>Validar uso e aquisição</strong><p>Distribuição founder-led pelos canais de Fred Azevedo, combinada com performance, construção de marca e narrativa nas redes sociais. Acompanhar as primeiras coortes brasileiras e ampliar a aquisição conforme ativação, retenção, chamados e caixa. A meta inicial de 1.000 usuários não é resultado realizado nem prazo garantido. Ajustar custos e produto antes de ampliar gasto; não promover rendimento garantido.</p></div>
      <div><span>04 / MESES 7–12</span><strong>Expandir com critérios</strong><p>Ampliar idiomas, canais e territórios apenas com autorização, serviço estável, fornecedores e capacidade de atendimento. {p.firstBreakEvenMonth ? `Mês ${p.firstBreakEvenMonth} é o marco financeiro calculado nesta hipótese de volumes, não data assegurada de equilíbrio.` : 'A rampa não atinge o equilíbrio neste horizonte.'}</p></div>
    </div>
    <div className="whitepaper__prose">
      <p><strong>Funil:</strong> alcance → interessado → conta/carteira → recebimento confirmado de USDC → primeira compra → uso recorrente. Acompanhar cada conversão; primeira compra não é todo holder, operação não é usuário único e DAU não é MAU. As metas anteriores de 100 mil holders e 5 mil ativos diários continuam metas de alcance, não receita automática nem a rampa deste plano. Esta rampa termina em {count(businessMonths[businessMonths.length - 1].monthlyActiveUsers)} MAU e contém {count(businessMonths.reduce((sum, m) => sum + m.purchases, 0))} operações de compra no ano, incluindo possíveis recompras; não demonstra atingir aquelas metas nem fornece uma projeção de holders únicos.</p>
      <p>O orçamento de mídia paga de {money(a.growth.monthlyPaidMediaUsd)} está dentro dos {money(a.fixedCosts.find(c => c.id === 'marketing')!.amountUsd)} de marketing. A estratégia founder-led, canais, retenção e expansão estão em <a href="#documentacao-aquisicao-retencao">Aquisição, retenção e expansão</a>. A sensibilidade antiga de {money(a.growth.testPaidCacUsd)} por primeiro comprador permitiria {count(a.growth.monthlyPaidMediaUsd / a.growth.testPaidCacUsd)} primeiros compradores/mês apenas como cálculo; não é CAC medido, nem alvo validado para os primeiros 1.000 usuários ativados. Campanhas e incentivos precisam de revisão jurídica e origem rastreável.</p>
      <p><strong>Economia por cliente:</strong> recuperar apenas os {money(a.growth.testPaidCacUsd)} de mídia exigiria ao menos {count(Math.ceil(a.growth.testPaidCacUsd / p.contribution))} operações tarifadas por comprador, à contribuição de {money(p.contribution)}, antes dos outros custos fixos. Medir retenção e contribuição de serviços por coorte; valorização do token e preço de compra destinado à tesouraria não são receita para recuperar aquisição. Incluir pessoas, peças e canais no CAC total, sem descontar marketing duas vezes no orçamento.</p>
      <p>Receitas futuras de planos Pro, IA ou B2B ficam em validação e <strong>não entram no faturamento-base</strong>. Não cobrar assinatura para liberar direitos já previstos no token. Serviços adicionais exigem utilidade, custos e permissões próprios antes de incluir receita no plano.</p>
    </div>
    <GrowthStrategy />
    <TechnicalDetails title="Distribuição proposta de salários e orçamento calculado">
      <BusinessPlanTable caption="Remuneração mensal bruta de referência · USD para planejamento" headers={['Posição', 'Valor mensal', 'Situação']} rows={team.positions.map(person => [
        person.title, money(person.proposedMonthlySalaryUsd), person.id === 'founder'
          ? 'Sem salário: decisão do criador; alocação originária de tokens, sem renda mensal presumida.'
          : 'Proposta a negociar e formalizar; não salário contratado.',
      ])} />
      <BusinessPlanTable caption="Custos fixos mensais propostos · sem duplicar implantação ou custos variáveis" headers={['Rubrica', 'Valor mensal', 'Escopo']} rows={[
        ['Quatro remunerações', money(p.salary), team.positions.filter(person => person.id !== 'founder').map(person => `${person.title}: ${money(person.proposedMonthlySalaryUsd)}`).join('; ') + '; fundador zero.'],
        ['Encargos e benefícios', money(p.charges), `Provisão gerencial de ${count(a.payrollChargesRate * 100)}% das remunerações; não alíquota legal confirmada.`],
        ...a.fixedCosts.map(c => [c.name, money(c.amountUsd), c.scope]),
        ['Total fixo planejado', money(p.fixed), 'Compromissos recorrentes; confirmar cotações, contratos e enquadramento.'],
        ['Custos variáveis no equilíbrio', money(p.breakEvenOperations * a.variableCostPerOperationUsd), `${count(p.breakEvenOperations)} operações × ${money(a.variableCostPerOperationUsd)}, suportados pelo caixa operacional.`],
        ['Provisão fiscal no equilíbrio', money(p.breakEvenOperations * p.fee * a.revenueTaxProvisionRate), `${count(a.revenueTaxProvisionRate * 100)}% da receita de serviços como hipótese gerencial, não tributação validada.`],
        ['Total mensal no equilíbrio', money(p.costAtBreakEven), 'Já inclui variáveis e provisão; não descontá-las novamente sobre o total.'],
      ]} />
      <div className="whitepaper__prose">
        <p>{distributionRemainderProjectionRule}</p>
        <p><strong>Contribuição = {count(p.fee)} × (1 − {count(a.revenueTaxProvisionRate * 100)}%) − {count(a.variableCostPerOperationUsd)} = {money(p.contribution)}.</strong> Equilíbrio = {count(p.fixed)} ÷ {count(p.contribution)}, arredondado para cima: {count(p.breakEvenOperations)} operações. Antes de atingir esse volume, o custo não é sempre {money(p.costAtBreakEven)}: são {money(p.fixed)} fixos mais variáveis e provisão dependentes da atividade. Mais volume também aumenta o custo. Se fornecedores, encargos ou tributos mudarem, recalcular o alvo e o financiamento.</p>
        <p>Os percentuais fiscais e valores são premissas, não pesquisa salarial ou cotações. O modelo assume as quatro remunerações desde o mês 1; contratação por etapas exigiria ajustar escopo e recalcular, sem apagar obrigações já assumidas. Validar vínculo do fundador sem salário, contratos, encargos e moeda legal de remuneração. Tokens não substituem salários dos colaboradores; sua concessão pessoal continua separada.</p>
        <p><strong>Caixa livre projetado, não extrato bancário:</strong> o fluxo supõe recebimentos e despesas no mês e separa integralmente a provisão fiscal como indisponível. Provisão é obrigação estimada, não confirmação de recolhimento. Ao pagar o tributo com o saldo já reservado, baixar a obrigação e a reserva sem deduzir o mesmo valor novamente do caixa livre; diferenças exigem ajuste. O resultado não é lucro contábil distribuível nem saldo bancário bruto. Conciliar competência, vencimentos, pagamentos e reservas reais.</p>
      </div>
    </TechnicalDetails>
    <GlobalOperatingModel />
    <TechnicalDetails title="Rampa de 12 meses, implantação, déficit e financiamento operacional">
      <BusinessPlanTable caption="Rampa ilustrativa · caixa livre após provisões, antes de aportes" headers={['Mês', 'Fase', 'Operações', 'Receita bruta', 'Custo + provisão', 'Implantação', 'Variação livre', 'Acumulado livre']} rows={businessMonths.map(m => [
        `M${m.month}`, m.month === p.firstBreakEvenMonth ? 'Equilíbrio projetado' : m.phase, count(m.operations), money(m.revenue), money(m.recurringCost),
        money(m.setupCost), money(m.cashResult), money(m.cumulative),
      ])} />
      <BusinessPlanTable caption="Implantação pontual · não repetir nos custos mensais" headers={['Item', 'Hipótese']} rows={a.setupCosts.map(c => [c.name, money(c.amountUsd)])} />
      <DocFacts title="Financiamento do caixa operacional, separado da tesouraria" cols={3} facts={[
        { label: 'DÉFICIT MÁXIMO', value: money(p.peakDeficit), text: `Inclui implantação de ${money(p.setup)} e perdas acumuladas da rampa.` },
        { label: 'RESERVA DE CAIXA', value: money(p.buffer), text: `${count(a.reserveMonths)} meses de custos fixos; não reserva defensiva de investimentos.` },
        { label: 'CAIXA INICIAL NECESSÁRIO', value: money(p.operatingFunding), text: 'Nesta hipótese, sem receitas adicionais ou financiamento mensal.' },
      ]} />
      <div className="whitepaper__prose">
        <p>{p.firstBreakEvenMonth ? `O mês ${p.firstBreakEvenMonth} cobre o custo recorrente e a provisão.` : 'A rampa não atinge o equilíbrio recorrente no horizonte de 12 meses.'} A variação de caixa livre do ano, incluindo implantação e antes de aportes, é {money(p.yearCashResult)}. Recuperar integralmente os déficits iniciais exige que o acumulado volte a zero; equilíbrio mensal não comprova isso. A reserva de {a.reserveMonths} meses é margem de caixa planejada, não gasto reconhecido no primeiro mês. O financiamento cobre esta hipótese mensal; não comprova suficiência para atrasos, picos intramês ou serviço de uma dívida ainda não contratada.</p>
        <p>Financiamento vem de aporte societário, dívida documentada ou da parcela operacional dos aportes vinculados aos investidores. Se exclusivamente esse último fluxo financiar {money(p.operatingFunding)}, a regra 50%/50% exigiria {money(p.operatingFunding / 0.5)} de aporte total, metade operacional e metade tesouraria — não uma captação já aprovada. O preço dos tokens públicos e créditos dos titulares não cobrem automaticamente esse déficit.</p>
        <p><strong>Dependência do mix:</strong> hipótese de {count(a.mix.purchaseShare * 100)}% compras, {count(a.mix.withdrawalShare * 100)}% saques e {count((1 - a.mix.purchaseShare - a.mix.withdrawalShare) * 100)}% envios; tickets de {count(a.mix.purchaseTicketUsdc)} USDC por compra e {count(a.mix.withdrawalTicketUsdc)} USDC solicitados por saque, com USD/USDC 1:1 somente para projeção. Compras primárias exigem estoque liberado e preço vigente; não vender acima do vesting nem contar revendas entre titulares como compras primárias. {equilibrium
          ? `No mês de equilíbrio seriam ${count(equilibrium.withdrawals)} saques e ${count(equilibrium.requestedWithdrawals)} USDC solicitados, incluindo a tarifa. Sem créditos anteriores e sem retenções individuais, isso exige pelo menos ${count(equilibrium.minimumEligibleProfit)} USDC de lucro elegível para gerar créditos pelo split de 25%, com reservas e demais condições atendidas.`
          : 'A tabela da planilha calcula os créditos e o piso elegível exigidos por mês; não há mês de equilíbrio nesta rampa.'} Não é uma projeção de retorno; se não houver saldo e adesão, os saques e sua receita não acontecem. As hipóteses antigas de metas são cenários comparativos, não receitas que se somam a este plano.</p>
        <p>O piso agregado acima supõe q = 100% do peso de distribuição nos sacadores. Com fração q menor, o requisito sem créditos anteriores ou retenções é saques solicitados ÷ (25% × q). O peso depende de tokens elegíveis e tempo, não do número de usuários. Também faltam preço e quantidade liberada para testar a capacidade de cada mês de venda: ticket financeiro não comprova estoque suficiente.</p>
        <p><a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Baixar a planilha: abas Plano-base e Lançamento 12m, com salários e premissas editáveis.</a></p>
      </div>
    </TechnicalDetails>
    </Topics>
    <div className="whitepaper__aside-callout"><span>CRITÉRIOS PARA AVANÇAR</span><p>Contrato, permissões, auditoria, caixa, conciliação e plantão definidos antes do piloto com fundos. Expansão depende de retenção, custo por aquisição e por atendimento, custo de IA por caso, operações efetivas, fila controlada e incidentes resolvidos. Se a rampa falhar, reduzir gastos futuros permitidos ou buscar financiamento aprovado; salários e obrigações vencidas não desaparecem. Revisar mensalmente antes de ampliar aquisição.</p></div>
  </section>;
}