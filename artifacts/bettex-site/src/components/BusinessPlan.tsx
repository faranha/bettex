export function BusinessPlan() {
  return <div id="documentacao-plano-negocios" className="whitepaper__prose">
    <span id="documentacao-piloto" aria-hidden="true" />
    <span id="documentacao-receita-piloto" aria-hidden="true" />
    <span id="documentacao-aquisicao-retencao" aria-hidden="true" />
    <p><a href={`${import.meta.env.BASE_URL}pitch#publico`} data-testid="link-documentacao-pitch-comercial">Plano comercial e lançamento no Pitch</a></p>
  </div>;
}