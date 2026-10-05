# Base canônica e migração incremental do legado

**Status:** adotada; organização física completa pendente.

## Contexto

O criador forneceu regras de arquitetura obrigatórias. Já existem documentos e código aproveitáveis; duplicar fontes normativas ou reescrever toda a aplicação seria contraproducente.

## Decisão e justificativa

`AGENTS.md` orienta implementações, `docs/architecture.md` define mapa/dependências/fontes de verdade e `docs/decisions/` registra justificativas. `replit.md` exige sua consulta antes de alterações. Documentos anteriores são apoio ou encaminhamentos, não registros concorrentes.

Novas regras pertencem aos contextos do mapa. Exceções atuais são explícitas:

| Arquivo em `artifacts/api-server/src/lib/` | Responsabilidade atual | Destino/retirada da exceção |
| --- | --- | --- |
| `account-identity.ts` | Identidade e adaptador Clerk, acoplado a tipos demonstrativos | `accounts`, separando porta de identidade do adaptador |
| `demo-state.ts` | Contas, saldos, rodadas e liquidação emulados | Separar emulação das regras de `wallets`/`ledger`; nunca migrar seed para saldo real |
| `orchestrator.ts` | Propostas, orçamento e progresso emulados | `agents` e `risk`, sem duplicar a regra de autorização |
| `demo-store.ts` | Persistência, transações e vínculo demonstrativo | Repositórios/casos de uso dos proprietários, preservando atomicidade e isolamento |
| `logger.ts` | Utilitário técnico de logs, sem regra de negócio | Pode permanecer como infraestrutura compartilhada com finalidade explícita |

Esses arquivos são dívida registrada, não exemplo para novos domínios. Alterações de manutenção exigem revisão e testes; não adicionar novos arquivos genéricos ou retirar controles silenciosamente.

## Verificação e consequências

Manifesto e verificador estático aplicam o mapa a novos módulos e rejeitam arquivos genéricos não registrados. Há testes do verificador e integração com `pnpm quality`/CI.

O verificador não certifica SQL dinâmico, saldo, segurança ou produção. Aceite de cada migração exige testes de autorização, contratos, idempotência, concorrência e recuperação, atualização dos documentos e remoção da exceção correspondente.

Não se muda banco, ativa dinheiro real, cria folders vazios ou executa refatoração ampla nesta decisão. Políticas aprovadas permitem automação limitada, não assinatura humana por ordem.