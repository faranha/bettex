# Arquitetura canônica da BETTEX

Este é o mapa normativo dos domínios, dependências e fontes de verdade. Consultar antes de implementar. [AGENTS.md](../AGENTS.md) define a rotina; [decisions/](decisions/README.md), as decisões. O [documento de apoio](architecture/README.md) descreve os gates financeiros e a evolução para serviços.

## Estado atual, sem confundir intenção com implementação

O monorepo existente usa React/Vite, OpenAPI/Orval/Zod, Express, Clerk e PostgreSQL/Drizzle. Identidade e persistência são reais. Saldos, operações, cotações e orquestração operacional continuam emulados. Não existe ledger financeiro, provisionamento de carteira Arbitrum ou assinatura real.

O Roadmap define ALFA seed com token/contratos/agentes, captação e formalização depois e BETA com go to market. Essa intenção de produto não prova que a infraestrutura financeira já existe.

Os módulos abaixo são fronteiras obrigatórias para a migração incremental, **não pastas/serviços já implementados**. Não renomear JSONB demonstrativo para apresentá-lo como ledger.

## Mapa e propriedade

| Módulo | Domínio, regras e dados próprios | Dependências diretas permitidas via API pública |
| --- | --- | --- |
| `accounts` | Usuários, identidade interna, vínculo externo, permissões e ciclo da conta | Nenhuma |
| `wallets` | Contas/endereço/rede, modelo de custódia, recuperação e exportação; porta restrita de assinatura | `accounts` |
| `ledger` | Contabilidade, lançamentos, contas contábeis, obrigações, reservas e saldos derivados | `accounts` |
| `agents` | Agentes, estratégias, propostas, evidências e coordenação BTEX | `risk` |
| `risk` | Mandatos, limites, autorização determinística e política de tesouraria | `ledger`, `wallets` |
| `execution` | Ordens, tentativas, adaptadores e resultado externo ainda não conciliado | `risk`, `ledger`, `wallets` |
| `reconciliation` | Confirmações externas, fills, divergências e reorganizações | `execution`, `ledger`, `wallets` |
| `audit` | Trilha durável de propostas, decisões, tentativas e resultados | Nenhuma; consome contratos de eventos |

Acesso permitido não concede acesso a tabelas internas. `agents` só solicita avaliação ao contrato público de risco; nunca chama carteira, ledger, executor ou signer diretamente. Estratégias não têm autoridade financeira. Eventos de integração não criam dependência reversa entre domínios.

## Camadas

```text
artifacts/api-server/src/modules/<domínio>/
  index.ts         API pública: contratos, portas e casos de uso
  domain/          invariantes, entidades, estados e políticas puras
  application/     fluxos e coordenação via portas
  infrastructure/  repositórios e adaptadores de fornecedores
  transport/       HTTP, mensagens e tradução dos contratos
```

- `domain` depende apenas do próprio domínio e de contratos/primitivas puros aprovados.
- `application` depende do próprio domínio/aplicação e das APIs públicas permitidas; não de adaptadores concretos.
- `infrastructure` implementa portas do próprio domínio/aplicação.
- `transport` invoca aplicação e usa contratos; não concentra decisão financeira.
- `index.ts` não exporta repositórios, schemas internos, SDKs ou handlers como API de domínio.
- Composição/injeção de adaptadores fica fora das regras centrais.
- Fornecedores são acessados por adaptadores de infraestrutura; trocar fornecedor não muda a regra central.
- Contracts compartilhados não contêm decisões de risco, saldo ou estratégias.
- Não são permitidos ciclos de imports, mesmo entre arquivos do mesmo módulo.
- Repositórios usam a conexão `db` e schemas do próprio contexto; imports globais/namespace que exponham tabelas de todos os contextos não são API pública.

Interfaces HTTP continuam em `lib/api-spec`; tipos/validadores são gerados nas bibliotecas existentes. Contratos de eventos podem ganhar biblioteca própria quando usados, sem scaffolding vazio.

## Fontes de verdade

| Informação | Fonte autoritativa |
| --- | --- |
| Autenticação externa | Clerk, verificado pelo backend; nunca claims arbitrárias do cliente |
| Propriedade/permissões internas | `accounts`, derivadas e verificadas no servidor |
| Transação on-chain confirmada | Blockchain correta, contratos permitidos e política de confirmações/reorganizações |
| Ordem/fill externo | Corretora/provedor autorizado e suas confirmações conciliadas |
| Posição contábil da plataforma | Ledger interno, reconciliado com fontes externas |
| Mandato e autorização | Política versionada aprovada e decisão determinística de `risk` |
| Estado demonstrativo atual | Backend/PostgreSQL demonstrativo; não saldo financeiro real |

UI, cache, preço de tela, mensagem de agente e resposta isolada do executor não substituem essas fontes.

## Operação e rastreabilidade

`proposta → autorização de risco → reserva → tentativa de execução → confirmação/conciliação → lançamento final`.

Cada operação possui `operationId`, identidade/escopo, chave de idempotência e estados explícitos; propostas, decisões, tentativas e eventos têm seus próprios IDs vinculados. O estado “resultado incerto” mantém a reserva até conciliação. Uma mensagem repetida não cria outra execução.

Usar unidades inteiras por ativo, serializadas como strings, rede/contrato/escala explícitos e arredondamento definido. Distinguir saldo confirmado, saldo reservado e saldo disponível. Reserva, lançamento e outbox são atômicos; saldo deriva dos lançamentos, não de mutação de um número no frontend.

Registro de proposta/evidência, mandato/versão, decisão/motivo, tentativa e resultado é durável. Compensações preservam o passado. Descartar logs de tela não apaga comandos, decisões ou lançamentos.

## Falhas, cancelamento e recuperação

- Sem validação obrigatória de risco, fonte confiável ou autorização: bloquear novas ordens e novas exposições.
- Cancelamento exige ordem identificada, autorização própria e confirmação externa; pedido de cancelamento não prova cancelamento.
- Timeout/reinício exige consulta e conciliação pelo mesmo identificador antes de reenviar.
- Redução de exposição exige mandato de emergência pré-aprovado, limites determinísticos e auditoria. Não concede assinatura irrestrita ao agente.
- Revogação/interrupção bloqueia novas operações, preservando leitura, conciliação e procedimentos seguros autorizados.
- Operações de recuperação não dispensam verificações de identidade, rede, destino e idempotência.

## Legado e evolução

A [decisão de migração incremental](decisions/0004-canonical-boundaries.md) registra os arquivos mistos atuais, seus responsáveis e critérios para retirar exceções. Não colocar novas regras em pastas genéricas nem duplicar regras no frontend.

A lista executável de dependências está em [architecture-rules.json](architecture-rules.json). `pnpm check:architecture` bloqueia novos arquivos genéricos não registrados, dependências/camadas inválidas, acesso a internos de outros módulos e ciclos no código modular do backend.

Esse verificador é estático e limitado à base Express: não prova propriedade em SQL dinâmico, autorização em runtime ou segurança dos fornecedores. Testes e revisão continuam obrigatórios. Os serviços futuros precisam ser incluídos explicitamente na verificação ao serem criados.

Mudanças do mapa, dependências ou exceções exigem decisão explícita em `docs/decisions/`, atualização deste documento, do manifesto e dos testes antes de implementação.