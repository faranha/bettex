# Arquitetura canônica da BETTEX

O contexto `simulation` possui apenas execuções de cenários identificados e coordena as APIs públicas de `agents`, `risk`, `execution`, `ledger` e `reconciliation`. Seus registros e relógio são isolados dos demais ambientes. Ver [decisão de execuções isoladas](decisions/0013-simulation-executions.md).

Integrações Allora/Polymarket seguem a [regra de colaboração e o registro canônico de pendências](integration-pendencies.md). Impedimentos não resolvidos exigem participação do criador; não autorizar substituições, inferências ou escolhas econômicas para contorná-los.

Este é o mapa normativo dos domínios, dependências e fontes de verdade. Consultar antes de implementar. [AGENTS.md](../AGENTS.md) define a rotina; [decisions/](decisions/README.md), as decisões. O [documento de apoio](architecture/README.md) descreve os gates financeiros e a evolução para serviços.

## Estado atual, sem confundir intenção com implementação

O monorepo existente usa React/Vite, OpenAPI/Orval/Zod, Express, Clerk e PostgreSQL/Drizzle. Identidade e persistência são reais. A demonstração interna de desenvolvimento mantém saldos, operações, cotações e orquestração emulados; produção bloqueia essa API/timer e mostra placeholders. Não existe ledger patrimonial completo nem assinatura financeira de produção. As contas nativas de desenvolvimento estão integradas a `/demo/minha-conta`, com duas carteiras EVM reais geradas no cliente. Sua associação inicial é Arbitrum Sepolia; o titular pode aceitar associação adicional à EVM local 31337 para abastecimento e compras de teste realmente executadas e conciliadas. Esses dados não são os saldos emulados da demonstração.

O Roadmap define ALFA seed com token/contratos/agentes, captação e formalização depois e BETA com go to market. Essa intenção de produto não prova que a infraestrutura financeira já existe.

Os módulos abaixo são fronteiras obrigatórias para a migração incremental, **não pastas/serviços já implementados**. Não renomear JSONB demonstrativo para apresentá-lo como ledger.

## Mapa e propriedade

| Módulo | Domínio, regras e dados próprios | Dependências diretas permitidas via API pública |
| --- | --- | --- |
| `accounts` | Usuários, identidade interna, vínculo externo, permissões e ciclo da conta | Nenhuma |
| `wallets` | Contas/endereço/rede, modelo de custódia, recuperação e exportação; porta restrita de assinatura | `accounts` |
| `ledger` | Contabilidade, lançamentos, contas contábeis, obrigações, reservas e saldos derivados | `accounts` |
| `agents` | Especialista → mercado → BETTEX; propostas, evidências e seleção | `risk` |
| `risk` | Mandatos, limites, autorização determinística e política de tesouraria | `ledger`, `wallets` |
| `execution` | Ordens, tentativas, adaptadores e resultado externo ainda não conciliado | `risk`, `ledger`, `wallets` |
| `reconciliation` | Confirmações externas, fills, divergências e reorganizações | `execution`, `ledger`, `wallets` |
| `audit` | Trilha durável de propostas, decisões, tentativas e resultados | Nenhuma; consome contratos de eventos |

Acesso permitido não concede acesso a tabelas internas. `agents` só solicita avaliação ao contrato público de risco; nunca chama carteira, ledger, executor ou signer diretamente. Estratégias não têm autoridade financeira. Eventos de integração não criam dependência reversa entre domínios.

[Hierarquia canônica](agent-hierarchy.md): primeiro ramo BETTEX → Mercado de Previsões → especialistas BTC, ETH e SOL. [Estratégia simulada](prediction-paper-trading.md) compartilha a política de risco e a hierarquia existentes: a fila pertence a `agents`, controles a `risk`, orçamento simulado a `ledger`, ordens/posições a `execution`, conferência a `reconciliation` e eventos ao `audit`. Tesouraria é controle transversal, não concorrente por oportunidades. Emulação é exclusiva de desenvolvimento/testes; produção não gera sua atividade e a demo pública mostra placeholders.

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
- Validadores gerados `@workspace/api-zod` são contratos de transporte permitidos, não fornecedores externos nem dependências permitidas no domínio puro.
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
| Conta pessoal de testes | `accounts`, com scrypt, sessão opaca, consentimento e bloqueio fora de desenvolvimento; não migra identidade Clerk |
| Carteiras pessoais de testes | `wallets`, com metadados públicos e cofre criptografado; chave e descriptografia exclusivamente no navegador |
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

### Cadastro pessoal integrado

