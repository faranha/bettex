export function QuoteValidity() {
  return (
    <section id="documentacao-validade-cotacoes" aria-labelledby="validade-cotacoes-title">
      <h4 id="validade-cotacoes-title" className="whitepaper__subhead">Validade das cotações antes do envio</h4>
      <div className="whitepaper__prose">
        <p><strong>Preços, odds e estimativas de custos usados na autorização têm fonte, horário UTC e validade registrados.</strong> O núcleo confere a validade antes do envio pela condição mais restritiva entre a informada pelo provedor e as regras de risco aprovadas e vigentes. Não se inventa um prazo fixo para todos os mercados. Sem dados confiáveis ou critério verificável de validade, a ordem não é enviada.</p>
        <p><strong>Cotação vencida exige atualização e nova verificação de risco antes do envio.</strong> A decisão usa a nova cotação, a base patrimonial atualizada, as regras vigentes e os controles existentes de caixa, reservas, exposição, pausas e permissões. Em propostas coordenadas, as cotações das partes e seus custos são conferidos para o conjunto, não apenas para uma ordem isolada. O registro preserva os dados anteriores e acrescenta as fontes, os horários e o resultado da revalidação.</p>
        <p>Atualizar uma cotação não cria outra ordem ou reserva, não soma o compromisso novamente ao acumulado diário e não aumenta o orçamento autorizado. Se os novos preços ou custos exigirem gasto além do valor autorizado, ou se outra condição de risco falhar, o envio fica bloqueado. Não se usa uma cotação antiga para contornar a recusa, nem se libera capital apenas porque ela venceu. Além da validade no envio, a ordem leva <a href="#documentacao-condicoes-execucao">condições de preço ou odds aplicadas pela plataforma na execução</a>.</p>
        <p><strong>Vencimento da cotação não comprova cancelamento de uma ordem já enviada.</strong> Se o envio ocorreu ou seu resultado é desconhecido, preservam-se os compromissos e a conciliação da operação original, sem reenvio automático ou liberação presumida. Preservam-se percentuais, aprovação da liderança para mudanças nas regras e execução automática autorizada; este controle é requisito do modelo, não validação de cotações ou negociação real já implementada na demonstração.</p>
      </div>
    </section>
  );
}