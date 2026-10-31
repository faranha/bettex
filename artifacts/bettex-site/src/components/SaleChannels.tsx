export function SaleChannels() {
  return (
    <section id="documentacao-venda-primaria-secundaria" aria-labelledby="canais-venda-title">
      <h3 id="canais-venda-title" className="whitepaper__subhead">Venda pública do projeto e revenda entre titulares</h3>
      <div className="whitepaper__rule-pair">
        <div><span>MINT PÚBLICO INICIAL / 10%</span><p>Mint público previsto para 10 de dezembro de 2026. Sistema/ALFA e início do vesting previstos para março de 2027. Cada lançamento depende de adequação legal por atividade e território.</p><p>Mint aberto a qualquer pessoa, a preço fixo, até 100 milhões de BETTEX, sujeito à elegibilidade e à adequação jurídica. Financia o projeto, por execução própria ou launchpad parceiro. Preço, janela, plataforma e destino da parcela não mintada ainda serão definidos. O preço fixo da oferta não garante um piso de revenda.</p></div>
        <div><span>COMUNIDADE / 55%</span><p>Os 550 milhões da comunidade seguem vesting de 24 meses a partir de março de 2027. A venda utiliza somente tokens já liberados; 100% do preço em USDC vai à tesouraria. A compra no aplicativo e a venda direta a corretoras exigem confirmação e conciliação. Captação não é lucro distribuível.</p></div>
        <div><span>REVENDA ENTRE TITULARES</span><p>Um titular vende tokens já pertencentes a ele, respeitando sua disponibilidade. <strong>O pagamento em USDC vai ao titular vendedor, não à tesouraria.</strong> Mesmo que os tokens tenham sido originalmente comprados da parcela pública, sua revenda não é uma nova venda do estoque do projeto nem uma nova captação.</p></div>
      </div>
      <div className="whitepaper__prose">
        <p>O desenho 2 da arquitetura representa a compra da venda pública do projeto. Seu fluxo de USDC para a tesouraria não descreve toda compra por swap. A revenda entre titulares, por si só, não aumenta P ou B e não entra em R como resultado das estratégias. A venda do token pelo titular não é resgate da tesouraria nem recompra pelo projeto.</p>
        <p>Revendas pessoais não seguem a destinação da venda pública. O fundador destina livremente suas receitas pessoais após a liberação. Revenda não antecipa emissão nem cria novo vesting para unidades liberadas.</p>
        <p>O preço dos tokens da comunidade é destinado integralmente à tesouraria. Custos externos de rede e de terceiros são separados. Qualquer saída de BETTEX da carteira oficial, por saque, venda ou transferência, cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado, mesmo quando parcial.</p>
      </div>
    </section>
  );
}