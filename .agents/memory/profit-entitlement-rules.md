---
name: Regras de perdas e elegibilidade ao lucro
description: Correções explícitas do criador sobre perdas, lucro anterior e peso após saída.
---

Entradas durante uma rodada não recebem NENHUM lucro dela, nem anterior nem posterior à entrada: têm que esperar a próxima rodada. No cartão de rendimentos, mostrar quanto do saldo da carteira participa da rodada atual e quanto ficou fora.

**Why:** O criador explicou: “posso depositar durante o ciclo e aquele deposito nao vai contar” e pediu tornar essa diferença clara no espaço disponível do cartão. Reiterou expressamente, na revisão da documentação e do Pitch: “NENHUM, TEM QUE ESPERAR A PROXIMA”.

**How to apply:** Não equiparar automaticamente o saldo atual da carteira à quantidade elegível da rodada. Não ratear lucro integral ou posterior da rodada atual para novos participantes, nem inventar participação por meia rodada. Aplicar a espera pela próxima em textos, desenhos, exemplos e derivados; a revisão documental não autoriza alterar o app ou contratos.

O criador autorizou corrigir o cálculo do demo junto com a divisão no cartão. A regra vale para as novas apurações; resultados de rodadas já encerradas devem ser preservados. A confirmação foi sobre o demo, não uma autorização para alterar contratos nativos.

**Why:** Escolheu “Sim, corrigir o cálculo e mostrar a divisão no cartão”, após ser informado de que o demo anterior atribuía peso proporcional às entradas durante a rodada.

**How to apply:** Excluir entradas liquidadas depois da abertura tanto da participação exibida quanto do rateio do demo. Saldo mantido passa a poder participar na rodada seguinte. Preservar o cancelamento integral dos direitos não pagos quando houver saída de BETTEX. No protocolo nativo, apresentar a elegibilidade realmente informada, sem substituí-la por valores do demo.

O criador definiu: “nao aceitamos deficit, perdas sao permanentes”.

O criador definiu: “cada rodada eh unica e nao retorna, nem soma, nem cumula, ou paga ou nao paga”.

**Why:** O criador rejeitou expressamente o rateio futuro de lucro retido e a combinação de rodadas.

**How to apply:** Cada rodada UTC usa somente seus próprios resultados e pesos. Lucro de rodada sem pagamento fica na tesouraria, sem liberação futura, créditos acumulados ou complementos depois de encerrada. Conciliação de transferências já iniciadas é auditoria do fato original, não reabertura ou autorização para pagar de novo. O criador reiterou que a revisão deve ser total e “cada rodada seja unica sem residuais”; remover também instruções e traduções antigas contraditórias, em vez de apenas acrescentar uma regra de precedência.

Interpretar a proibição de créditos após encerramento como encerramento financeiro, não como o corte do período econômico UTC. Não inventar prazo de liquidação nem permitir extensão discricionária: a janela deve ser aprovada antes de qualquer operação real.

**Why:** A revisão identificou que exigir permanência integral, conhecer o resultado completo e enviar pagamentos antes do próprio corte torna o fluxo impossível. Separar período econômico e liquidação preserva a independência das rodadas sem introduzir acumulação ou complemento após encerramento financeiro.

**How to apply:** Uma fase de liquidação posterior ao corte continua pertencendo exclusivamente à rodada original. Não misturar beneficiários ou resultados com a próxima. Custos seguem o UTC do fato comprovado, sem recalcular retroativamente o direito que originou o pagamento.

Novos participantes jamais podem receber parte de lucros anteriores. O criador definiu: “sacar o Bettex remove todo direito a créditos passados do ciclo, nao serao pagos, sempre que se saca se perde o direito”.

Qualquer saída de BETTEX, inclusive parcial, cancela todos os créditos do ciclo acumulados até a saída e ainda não pagos e zera todo o peso anterior da rodada, não apenas o peso da quantidade retirada. Não se conserva o peso do período anterior à saída nem o peso anterior do saldo remanescente. O criador rejeitou expressamente a frase “conserva o peso do período em que ela esteve elegível naquela rodada”. A regra alcança créditos executáveis apurados, autorizados e pendentes. Uma nova entrada não recupera o direito perdido. USDC já recebido não é clawback, e saque de USDC não equivale a saída de BETTEX.

O criador corrigiu a regra das frações: “fracoes nao pagam retornam ao treasury”. Frações não executáveis não constituem créditos pendentes do titular nem são acumuladas para pagamentos futuros; retornam à tesouraria na própria apuração, independentemente de saída de BETTEX.

**Why:** O criador rejeitou expressamente a acumulação de frações para liquidação futura e pediu a revisão de toda a documentação.

**How to apply:** Separar parcelas executáveis dos restos devolvidos à tesouraria. Corrigir também liquidação, complementos, diagramas, projeções e traduções; não apresentar a parcela nominal de 25% como integralmente pagável quando houver restos não executáveis.

A independência das rodadas não proíbe acumular saldo da carteira exclusiva de recompra: esse saldo tem destinação própria e não é crédito de stakers ou lucro novo.

**Why:** O criador determinou que recursos de recompra não utilizados permanecem acumulados, mantendo as regras de elegibilidade existentes.

**How to apply:** Distinguir a carteira de recompra dos créditos de distribuição ao revisar textos, indicadores e verificações de consistência. Seguir a política aprovada registrada em replit.md.

**Why:** O criador corrigiu esses trechos da documentação com “JAMAIS”; o texto existente não representa a regra aprovada.

**How to apply:** Aplicar a todos os textos, diagramas, cálculos e idiomas do projeto. Revalidar a ausência de saída antes de autorizar pagamentos, complementos e reenvios; manter cancelamentos separados do histórico e não restaurar créditos por atraso ou correção. Não inventar redistribuição dos valores cancelados.