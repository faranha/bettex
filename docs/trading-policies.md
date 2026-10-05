# Políticas de trading, alpha e alocação

## Escopo e responsabilidade

As pendências de integração e decisões do criador são acompanhadas em [Integrações Allora e Polymarket](integration-pendencies.md). A existência destas políticas não encerra as lacunas de dados/modelo nem autoriza contorná-las.

O módulo de risco possui definições, composição e governança. Agentes preservam evidências e avaliações; execução possui o ciclo paper; o subledger pertence ao ledger; o histórico utiliza o módulo de auditoria existente. Não há serviço paralelo, custódia nova nem configuração executável arbitrária.

Esta entrega é exclusivamente de desenvolvimento/simulação. Não publica administração de produção, não abastece o subledger, não emite mandatos, não envia ordens à Polymarket e não autoriza alocação real. Os parâmetros conservadores do primeiro conjunto são técnicos, não uma aprovação econômica.

## Fonte e publicação

- Princípios/metodologia: esta documentação e as decisões arquiteturais.
- Definições canônicas: `artifacts/api-server/src/modules/risk/domain/policies/{global,strategy,btc,eth,sol}.vN.json`.
- Banco: versões publicadas imutáveis, controle de ativação por ambiente e eventos de mudanças append-only.
- Evidências: registros existentes de oportunidades, decisões, ordens e posições em JSONB. Os livros observados incluem preços/tamanhos, horários, hash e metadados do evento; a captura limita cada lado a 100 níveis e informa explicitamente truncamento. Um livro truncado não comprova profundidade executável.

Criar um arquivo `*.v2.json`, indicar `previousVersion` com `id/1`, revisar e fazer commit. Não editar uma versão publicada para mudar comportamento. A descoberta seleciona a maior versão numerada de cada chave; um arquivo não commitado permanece rascunho. A publicação lê o conteúdo do commit Git indicado, valida schema, escopo, ancestralidade e implementações conhecidas e grava conteúdo/hash/commit/caminho/autor/justificativa. O banco não é outro editor de parâmetros.

Sem Git verificável, não se declara proveniência fictícia nem se publica a partir de um arquivo solto. O resolvedor operacional lê somente versões publicadas do banco.

Fluxo: rascunho no Git → versão validada/publicada → aprovação humana independente do autor → ativação humana autorizada. Substituição preserva a versão anterior; rollback reativa uma versão anterior aprovada, sem apagar operações. Revogação remove a ativação e bloqueia entradas.

## Composição e controles

Tesouraria/global → estratégia/predictions → especialista/BTC, ETH ou SOL → ambiente.

Limites máximos, idade dos dados, horizonte, perdas e tentativas só podem diminuir nas camadas inferiores. Reserva defensiva, espera entre tentativas, limiar de vantagem e cooldown só podem aumentar. Ativos, mercados e fontes só podem virar subconjuntos não vazios. Exigências de modelo calibrado, custos completos, plano de saída e conciliação não podem ser desligadas. Uma camada inferior não desliga a suspensão superior.

O resolvedor retorna a configuração, IDs das três versões, hashes, implementações e um identificador SHA-256 da composição. A revisão de governança identifica o instante de leitura, mas alterações em outro especialista não mudam a identidade econômica desta composição.

A captura pública continua registrando observações sem política ativa, mas não as qualifica. Com política ativa, oportunidades ficam vinculadas à composição e preservam os termos utilizados. A mesma função de risco verifica qualificação, seleção, pré-ordem e cada fill simulado. Fontes não autorizadas, estimativas ausentes, custos incompletos, dados vencidos e composição desatualizada bloqueiam entrada.

Resolução para seleção, criação da ordem e fill ocorre na mesma transação/lock do subledger paper. Ativação usa o mesmo advisory lock, impedindo alteração de política entre conferência e reserva/postagem. BTC, ETH e SOL competem pelo mesmo capital e exposição; uma alteração em BTC não libera a reserva de ETH.

