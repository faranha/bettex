# Tesouraria e Governança como capacidade transversal

**Fonte:** instrução de implementação do agente de Tesouraria e Governança de 5 de outubro de 2026; arquitetura canônica e regras da Fundação.

**Decisão:** distribuir a capacidade entre agents/risk/ledger/execution/accounts/audit. Agente propõe; risk decide deterministicamente com política versionada. Duas identidades humanas segregam proposta/aprovação. Mudanças administrativas têm ativação explícita. Acrescentar reservas contábeis persistidas, serialização por epoch compartilhada com rodadas locais e reutilizar journal/nonce/recibos do executor existente.

**Why:** LLM não é autoridade financeira; processo em memória ou apenas aprovação de tela não evita dupla utilização, revogação de permissão ou envio duplicado após falha.

**Hipóteses de teste:** política inicial pausada, 0,50 USDC defensivo, 0,25 máximo individual, 0,50 por dia UTC, destino oitava conta do nó local; sem produção/multisig/voto presumidos. Valores versionáveis, não termos econômicos definitivos. Não atribuir automaticamente papéis a contas existentes.

**Componentes:** API pública de risco/agente, ledger de reservas, permissões existentes de accounts, composição HTTP com portas/adaptadores existentes, OpenAPI gerado, histórico durável.

**Verificação:** ciclo HTTP/banco/receipt num ambiente descartável; negações, concorrência, pausa, incerteza e retomada. Testnet pública depende de operação/custódia/funding autorizados, não se finge execução pública usando localhost.
