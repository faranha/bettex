import proposal from '@/lib/service-fee-proposal.json';
import { DocFacts } from '@/components/DocFacts';
import { ServiceFeeTaxes } from '@/components/ServiceFeeTaxes';

export function ServiceFees() {
  return <section id="documentacao-taxas" aria-labelledby="taxas-title">
    <span id="documentacao-burning" aria-hidden="true" />
    <h3 id="taxas-title" className="whitepaper__subhead">Taxas fixas em USDC e financiamento da entidade</h3>
    <DocFacts title="Política atual de serviços" cols={3} facts={proposal.fees.map(fee => ({
      label: fee.operation, value: `US$ ${fee.amountUsd.toFixed(2).replace('.', ',')}`,
      text: 'Por operação concluída; pagamento em USDC, sem queima de BETTEX.',
    }))} />
    <div className="whitepaper__prose">
      <p><strong>As três tarifas são fixas, não percentuais.</strong> A receita pertence à empresa privada BETTEX e vai à carteira operacional própria, distinta da tesouraria e das carteiras pessoais. Provisões fiscais e custos reduzem a disponibilidade; US$ 2,50 de receita bruta não são US$ 2,50 de lucro líquido.</p>
      <p>A compra identifica separadamente o preço dos tokens e a tarifa em USDC. Em um exemplo com paridade USDC/dólar de 1:1, uma compra de 100 USDC de BETTEX exige 102,50 USDC antes de custos externos: 100 à tesouraria e 2,50 ao caixa operacional. Os BETTEX adquiridos não são usados para pagar a taxa. A entrega integrante dessa compra não recebe outra tarifa de envio.</p>
      <p>No saque solicitado de 100 USDC, a dedução autorizada de 2,50 USDC deixa 97,50 USDC para o titular, antes de encargos externos ou retenções aplicáveis. Não exigir saldo BETTEX, aquisição automática de tokens ou cancelar créditos por insuficiência para executar o serviço. No envio autônomo de BETTEX, a quantidade autorizada segue ao destino e a tarifa é paga separadamente em USDC.</p>
    </div>
    <div className="whitepaper__vesting-scroll" role="region" aria-label="Tarifas fixas confirmadas" tabIndex={0}>
      <table className="whitepaper__vesting-table">
        <caption>Tarifas</caption>
        <thead><tr><th scope="col">Operação</th><th scope="col">Tarifa</th><th scope="col">Incidência</th><th scope="col">Escopo</th></tr></thead>
        <tbody>{proposal.fees.map(fee => <tr key={fee.operation}><th scope="row">{fee.operation}</th><td>US$ {fee.amountUsd.toFixed(2).replace('.', ',')}</td><td>{fee.basis}</td><td>{fee.scope}</td></tr>)}</tbody>
      </table>
    </div>
    <div className="whitepaper__prose">
      <p>Custos de rede e de terceiros são discriminados, não tarifas institucionais ocultas. O recibo vincula operação, versão, ativos, origem, destino, preço, tarifa, encargos e líquido autorizado. A cotação pertinente à liquidação/contabilidade não presume paridade eterna entre USDC e dólar.</p>
      <p>Reserva não é cobrança concluída. A tarifa e a operação têm referências vinculadas e efeito único; falha comprovada exige correção identificada em USDC. Incerteza exige conciliação, sem nova cobrança ou devolução presumida. Não cobrar tarifa no crédito automático do yield, no depósito simples, na exportação de chaves ou em transferência direta fora do aplicativo.</p>
      <p>As tarifas não queimam BETTEX, não reduzem a quantidade adquirida, não alteram o vesting ou a emissão de 1 bilhão em 65%/20%/15%. O peso de staking continua a acompanhar quantidade e tempo elegíveis dos tokens pessoais.</p>
      <p><a href="#documentacao-entidade">Ver a organização da entidade</a> · <a href="#documentacao-projecoes-taxas">Ver projeções por operações</a> · <a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Baixar a planilha atual de tarifas, projeções e caixa operacional</a></p>
    </div>
    <ServiceFeeTaxes />
  </section>;
}