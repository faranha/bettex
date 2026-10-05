# Assinatura isolada e custódia a decidir

**Status:** isolamento obrigatório; escolha de custódia/provedor pendente.

## Contexto

O produto exige carteira Arbitrum vinculada à identidade, recuperação e exportação. Ainda não implementadas. Exportação depende do modelo de conta/custódia.

## Decisão

IA nunca recebe chaves, assina ou envia payload arbitrário ao signer. Serviço isolado valida autorização determinística, mandato, rede, contrato, destino, limites, replay e revogação.

Antes da implementação, aprovar custódia, proprietário do signer, exportação, recuperação, autenticação reforçada e procedimentos de incidente. SDKs e provedores são adaptadores, não núcleo de regras.

## Alternativas e consequências

Rejeitada guarda improvisada de chaves no motor ou PostgreSQL. Não escolher MPC, ERC-4337 ou custódia interna por novidade: validar requisitos e responsabilidade operacional.