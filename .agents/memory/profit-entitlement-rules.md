---
name: Regras de perdas e elegibilidade ao lucro
description: Correções explícitas do criador sobre perdas, lucro anterior e peso após saída.
---

O criador definiu: “nao aceitamos deficit, perdas sao permanentes”.

O criador definiu: “cada rodada eh unica e nao retorna, nem soma, nem cumula, ou paga ou nao paga”.

**Why:** O criador rejeitou expressamente o rateio futuro de lucro retido e a combinação de rodadas.

**How to apply:** Cada rodada UTC usa somente seus próprios resultados e pesos. Lucro de rodada sem pagamento fica na tesouraria, sem liberação futura, créditos acumulados ou complementos depois de encerrada. Conciliação de transferências já iniciadas é auditoria do fato original, não reabertura ou autorização para pagar de novo. O criador reiterou que a revisão deve ser total e “cada rodada seja unica sem residuais”; remover também instruções e traduções antigas contraditórias, em vez de apenas acrescentar uma regra de precedência.

Novos participantes jamais podem receber parte de lucros anteriores. O criador definiu: “sacar o Bettex remove todo direito a créditos passados do ciclo, nao serao pagos, sempre que se saca se perde o direito”.

Qualquer saída de BETTEX, inclusive parcial, cancela todos os créditos do ciclo acumulados até a saída e ainda não pagos e zera todo o peso anterior da rodada, não apenas o peso da quantidade retirada. Não se conserva o peso do período anterior à saída nem o peso anterior do saldo remanescente. O criador rejeitou expressamente a frase “conserva o peso do período em que ela esteve elegível naquela rodada”. A regra alcança créditos executáveis apurados, autorizados e pendentes. Uma nova entrada não recupera o direito perdido. USDC já recebido não é clawback, e saque de USDC não equivale a saída de BETTEX.

O criador corrigiu a regra das frações: “fracoes nao pagam retornam ao treasury”. Frações não executáveis não constituem créditos pendentes do titular nem são acumuladas para pagamentos futuros; retornam à tesouraria na própria apuração, independentemente de saída de BETTEX.

**Why:** O criador rejeitou expressamente a acumulação de frações para liquidação futura e pediu a revisão de toda a documentação.

**How to apply:** Separar parcelas executáveis dos restos devolvidos à tesouraria. Corrigir também liquidação, complementos, diagramas, projeções e traduções; não apresentar a parcela nominal de 25% como integralmente pagável quando houver restos não executáveis.

**Why:** O criador corrigiu esses trechos da documentação com “JAMAIS”; o texto existente não representa a regra aprovada.

**How to apply:** Aplicar a todos os textos, diagramas, cálculos e idiomas do projeto. Revalidar a ausência de saída antes de autorizar pagamentos, complementos e reenvios; manter cancelamentos separados do histórico e não restaurar créditos por atraso ou correção. Não inventar redistribuição dos valores cancelados.