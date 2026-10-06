---
name: Evidence for test contracts
description: Boundaries between local EVM proofs, testnet observations and public deployment.
---

## Identificação pública do app

O usuário escolheu o selo “LIVE · TESTNET PÚBLICA”, com destaque pulsante, em vez de “LIVE · TESTNET SIMULADA”.

**Why:** O usuário escolheu conectar e validar uma rede pública antes de exibir esse selo.

**How to apply:** Não confundir conectividade RPC ou execução local com o app operando em contratos públicos. Manter explícito o que continua simulado.

Se não houver endereço implantado, o criador exige que o agente crie a implantação, em vez de pedir que ele encontre um endereço inexistente.

**Why:** O usuário corrigiu explicitamente essa transferência de responsabilidade.

**How to apply:** Fazer o trabalho técnico e buscar recursos gratuitos de teste quando possível; pedir ao usuário apenas ações externas que realmente dependam dele, nunca inventar confirmações públicas.

O registro público de atividade da ALFA não comprova emissão, venda, saques ou distribuição do token econômico em contratos públicos.

**Why:** A demonstração pode registrar atividade real na rede sem alterar a economia ou usar parâmetros comerciais ainda não aprovados.

**How to apply:** Preservar a distinção na UI e nas entregas: LIVE identifica a conexão e o registro de atividade; saldos e operações financeiras permanecem simulados.

Local EVM tests, even with an Arbitrum Sepolia chain ID, do not constitute public deployment or a public purchase. Confirm public funding and approved parameters before treating testnet execution as delivered.

**Why:** This delivery required database, panel and a real purchase path as well as Solidity; local receipts alone could be mistaken for completion of the public stage.

**How to apply:** Keep confirmed local results and outstanding public execution separate in delivery reports. Do not insert local EVM fixtures as publicly confirmed blockchain evidence.

Runtime validation that masks compiler-declared immutable slots must also check the contracts' linked token addresses and allocation parameters.

**Why:** Bytecode equivalence alone cannot validate constructor-supplied immutables or prove their intended relationship.

**How to apply:** Validate immutable relationships before presenting an allocation as evidence or allowing a purchase.

## Fronteira aprovação → compra

O percurso com aprovação explícita deve conservar a operação até a confirmação da **compra**, não apenas da aprovação. O rascunho da compra pode não existir antes da aprovação; a retomada deve consultar a mesma operação e criar essa etapa depois.

**Why:** a primeira verificação integrada encontrou dois critérios de UI incompatíveis com etapas criadas progressivamente, interrompendo o percurso após aprovação real.

**How to apply:** ao mudar estados/etapas da compra, verificar reload após aprovação, etapa final ausente e compra enviada/incerta, mantendo o mesmo identificador e sem solicitar outra aprovação.

## Token imutável e proteção de direitos

Não reiniciar nem substituir uma cadeia existente apenas para acrescentar um hook atômico ao token. Preparar a versão compatível em ambiente isolado e bloquear o caminho inseguro na versão anterior até uma transição deliberada.

**Why:** adicionar rastreamento de saídas a um token imutável exige outro deployment; um restart implícito destruiria saldos e a relação entre os recibos persistidos e a cadeia.

**How to apply:** distinguir proteção comprovada em uma nova cadeia de proteção efetivamente ativa na cadeia do app. Preservar a época e os saldos existentes; não apresentar testes isolados como migração concluída.