[Decisão de carteiras pessoais de testes](decisions/0006-personal-test-wallets.md): `/testes/conta` redireciona à conta dentro do app. Contas Clerk existentes são preservadas, sem migração por e-mail; identidade nativa válida tem precedência. O ponto de composição `routes/test-accounts.ts` injeta os adaptadores dos dois contextos e coordena uma única transação para cadastro e troca de senha. Os módulos não acessam as tabelas internas um do outro. O compositor legado `lib/account-identity.ts` resolve o adaptador nativo, sem reexportar infraestrutura pela API pública de `accounts`. Cofre criptografado não é autorização para uma IA operar uma carteira. Ledger patrimonial e distribuição financeira real continuam pendentes; contratos de teste estão descritos abaixo.

### Biblioteca on-chain exclusivamente de teste

[Decisão de contratos de teste](decisions/0007-testnet-contract-library.md) e [especificação com fontes](contracts/bettex-testnet-spec.md): `lib/bettex-contracts` contém fontes Solidity, compilação/ABI e verificação EVM local. Seu nó auxiliar de desenvolvimento está documentado na [decisão do percurso](decisions/0009-native-blockchain-journey.md), sem autenticação ou banco paralelos. Os contratos são adaptadores on-chain consumidos pelas fronteiras existentes; não implementam ledger patrimonial ou distribuição de resultados completos. Não há autorização de mainnet nem implantação pública nessa configuração.

[Observação dos contratos](decisions/0008-test-contract-observation.md): `reconciliation` é proprietário dos vínculos por conta e evidências EVM. O painel usa Clerk existente, lê Arbitrum Sepolia, valida runtime/bloco e não substitui ledger por saldos externos. A compra é assinada exclusivamente pela carteira do usuário, com proteção de rede, orçamento exato e idempotência; implantação/funding públicos continuam pendentes.

[Percurso nativo blockchain](decisions/0009-native-blockchain-journey.md): `/demo/minha-conta` reúne cadastro/cofre/sessão; o caminho antigo só redireciona. `wallets` possui a associação local explícita, adapter RPC e assinatura pessoal restrita; `execution` possui operações/etapas/nonce/executor persistidos antes do envio; `reconciliation` valida runtime, recebimentos e hashes dos blocos e conserva evidências de eventos; `ledger` calcula saldo elegível × tempo, registra partidas dobradas USDC/BETTEX e verifica saldos contra a cadeia. A [rodada de teste](decisions/0010-local-round-settlement.md) apura resultado sintético explicitamente limitado, reserva obrigações, paga USDC local e segrega verba de recompra. Isso não é apuração de lucro externo nem ledger de estratégias reais. A EVM local usa MockUSDC gratuito e é identificada como local; reinício do nó é uma nova cadeia, não restauração de saldos anteriores.

### Suporte de engenharia: documentação oficial

`tools/technical-docs/` coleta, versiona e consulta referências técnicas públicas. É uma ferramenta de desenvolvimento fora dos domínios financeiros, sem rotas HTTP ou interface. Armazena apenas documentos oficiais em `data/technical-docs/`; não lê contas, credenciais ou dados de usuários.

Antes de mudar integração, consultar `pnpm docs:query --platform <plataforma> --query "<assunto>"`, verificar versões utilizadas e registrar referências na documentação da alteração. Atualização/recuperação e cobertura são descritas em [technical-documentation.md](technical-documentation.md). Política de implantação e persistência: [decisão correspondente](decisions/0005-technical-documentation.md).

A [decisão de migração incremental](decisions/0004-canonical-boundaries.md) registra os arquivos mistos atuais, seus responsáveis e critérios para retirar exceções. Não colocar novas regras em pastas genéricas nem duplicar regras no frontend.

A lista executável de dependências está em [architecture-rules.json](architecture-rules.json). `pnpm check:architecture` bloqueia novos arquivos genéricos não registrados, dependências/camadas inválidas, acesso a internos de outros módulos e ciclos no código modular do backend.

Esse verificador é estático e limitado à base Express: não prova propriedade em SQL dinâmico, autorização em runtime ou segurança dos fornecedores. Testes e revisão continuam obrigatórios. Os serviços futuros precisam ser incluídos explicitamente na verificação ao serem criados.

Mudanças do mapa, dependências ou exceções exigem decisão explícita em `docs/decisions/`, atualização deste documento, do manifesto e dos testes antes de implementação.

### Tesouraria e Governança

A [capacidade canônica de controle](treasury-governance.md) e a [decisão de integração](decisions/0011-treasury-governance-control.md) distribuem análise/proposta em `agents`, autorização/políticas em `risk`, reservas/obrigações em `ledger`, permissões em `accounts`, movimentação em `execution` e evidência em `audit`/`reconciliation`/`wallets`.

As rotas `treasury-governance` e `treasury-resources` são composição, não um domínio financeiro paralelo. A porta do agente expõe somente observação e proposta. O mesmo lock da tesouraria protege alocações e liquidação de rodadas; versões e reservas são persistidas antes do envio. A implementação comprovada é **local, de desenvolvimento e com ativos de teste**; não representa governança institucional, voto dos titulares ou implantação em rede pública.