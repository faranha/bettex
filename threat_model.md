# Threat Model

## Project Overview

BETTEX usa React/Vite, Express, Clerk e PostgreSQL/Drizzle. A identidade é real; a experiência financeira persistida é emulada. Este modelo cobre a base atual e os limites exigidos para a futura infraestrutura cripto; não afirma que as proteções-alvo já existem.

## Assets

- Identidade, sessões, vínculo de propriedade e dados de conta.
- Integridade de comandos, propostas, decisões e resultados persistidos.
- Segredos da infraestrutura e credenciais do provedor de autenticação.
- Futuros fundos, chaves, mandatos e obrigações: ainda não operados pelo app.

## Trust Boundaries

1. Navegador não confiável → API: autenticação, propriedade, schema e autorização.
2. API → Clerk: identidade externa verificada; cliente não fornece identidade autoritativa.
3. API/motor → PostgreSQL: transações atuais; futuro ledger e outbox atômicos.
4. Agentes/dados externos → BTEX/risco: dados não são instruções de execução.
5. Executor → signer: autorização restrita; nenhum pedido arbitrário de assinatura.
6. Blockchain/provedores → conciliação: respostas externas podem atrasar, duplicar ou divergir.

## Threat Categories

| Categoria | Ameaça específica | Garantia exigida |
| --- | --- | --- |
| Spoofing | Apropriar-se da conta por ID/cookie/claims fornecidos pelo cliente | Propriedade verificada no servidor; sessão inválida não vira identidade verificada |
| Tampering | Alterar quantias, destino, preço, proposta ou política | Schema, semântica, cotação/TTL e mandato verificados; dinheiro autoritativo não vem do React |
| Repudiation | Perder histórico, decisão, retry ou resultado | Auditoria durável e correlacionada; limite de tela nunca apaga comando pendente |
| Information disclosure | Expor sessões, PII ou futuras chaves em logs/repos/prompts | Redação, acesso mínimo e isolamento do signer; revisão do histórico antes de GitHub público |
| Denial of service | Criar carga de contas/consultas e bloquear o motor compartilhado | Limites distribuídos, isolamento de workers e métricas; limiter em memória não basta em produção |
| Elevation of privilege | Agente ultrapassar mandato ou solicitar transferência arbitrária | Agente só propõe; autorização e assinatura independentes, allowlists e revogação |

## Required Security Guarantees

- Escritas de conta exigem identidade/propriedade válida; anonimato só autoriza a experiência demonstrativa.
- Reuso de idempotência com outro payload é erro. Retries não duplicam lançamentos nem ordens.
- Falha/timeout de provedor não é prova de que a operação não aconteceu.
- Reservas persistem enquanto a execução estiver incerta; divergências interrompem execução segura.
- Reorganizações e confirmações de blockchain são modeladas e conciliadas por política.
- Importação de dados emulados para saldo real é proibida.
- Mudanças de risco precisam de política aprovada, versionada e auditável.
- Custódia/exportação/recuperação e autorização de mainnet exigem decisões/revisões explícitas.

## Scan Anchors

- `artifacts/api-server/src/lib/account-identity.ts`: verificação de identidade.
- `artifacts/api-server/src/routes/demo.ts`: cookie, mutações, limites e fronteira HTTP.
- `artifacts/api-server/src/lib/demo-store.ts`: vínculo, transações e idempotência.
- `artifacts/api-server/src/lib/orchestrator.ts`: propostas e política ilustrativa.
- `lib/db/src/schema/demo.ts`: persistência demonstrativa, não ledger.

## Limits

Revisão arquitetural, sem varredura de dependências/segredos, teste de invasão ou auditoria on-chain. CORS, CSRF, autorização entre serviços, controles distribuídos, signer e recuperação financeira precisam de validação antes da produção.