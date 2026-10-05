# BETTEX

Aplicativo de tecnologia em desenvolvimento para coordenar propostas de agentes, tesouraria e participação por ciclos. O repositório inclui o site, o Pitch e a documentação do produto.

## Estado técnico

O projeto entrou na fase de desenvolvimento de aplicação. A experiência operacional disponível ainda usa saldos, propostas, cotações e resultados emulados. **Autenticação e persistência são reais; operações financeiras e carteiras on-chain não estão implementadas.** A identificação pública ALFA permanece.

| Capacidade | Estado verificado |
| --- | --- |
| Identidade, perfil e sessões | Clerk, com verificação no backend |
| Persistência da experiência operacional | PostgreSQL/Drizzle; estado demonstrativo em JSONB |
| Contratos HTTP e clientes | OpenAPI, Orval e Zod |
| Orquestração BTEX e comparação de propostas | Máquina de estados emulada, com reserva de orçamento |
| Agentes, preços e execução | Exemplos emulados, não integrações financeiras |
| Carteira Arbitrum e exportação de chaves | Requisito do produto; implementação pendente |
| Ledger financeiro e auditoria completa | Arquitetura definida; implementação pendente |
| Microsserviços de assinatura, execução e indexação | Fronteiras propostas; não implantados |

Não interpretar a interface, os testes ou este repositório como autorização para operar dinheiro real.

## Leitura para avaliação técnica

1. [Arquitetura canônica e limites dos módulos](docs/architecture.md).
2. [Revisão do arquiteto e próximos marcos](docs/architecture/review.md).
3. [Decisões arquiteturais](docs/decisions/README.md).
4. [Regras de desenvolvimento](CONTRIBUTING.md).
5. [Segurança](SECURITY.md) e [modelo de ameaças](threat_model.md).
6. [Instruções obrigatórias para agentes de desenvolvimento](AGENTS.md).

## Organização atual

```text
artifacts/bettex-site/     React/Vite: site, conteúdo e interface do app
artifacts/api-server/      Express: identidade, API e emulação persistente
lib/api-spec/             contrato OpenAPI e configuração do gerador
lib/api-client-react/     cliente e tipos gerados
lib/api-zod/              validadores e tipos gerados
lib/db/                   PostgreSQL/Drizzle
AGENTS.md                 instruções obrigatórias de implementação
docs/architecture.md     mapa canônico e fontes de verdade
docs/architecture/        apoio técnico e avaliação
docs/decisions/           decisões e critérios de evolução
scripts/                 verificações e ferramentas do workspace
.github/workflows/        verificações automatizadas, sem publicação
```

## Ambiente e verificação

Node definido em `.node-version`, pnpm definido em `package.json` e Python 3 para as verificações/editoriais do frontend.

```sh
pnpm install --frozen-lockfile
pnpm quality
```

`pnpm quality` regenera os contratos, verifica TypeScript, executa testes e compila frontend/backend. Não inicializa o servidor nem depende de credenciais financeiras.

Para executar o app, usar os serviços gerenciados existentes. Fora do ambiente gerenciado, é necessário configurar PostgreSQL, autenticação Clerk e roteamento do frontend/API na mesma origem; instalar dependências não provisiona esses serviços. Os valores de configuração são fornecidos pelo ambiente, nunca por arquivos versionados. A implantação Clerk também exige o proxy canônico de produção.

Comandos de desenvolvimento dos serviços:

```sh
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/bettex-site run dev
```

Os serviços precisam de seus próprios `PORT` e roteamento; não executar ambos na mesma porta. Consultar a configuração do artifact e as instruções do projeto, sem copiar segredos.

## Avaliação e publicação no GitHub

- A revisão arquitetural é uma análise de código, não certificação financeira nem auditoria de smart contracts.
- Antes de abrir o repositório: revisar histórico Git, segredos, materiais de pesquisa, anexos e direitos de uso dos assets.
- O metadado `license` do pacote não substitui a confirmação da licença do projeto e dos direitos dos materiais.
- A CI é configuração entregue; a execução no GitHub depende de o workflow estar presente no repositório e de Actions habilitado.