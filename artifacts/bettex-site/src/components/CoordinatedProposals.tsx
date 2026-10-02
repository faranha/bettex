export function CoordinatedProposals() {
  return (
    <section id="documentacao-propostas-coordenadas" aria-labelledby="propostas-coordenadas-title">
      <h4 id="propostas-coordenadas-title" className="whitepaper__subhead">Uma proposta, várias ordens: capital total comprometido</h4>
      <div className="whitepaper__prose">
        <p><strong>O teto individual de 0,05% incide sobre o capital total comprometido pelas partes coordenadas da mesma proposta, não sobre cada ordem isolada.</strong> A proposta tem identificador comum, e cada parte mantém identificador próprio, valor em USDC, mercado, conector e estado. Dividir a mesma proposta entre ordens, agentes ou conectores não multiplica seu teto. Ganhos ou cobertura esperados não reduzem o capital exigido.</p>
        <p>O núcleo independente verifica o conjunto antes de autorizar e reservar o capital. A soma das parcelas constitui o total da proposta: não se conta novamente esse total além das parcelas. No acumulado diário global, o compromisso entra uma única vez; em cada mercado, entra somente a parcela correspondente, seguindo o dia UTC da autorização e reserva. Os controles de caixa, exposição e correlação continuam consolidados, sem duplicar proposta e ordens. Revalidações e confirmações seguem os registros existentes.</p>
        <p><strong>Com base investível de USDC 50.000, o teto individual é USDC 25.</strong> Duas partes que comprometam USDC 20 cada exigem USDC 40: a proposta é recusada, mesmo que cada ordem isoladamente fique abaixo do teto. Recusa antes da autorização e reserva não consome o acumulado diário. Autorizar o conjunto não torna indivisível a execução nas plataformas; execuções parciais, recusas e resultados desconhecidos seguem a conciliação, sem liberar recursos por suposição.</p>
        <p>Operações realmente independentes não se tornam uma única proposta apenas por compartilharem evento ou mercado; permanecem sujeitas aos tetos globais, por mercado e de exposição correlacionada. Preservam-se os percentuais, a base investível atualizada e a execução automática autorizada. Esta é uma regra do modelo, não um agrupamento de negociações reais já implementado na demonstração.</p>
      </div>
    </section>
  );
}