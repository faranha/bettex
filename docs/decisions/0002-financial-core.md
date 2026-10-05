# Ledger financeiro separado da emulação

**Status:** obrigatória para operação financeira; implementação pendente.

## Contexto

JSONB, números JavaScript, seeds e histórico limitado validam experiência, não integridade contábil.

## Decisão

Ledger append-only de partidas dobradas, unidades inteiras por ativo/rede, arredondamento explícito, reservas e outbox atômicos. Saldo é projeção do ledger. Correções são lançamentos compensatórios.

Blockchain/corretora confirmam operações externas; ledger define a posição contábil interna reconciliada. Timeout mantém reserva até apuração. Idempotência protege contra mensagens/webhooks duplicados e reinícios.

Separar dados, adaptadores e permissões de simulação/produção. Histórico fictício não vira saldo real.

## Alternativas e consequências

Rejeitadas renomeação de tabelas demonstrativas e simples aumento de casas decimais: não entregam trilha nem contabilidade. Exige migrações, testes de concorrência/falhas e conciliação independente.