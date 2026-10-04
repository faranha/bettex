export function ServiceFeeTaxes() {
  return <section id="documentacao-provisao-taxas" aria-labelledby="provisao-taxas-title">
    <span id="documentacao-gross-up" aria-hidden="true" />
    <h4 id="provisao-taxas-title" className="whitepaper__subhead">Receita bruta, custos e tributos</h4>
    <div className="whitepaper__prose"><p>A tarifa de serviço é receita bruta. Custos identificados e tributos aplicáveis reduzem o resultado operacional, sem gross-up automático. Provisão é uma obrigação estimada ou reconhecida, não comprovação de recolhimento. Pagar a obrigação já contabilizada não gera segunda dedução.</p><p>O perfil fiscal identifica contribuinte, obrigação, base, moeda, vencimento e fonte de cobertura. Retenções dos rendimentos não são receita de serviço; seguem o <a href="#documentacao-tributos">fluxo fiscal da distribuição</a>.</p></div>
  </section>;
}