import { DocFacts } from './DocFacts';
import pilot from '@/lib/business-plan.json';

const scenarios = pilot.monthlyOperationsPerActive;
export function BusinessPlan() {
  return <section id="documentacao-plano-negocios" aria-labelledby="plano-negocios-title">
    <h3 id="plano-negocios-title" className="whitepaper__subhead">Plano-base de negócios e lançamento</h3>
    <DocFacts title="Piloto de três meses" facts={[
      { label: 'CAPITAL DO PILOTO', value: 'US$ 100 mil', text: 'US$ 50 mil para tesouraria e US$ 50 mil para lançamento.' },
      { label: 'META DE USUÁRIOS', value: '5.000', text: 'Aquisição de usuários nos primeiros três meses, não vendas de tokens.' },
      { label: 'META DE ATIVIDADE', value: '1.000 MAU', text: 'Usuários ativos mensais ao final dos três meses.' },
    ]} />
    <h4 className="whitepaper__subhead" id="documentacao-piloto">Capital e aquisição founder-led</h4>
    <div className="whitepaper__prose"><p>A destinação de US$ 50 mil para tesouraria e US$ 50 mil para lançamento pertence a este piloto específico. Aportes de investidores têm livre alocação; não existe uma divisão obrigatória geral de captação.</p><p>O lançamento reúne impulsionamento, parcerias, segurança, mídia paga nos perfis do fundador e criação das redes próprias. Fred conduz o GTM com sua audiência, IA e serviços externos necessários. Conteúdo, comunidade e parceiros orientam a aquisição; o foco é uso do aplicativo, não quantidade de tokens vendidos.</p><p>As etapas são preparar os controles e serviços, acompanhar ativação e retenção e ajustar aquisição conforme os dados do piloto. Contratos, permissões, auditoria, caixa e conciliação precedem operações com recursos reais. A apresentação comercial está no <a href={`${import.meta.env.BASE_URL}pitch`}>Pitch</a>.</p></div>
    <h4 className="whitepaper__subhead" id="documentacao-receita-piloto">Frequência de operações e receita</h4>
    <div className="whitepaper__prose"><p>A projeção usa a meta de 1.000 MAU e a tarifa de US$ 2,50 por operação abrangida pela <a href="#documentacao-taxas">política oficial de taxas</a>. Usuário ativo não equivale a operação tarifada. Saques frequentes podem aumentar a frequência, mas dependem de USDC disponível e da decisão do titular.</p></div>
    <div className="whitepaper__vesting-scroll">
      <table className="whitepaper__vesting-table">
        <caption>Cenários mensais após três meses · 1.000 MAU</caption>
        <thead><tr><th scope="col">Operações por ativo</th><th scope="col">Operações tarifadas</th><th scope="col">Receita bruta</th></tr></thead>
        <tbody>{scenarios.map(frequency => <tr key={frequency}><th scope="row">{frequency}</th><td>{(pilot.monthlyActiveUsersGoal * frequency).toLocaleString('pt-BR')}</td><td>US$ {(pilot.monthlyActiveUsersGoal * 2.5 * frequency).toLocaleString('pt-BR')}</td></tr>)}</tbody>
      </table>
    </div>
    <div className="whitepaper__prose"><p>O cenário de 30 operações por ativo ilustra um saque diário em um mês de 30 dias; não presume que todos tenham créditos diários ou adotem esse hábito. Compras e envios elegíveis também contam, sem cobrar duas vezes a entrega integrante da compra.</p><p>Receita não é lucro. Do faturamento bruto são descontados os custos efetivamente identificados de IA, infraestrutura, conectores, rede quando suportada pela empresa, segurança, serviços externos e tributos aplicáveis, sem dupla dedução. Sem valores contratados e enquadramento fiscal, não há lucro líquido calculado nem data de equilíbrio. O capital do lançamento não é um orçamento recorrente mensal.</p><p>A precificação top-down parte da tarifa definida e relaciona frequência, receita e custos. Essa lógica não é atribuída ao método Lean Startup; aprendizado de uso e retenção é distinto da definição matemática da tarifa.</p></div>
  </section>;
}