# Revisão arquitetural — 5 de outubro de 2026

Revisão independente do arquiteto, somente leitura, dos arquivos de identidade, persistência, emulação, orquestração, schemas, contratos e interface de conta. Não é auditoria de segurança/smart contracts nem certificação de produção.

## Resultado

A base existente é reutilizável para desenvolver o produto, mas **não está pronta para dinheiro real**. Há transações, verificação de identidade e idempotência demonstrativa; faltam ledger financeiro, custódia, assinatura, integração de execução e histórico completo.

## Achados e tratamento

| Prioridade | Evidência | Tratamento |
| --- | --- | --- |
| Defeito atual | `api-server/src/lib/demo-state.ts`: corte do histórico descartava pendentes antes da liquidação | Corrigido: preservar todos os pendentes; regressão de 125 créditos e repetição de liquidação |
| Bloqueador financeiro | `lib/db/src/schema/demo.ts`, `demo-state.ts`: JSONB, seed e `number` | Ledger com precisão por ativo; não converter dados demonstrativos em recursos reais |
| Histórico incompleto | `demo-state.ts`: retenção limitada de eventos, operações encerradas e rodadas | Persistência normalizada e paginação; fila/históricos da Central continuam pendentes |
| Escalabilidade | `demo-store.ts`: lock compartilhado e consulta de todas as contas | Medir, separar responsabilidades e redesenhar projeções antes de ampliar carga |
| Política de risco | `orchestrator.ts`: percentuais/score ilustrativos e execução automática emulada | Mandatos aprovados, versionados e verificados antes de execução real |
| Carteiras ausentes | Interface de conta e backend sem provisionamento/assinatura on-chain | Decidir custódia, exportação e recuperação antes de implementar |
| Repositório | Ausência de entrada técnica, ADRs e pipeline abrangente | README, arquitetura, regras, segurança, threat model e CI adicionados |

Os caminhos abreviados `api-server/...` acima pertencem a `artifacts/api-server/...`. Não se alega violação grave de segurança comprovada.

## Entregas desta organização

- Revisão registrada e fronteiras dos contextos definidas.
- Correção do descarte de movimentações pendentes, sem migração de dados.
- Comando `pnpm quality` e workflow GitHub de validação sem publicação.
- Padrões de contratos, precisão, segurança, revisão e critérios de conclusão.
- Distinção explícita entre código implementado e arquitetura-alvo.

## Decisões ainda necessárias

- Custódia, exportação de chaves, recuperação e responsabilidade operacional.
- Contratos e provedores efetivamente utilizáveis, redes e ativos permitidos.
- Política de risco e mandatos aprovados pela Fundação.
- Custos, tributos, obrigações e liquidez aplicáveis à apuração real.
- Local de execução dos serviços e requisitos de disponibilidade.
- Licença/direitos dos assets, canal privado de segurança e proteção de branches no GitHub.

Não se iniciou uma refatoração ampla nem se ativou custódia, trading, publicação ou transferência financeira.