# Regras de desenvolvimento

Antes de implementar, ler [AGENTS.md](AGENTS.md), [arquitetura canônica](docs/architecture.md), `replit.md` e as [decisões relevantes](docs/decisions/README.md).

## Princípios obrigatórios

1. Toda funcionalidade pertence a um contexto da [arquitetura canônica](docs/architecture.md); definir proprietário dos dados, autorização e invariantes antes da interface.
2. Separar domínio, aplicação, infraestrutura e transporte. Não colocar decisão financeira no React, nos handlers HTTP ou em um prompt.
3. Trabalhar por mudanças pequenas e verificáveis. Não mover todo o aplicativo ou trocar banco/provedor como efeito colateral.
4. Não confundir emulação com integração real. Adaptadores emulados são explícitos e não podem cair silenciosamente em execução real.
5. Agentes propõem; políticas autorizam; executores executam; a conciliação confirma. Nenhum agente recebe chaves.
6. Decisões de custódia, fronteiras, contratos e política financeira precisam de ADR e revisão. Credenciais não entram no ADR.

## Processo de mudança

1. Descrever objetivo, contexto afetado, riscos, comportamento anterior e critérios de aceite.
2. Para API: atualizar `lib/api-spec/openapi.yaml`, executar `pnpm --filter @workspace/api-spec run codegen` e atualizar todas as chamadas e estados da interface.
3. Não editar arquivos gerados manualmente.
4. Escrever teste de regressão para defeitos e testes de invariantes para regras financeiras.
5. Executar `pnpm quality`; revisar o diff, inclusive fontes/exports regenerados.
6. Solicitar revisão para autenticação, dinheiro, chaves, smart contracts, migrações ou permissões.
7. Planejar migração, compatibilidade, recuperação e observabilidade antes de implantar.

## Dados e contratos

- Identidade e autorização são derivadas no servidor. IDs enviados pelo cliente não provam propriedade.
- Produção financeira usa unidades inteiras e escala por ativo; `number` e estado JSONB demonstrativo não são um ledger.
- Não converter saldo demonstrativo em saldo real nem importar histórico fictício para o ledger.
- Toda mutação financeira tem idempotência, escopo de identidade, correlação e payload validado. Reutilizar uma chave com payload diferente é erro.
- Um limite de exibição nunca elimina operações pendentes. Histórico durável e paginação são necessários antes da produção.
- Mudança de esquema é versionada e compatível com versões antigas durante a implantação. DDL automática de inicialização não é política de migração de produção.
- Contratos entre serviços são versionados; erros, autenticação e estados incertos são parte do contrato.

## Código, interface e dependências

- TypeScript estrito; evitar `any`, coerções sem validação, arquivos gigantes e duplicação de regras.
- Preservar convenções do workspace pnpm, paths dos artifacts e proxy de autenticação.
- Dependências via pnpm e lockfile; não usar `latest` nem atualizar bibliotecas principais sem justificativa.
- CI com permissões mínimas e Actions fixadas por commit; nenhuma publicação automática neste workflow.
- Idioma selecionado consistente, acessibilidade por teclado/toque e layout mobile.
- Horários exibidos em São Paulo, sem alterar os instantes internos e a duração dos ciclos.
- Não alterar homepage, Pitch ou regras econômicas aprovadas para acomodar uma refatoração.
- Não registrar tokens, cookies, senhas, chaves ou dados pessoais desnecessários.

## Definition of done

- Contrato, autorização, implementação, interface e estados de erro completos.
- Testes e builds passando; migrations e rollback documentados quando aplicável.
- Sem comandos pendentes descartados, dupla contabilização ou resultados fictícios apresentados como reais.
- Documentação descreve corretamente o estado implementado, sem afirmar serviços/integrações inexistentes.
- Para operações cripto: cumprir os gates da arquitetura; CI verde sozinha não autoriza mainnet.