---
name: Evidence for test contracts
description: Boundaries between local EVM proofs, testnet observations and public deployment.
---

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
