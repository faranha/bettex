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
      <p>No saque solicitado de 100 USDC de saldo líquido já disponibilizado, a dedução autorizada de 2,50 USDC deixa 97,50 USDC para o titular antes de encargos externos. Retenções aplicáveis à distribuição já foram resolvidas antes desse saldo; não são descontadas de novo. Não exigir BETTEX para pagar o serviço. No envio autônomo de BETTEX, a quantidade segue ao destino e a tarifa é paga separadamente em USDC.</p>
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
      <p>As tarifas não queimam BETTEX, não reduzem a quantidade adquirida e não alteram o teto de 1 bilhão: 10% mint público inicial, 55% comunidade, 20% fundador/equipe e 15% investidores. O vesting dos últimos três grupos dura 24 meses a partir de março de 2027. O peso de staking continua a acompanhar quantidade e tempo elegíveis dos tokens pessoais.</p>
      <p><a href="#documentacao-entidade">Ver a organização da entidade</a> · <a href="#documentacao-receita-piloto">Ver cenários compactos do piloto</a></p>
      <p><a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Planilha de tarifas, piloto e vesting</a></p>
    </div>
    <ServiceFeeTaxes />
  </section>;
}