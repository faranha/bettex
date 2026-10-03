import { BuybackSchematic } from '@/components/docs-diagrams/DocSchematics';
import { buybackCommitment } from '@/lib/profit-allocation-policy';

export function BuybackPolicy() {
  return <section id="documentacao-recompras" aria-labelledby="recompras-title">
    <h3 id="recompras-title" className="whitepaper__subhead">Carteira exclusiva e política de recompra</h3>
    <div className="whitepaper__prose">
      <p><strong>{buybackCommitment}</strong></p>
      <p>O fechamento diário elegível destina 50% do lucro líquido distribuível à retenção e ao reinvestimento na tesouraria, 25% aos stakers elegíveis e 25% à carteira exclusiva de recompra. A base é resultado realizado, conciliado e disponível, após custos, tributos e obrigações, considerando as posições abertas. Venda de tokens e transferência entre carteiras não criam lucro para esse split.</p>
      <p>Antes do split, projetar todos os desembolsos: staking, transferência de recompra e custos aplicáveis. Se a reserva defensiva ou a liquidez ficarem insuficientes após esses desembolsos, 100% permanece na tesouraria, sem distribuição nem destinação à recompra naquele fechamento. Sem peso elegível, mantém-se a regra de não realizar o split.</p>
    </div>
    <BuybackSchematic />
    <div className="whitepaper__prose">
      <p><strong>Destinação diária não é compra diária.</strong> Os 25% são transferidos em USDC para uma carteira exclusiva, separada da tesouraria operacional, da reserva defensiva e do caixa da empresa. Seu saldo não utilizado acumula para recompras, sem prazo obrigatório de execução. Esse saldo segregado não é lucro novo nem crédito de stakers: suas rodadas continuam únicas, sem créditos residuais ou pesos acumulados.</p>
      <p>A carteira só financia recompras de BETTEX. Não financia estratégias, distribuições ou despesas da empresa e não conta simultaneamente como reserva defensiva ou capital disponível. Distinguir valor destinado, efetivamente transferido, disponível, comprometido em ordens, gasto e custos conciliados. Comprometer uma ordem não é gastar; enviar uma transferência não comprova recebimento. Recursos incertos permanecem comprometidos, sem compra duplicada ou recuperação presumida.</p>
      <p><strong>A administração decide quando executar.</strong> Agentes de IA analisam condições e executam somente o conteúdo autorizado, com controles de preço, liquidez e segurança. Não aprovam a própria proposta. Multisig e controles de movimentação permanecem; a destinação diária não impõe calendário diário de compras.</p>
      <p>Não divulgar antecipadamente horários, preços-alvo ou ordens específicas. Publicar cada operação somente após execução e conciliação, com seus valores efetivos e custos. Autorizar uma recompra não comprova que ela já ocorreu.</p>
      <p><strong>Restrição de uso tecnicamente verificável.</strong> A política exige mecanismos previstos de segregação e controle de destino, com código, permissões e evidências verificáveis após implementação e validação. Uma carteira comum ou uma instrução apenas administrativa não constitui garantia contratual on-chain. Contratos, endereços e mecanismos ativos devem ser identificados por evidências efetivas, sem presumir implantação.</p>
      <p><strong>Transparência por fechamento e por execução.</strong> Publicar lucro distribuível diário e memória de cálculo; valor dos 25%; transferências e identificadores; saldo disponível acumulado e compromissos; histórico com data, USDC gasto, BETTEX adquirido, preço médio e custos; e destino dos tokens adquiridos. Registros on-chain comprovam movimentações, enquanto conciliação e auditoria sustentam a correção do lucro declarado. Um identificador on-chain não comprova, sozinho, a apuração econômica.</p>
      <p>A segregação reduz o caixa operacionalmente disponível da tesouraria, mas não constitui despesa nem uma nova perda no patrimônio consolidado da entidade. A carteira de recompra é registrada separadamente; obrigações, reservas e transferências têm efeitos únicos. Custos efetivos das recompras são conciliados, sem segunda dedução ou reaplicação do split sobre saldos acumulados.</p>
      <h4 className="whitepaper__subhead" id="documentacao-burn">Queima permanente dos tokens adquiridos</h4>
      <p><strong>Todo BETTEX adquirido pela carteira de recompra é queimado permanentemente.</strong> A carteira exclusiva guarda USDC para a compra; não é o mecanismo de burn. A execução vincula aquisição, quantidade efetivamente recebida e destruição irreversível por mecanismo verificável, com referências conciliadas. Armazenar tokens numa carteira comum não é queimar. Tokens queimados não retornam à circulação nem participam do staking. Taxas de serviço não queimam BETTEX; emissão e vesting continuam os mesmos.</p>
    </div>
  </section>;
}