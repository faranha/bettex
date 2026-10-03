export function SaleChannels() {
  return (
    <section id="documentacao-venda-primaria-secundaria" aria-labelledby="canais-venda-title">
      <h3 id="canais-venda-title" className="whitepaper__subhead">Venda pública do projeto e revenda entre titulares</h3>
      <div className="whitepaper__rule-pair">
        <div><span>VENDA PÚBLICA PELO PROJETO</span><p>O projeto vende tokens liberados do estoque destinado à venda pública, correspondente aos 65% da emissão. <strong>100% do USDC recebido vai à tesouraria.</strong> Isso vale para a compra no aplicativo e para a venda direta a corretoras. O recebimento conciliado é aporte, não lucro distribuível; a liberação continua seguindo o vesting de 36 meses.</p></div>
        <div><span>REVENDA ENTRE TITULARES</span><p>Um titular vende tokens já pertencentes a ele, respeitando sua disponibilidade. <strong>O pagamento em USDC vai ao titular vendedor, não à tesouraria.</strong> Mesmo que os tokens tenham sido originalmente comprados da parcela pública, sua revenda não é uma nova venda do estoque do projeto nem uma nova captação.</p></div>
      </div>
      <div className="whitepaper__prose">
        <p>O desenho 2 da arquitetura representa a compra da venda pública do projeto. Seu fluxo de USDC para a tesouraria não descreve toda compra por swap. A revenda entre titulares, por si só, não aumenta P ou B e não entra em R como resultado das estratégias. A venda do token pelo titular não é resgate da tesouraria nem recompra pela empresa.</p>
        <p>Os aportes vinculados à alocação de 15% dos investidores preservam a destinação de 50% para a tesouraria e 50% para capital inicial e desenvolvimento; revender tokens pessoais depois não reaplica esse split ao pagamento do comprador. O fundador continua livre para destinar suas receitas pessoais após a liberação dos tokens. A revenda não libera tokens antecipadamente, altera a emissão ou cria novo vesting para unidades já liberadas.</p>
        <p>A compra primária pelo aplicativo separa o preço dos tokens, destinado integralmente à tesouraria, da tarifa fixa US$ 2,50 paga em USDC ao caixa operacional. Não descontar a tarifa em BETTEX nem aplicar tarifa primária automaticamente a revendas entre titulares. Custos de rede e de terceiros são separados. Transferências diretas externas seguem a distinção documentada. Entradas confirmadas não recebem lucros anteriores. Qualquer saída de BETTEX da carteira oficial, por saque, venda ou transferência, cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado, mesmo quando parcial.</p>
      </div>
    </section>
  );
}