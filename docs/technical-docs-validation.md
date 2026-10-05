# Validação da base técnica

Registro da implementação e coleta real em 5 de outubro de 2026. Não certifica integrações financeiras nem cobertura integral.

## Cobertura do lote verificado

Textos únicos por hash da representação normalizada; controles, árvores de repositório e exports agregados não entram nessa contagem. URLs alternativas podem apontar para o mesmo texto.

| Plataforma | Textos técnicos únicos | URLs técnicas preservadas |
| --- | ---: | ---: |
| Arbitrum | 974 | 988 |
| Ethereum | 514 | 627 |
| Allora | 237 | 240 |
| Robinhood | 2 | 4 |
| Polymarket | 582 | 586 |

A contagem é um snapshot, não um teto. A continuação da coleta Ethereum estava em andamento após esse lote, com 1.356 recursos pendentes. Consultar `pnpm docs:status` para o estado posterior.

Falhas de recursos/descoberta no snapshot: Arbitrum 61, Ethereum 268, Allora 2, Robinhood 1 e Polymarket 9. Isso inclui endpoints auxiliares sem conteúdo técnico, referências ausentes, bloqueios HTTP e índices de SDK/repositórios não verificados. Não significa indisponibilidade de todos os documentos da plataforma.

Exclusões registradas: idiomas duplicados, assets/conteúdo fora do escopo, domínios/proprietários não validados, referências malformadas e endpoints opcionais inexistentes. **A base é parcial.**

## Evidências executadas

- Coleta HTTPS real nas cinco fontes. Robinhood: JSON OpenAPI publicado em módulos de página oficiais, lido sem executar JavaScript.
- Consultas executadas pelo agente: Allora (`signed inference authentication`), Polymarket (`Gamma API authentication`), Robinhood (`authentication signature`) e Ethereum (`transaction gas`). Retornaram trecho, URL/origem, datas, versão disponível e hash.
- Após repetir sincronização: as **2.120 referências do baseline** mantiveram o mesmo hash com o mesmo identificador de revisão; **zero grupos de revisões duplicadas** por documento/hash e nenhuma perda do baseline.
- **23 testes** da ferramenta aprovados: mudança controlada e consulta histórica, preservação da última cópia válida, recuperação de falha, bloqueio concorrente, persistência, 304, deduplicação, procedência, robots, SSRF e dados externos sem autoridade.
- Integridade verificada: SQLite `ok`; nenhuma falha de hash nos originais e textos normalizados do lote.
- `pnpm quality` aprovado, incluindo arquitetura, testes, TypeScript, backend, build/localização e documentos do frontend. A etapa da ferramenta também foi reexecutada após seu último ajuste.
- Homepage permaneceu carregando; não foi acrescentada interface para a base.

## Versões e impacto

Inventário não encontrou SDK correspondente adotado nem fonte/configuração Solidity no escopo atual. Portanto não foi presumida compatibilidade de versões nem adotado compilador.

Git blob/tree são identificadores próprios, não commits. Onde o publicador não fornece versão, o resultado declara documentação atual sem versão explícita. Diff oficial e classificação/impacto potencial derivados são separados; coleta não altera código operacional, dependências ou produção.

## Agendamento real

**Diário inativo.** Há comando de sincronização e contrato de integração em `tools/technical-docs/schedule.json`. A continuação em segundo plano é coleta inicial limitada, não scheduler.

Job publicado requer armazenamento compartilhado durável, separado dos dados financeiros, e autorização de publicação. O workspace atual e o disco de um Scheduled Deployment não devem ser presumidos compartilhados ou persistentes entre execuções publicadas.

Procedimentos e responsabilidades: [base técnica](technical-documentation.md), `AGENTS.md` e decisão arquitetural 0005.
