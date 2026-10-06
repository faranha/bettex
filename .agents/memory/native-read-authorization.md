---
name: Consulta nativa e autorização de operação
description: Distinguir consulta de endereços públicos da associação explícita para operar na cadeia local.
---

A associação explícita à cadeia local autoriza operações de teste, não a simples consulta dos endereços públicos da conta autenticada. Consultar não deve associar carteiras, financiar saldos ou conceder permissões.

**Why:** Uma conta nova, ainda associada apenas à Arbitrum Sepolia, podia consultar seus endereços na EVM local em Operações, mas o painel bloqueava a mesma leitura. Isso fazia um zero confirmado aparecer como indisponível em outra área.

**How to apply:** Manter as leituras do painel, histórico e Operações consistentes, verificando a identidade e os dois endereços do titular. Preservar a associação e o consentimento explícitos para movimentações. Uma leitura local não comprova saldo na Sepolia pública nem valor financeiro; falha de consulta não deve virar zero nem saldo emulado.