Decisões preservam candidato e snapshot da política. Ordens preservam cotações submetidas e utilizadas nos fills. Posições preservam política e plano de saída originais; controles emergenciais atuais podem apertar idade da cotação, prazo máximo e limite de perda. Entradas pendentes ficam sujeitas à reanálise/cancelamento, sem reescrever posições abertas. Registros antigos sem snapshot publicado exigem revisão explícita; não recebem uma política presumida.

Eventos de execução registram composição original, composição conferida e diferenças por campo. Ativação, revogação e rollback registram ator, motivo, revisão e diferenças. O lucro paper não vira distribuição nem lucro da tesouraria.

## Administração e permissões

Interface: Tesouraria → Políticas, também acessível por Minha conta.

API: `GET /api/treasury/policies` e `POST /api/treasury/policies`.

Usa a sessão nativa e as permissões existentes de contas de teste. Leitura exige `treasury_view`; proposta `treasury_propose`; publicação `treasury_policy`; aprovação `treasury_approve`; ativação/rollback `treasury_activate`; revogação `treasury_pause`. Agentes podem propor, nunca aprovar/ativar. Aprovação pelo próprio autor é recusada no servidor.

Comandos exigem CSRF, origem permitida, justificativa e revisão esperada. Permissões são conferidas no servidor/na transação; botões visíveis não concedem autoridade. Mudanças de sessão limpam caches do painel. Não há concessão automática de autoridade para testar esta entrega.

A tela mostra fontes/commits/hashes, versões/estados/aprovações, composição vigente por especialista, operações abertas afetadas e auditoria. A consulta mostra as 200 versões/mudanças mais recentes e inclui versões ativas mais antigas; o banco mantém todo o histórico.

Produção recusa estes comandos: a governança hoje está ligada às contas de teste de desenvolvimento. Habilitar governança de produção requer identidade/permissões próprias, processo de publicação confiável e revisão operacional separada.

## Exemplo rastreável BTC/ETH/SOL

1. Publicar e aprovar `prediction-simulation-policy/1`, `event-probability-hold/1` e `prediction-{btc,eth,sol}/1` a partir do commit das definições.
2. Ativar global e estratégia e, separadamente, cada especialista. A ausência de qualquer camada deixa aquele ativo bloqueado.
3. Abrir Central da IA. Para uma observação BTC, a composição vincula `development:treasury:prediction-simulation-policy/1`, `development:strategy:event-probability-hold/1` e `development:specialist:prediction-btc/1`. ETH/SOL substituem somente a terceira camada e têm identificadores próprios.
4. O percurso da oportunidade preserva snapshot, fontes, horários, modelo/probabilidade (ou a sua ausência), custos/liquidez (ou ausência), decisões e versões. Mesmo com a política ativa, o coletor atual não tem modelo de probabilidade calibrado nem cotação completa: solicita atualização e mantém capital, não inventa retorno.
5. Se futuramente houver proposta completa e orçamento/mandato **simulados** aprovados, a seleção reserva capital; a ordem e cada fill conferem novamente a composição e os controles. Mudança incompatível exige nova análise. O exemplo sintético dos testes verifica esta conferência, sem gravar oportunidade fictícia no aplicativo.
6. Ativar uma versão global mais restritiva registra diferenças e torna entradas antigas incompatíveis. Posições já abertas continuam vinculadas ao snapshot original, com acompanhamento emergencial. Rollback altera somente a versão vigente e fica auditado.

## Verificação

`check:trading-policies`, `check:agents` e `check:paper` no API server verificam schema/Git, composição sem afrouxamento, idempotência, aprovação independente, ativação/rollback/revogação, identidade vigente, subledger, execução parcial e isolamento entre especialistas.

Pendências econômicas anteriores permanecem: probabilidade calibrada do evento, custos/spread/slippage e profundidade completos, feed de resolução e autorização de orçamento/mandato simulado. Esta infraestrutura não comprova vantagem econômica nem autoriza trading real.
