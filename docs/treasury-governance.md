# Tesouraria e Governança BETTEX

Documento canônico da capacidade de controle. Fonte de escopo: [instrução do criador](../attached_assets/Pasted-Comece-agora-pela-documenta-o-e-implementa-o-do-agente-_1791180687506.txt), linhas 1–88. A arquitetura de [domínios](architecture.md) permanece obrigatória: isto não é um novo sistema financeiro paralelo.

## Orçamento do ramo de previsões (simulação)

A [política versionada de previsões](prediction-paper-trading.md) não é política financeira definitiva. A projeção de caixa simulado mostra separadamente disponibilidade após defesa e obrigações, reservas de decisões/ordens, custo de posições abertas, exposição e resultado realizado; resultado não realizado ou pagamento hipotético nunca integra lucro distribuível. O orçamento começa **não autorizado** (sem saldo, não com saldo zero). Nenhum valor da EVM local, da emulação do aplicativo ou da Tesouraria nativa financia implicitamente esse subledger. Qualquer futura aprovação de orçamento/mandato exigirá autorização específica para simulação e conciliação antes de registrar execução.

## Propriedade e limites

| Responsabilidade | Componente responsável |
|---|---|
| Análise, explicação e proposta | `agents`, somente porta pública de `risk` |
| Política versionada, autorização e governança | `risk` |
| Journal, capital, reservas, obrigações e recursos disponíveis | `ledger` |
| Identidade, sessão e permissões | `accounts` |
| Transação, nonce, envio incerto e retomada | `execution`, executor nativo existente |
| Carteiras, RPC e verificação de receipt/efeitos | Adaptadores `wallets` e `reconciliation` existentes |
| Ator, versão, motivo, etapa e resultado duráveis | Histórico compartilhado `audit` |

O agente não possui chaves, voto, autoridade para mudar direitos, nem acesso direto a executor, carteiras ou tabelas financeiras. Recursos pessoais não são recursos da tesouraria. O controlador de desenvolvimento opera somente USDC de teste da tesouraria atestada da EVM local 31337. Reserva de abastecimento, carteira de taxas, pool de venda, beneficiários/vesting e carteira de recompra permanecem distintos. BETTEX não é emitido nem transferido por este controlador.

## Fontes das regras

| Regra | Fonte e interpretação |
|---|---|
| Proposta → validação → autorização → execução → confirmação | Instrução, linhas 55–63; arquitetura/decisões vigentes |
| Capital não é lucro | Instrução, linhas 29–35. Mints/funding/venda permanecem entradas de capital; transferência sem prova de resultado não vira receita operacional |
| Não usar recursos duas vezes | Linhas 31/63/78. Reserva persistida e serialização por epoch da tesouraria, incluindo rodada local |
| Mudanças aprovadas pela liderança; mandatos operacionais limitados | replit.md, regras da Fundação; a liderança aprova a política, não concede acesso financeiro irrestrito à IA |
| Não há voto societário de titulares | Linhas 51–53. Não se cria eleição/token voting |
| Retenção/distribuição/recompra 50/25/25, frações retidas; saída cancela direitos não pagos | replit.md, [rodada local](decisions/0010-local-round-settlement.md). O agente reutiliza este cálculo, não paga capital como lucro |
| Incerteza não autoriza reenvio | Journal/nonce do executor existente; receita/resultado só confirmados após receipt e efeitos |

## Mandato inicial de teste — hipótese reversível, não termos econômicos

A inicialização exige `treasury_policy` e cria versão 1 **pausada**, limitada à epoch/ativo/carteira atestados. Configuração inicial: reserva defensiva 500.000 micro-USDC (0,50), alocação individual máxima 250.000 (0,25), teto agregado por dia UTC 500.000 (0,50). Destino inicial: oitava conta do nó descartável, exclusivamente carteira de agente de teste. Não é carteira institucional pública.

Valores são hipóteses conservadoras de fixture, conforme autorização de configurações reversíveis na revisão anterior; precisam de proposta/aprovação/ativação para mudar. Custos, posições e tributos externos não são inventados. Não se promete rentabilidade. O patrimônio exibido é caixa conciliado desta carteira/ativo; recursos alocados são exposição separada, não saldo livre nem resultado realizado.

Recursos disponíveis = máximo(0, caixa conciliado − reserva defensiva − obrigações de rodadas − reservas de alocação). Limites do dia incluem operações autorizadas/em execução/confirmadas; cancelamento/rejeição libera somente o que nunca foi enviado. Incerteza conserva reserva. Divergência entre journal e blockchain bloqueia novas movimentações.

## Papéis, permissão e segregação

Permissões específicas em `accounts`: `treasury_view`, `treasury_propose`, `treasury_approve`, `treasury_execute`, `treasury_pause`, `treasury_policy`, `treasury_activate`. `treasury_history` existente não concede autoridade de movimentação.

- Agente pode propor alocação por porta restrita; não aprova, executa, concede permissão ou altera política.
- Humanos autenticados e habilitados podem propor; aprovação exige outro humano, com permissão atual.
- Política/destinos/permissões exigem proposta humana, aprovação por outro humano com `treasury_approve` e `treasury_policy`, e ativação explícita com `treasury_activate`. Ativar configuração não exige a permissão financeira `treasury_execute`.
- Pausa exige `treasury_pause`; retomar exige `treasury_activate`. Pausar não apaga propostas, reservas, receipts ou envios iniciados.
- O cliente nunca escolhe seu ator/papel. São verificados no servidor antes de cada ação; revogação invalida execução ainda não enviada.
- Não há endpoint de auto-bootstrap de privilégios. Provisionamento dos papéis iniciais é responsabilidade administrativa explícita; o teste provisiona apenas contas descartáveis.

## Contratos HTTP e estados

`GET /api/treasury/governance`: caixa, capital observado, resultado realizado não inferido, reserva, obrigações, capital historicamente alocado, política vigente, propostas/estados e resumo agregado de distribuições/retenção/recompra do modelo local. A auditoria detalhada permanece no histórico compartilhado; não retorna informações pessoais de beneficiários.

`POST /api/treasury/governance`: comandos tipados de analisar/propor/aprovar/rejeitar/executar/pausar/retomar. Origem, sessão pessoal de desenvolvimento, CSRF e permissão são obrigatórios; não aceita identidade fornecida pelo cliente. Observar utiliza GET. Clientes/validadores são gerados pelo OpenAPI existente.

Proposta: `proposed → approved → confirmed`, ou `rejected`; envio inconclusivo fica `uncertain`. A execução possui journal nativo separado (`requested → sending → sent → confirmed/uncertain/failed`), persistido antes do broadcast. Aprovar congela a versão e reserva recursos. Mudar a versão exige nova autorização; proposta antiga não passa automaticamente sob nova regra. Permissionamento/destinos entram em vigor apenas na ativação confirmada, nunca na sugestão ou aprovação isolada.

Antes do envio: reler política/permissão, versão, destino, pausa, caixa e obrigações; manter reserva própria fora da soma de outras reservas. Serialização por epoch protege contra aprovações/pausa/distribuições concorrentes. A reserva e aprovação são duráveis antes do efeito externo; o journal nativo persiste etapa/nonce antes do broadcast. Após falha, consultar a mesma operação/nonce/hash. Mesmo ID com outros termos é conflito.

## Falhas e critérios de conclusão

Testar: journal versus saldo; classificação de capital; proposta por agente; aprovação segregada; limite individual/diário; saldo/obrigação concorrente; revogação; política/destino alterados; pausa; repetição; envio incerto e reconciliação sem novo envio; receipt/efeitos/histórico; retomada sobre mesmo banco/chain.

A primeira prova local deve usar PostgreSQL vazio com sequências próprias e EVM separada. Não modificar conta administrativa ou blockchain principal. Prova pública exige operador, contratos/ativo publicados, custódia/autorização e funding verificáveis; essas dependências não estão estabelecidas. EOA local não é multisig institucional nem controle atômico financeiro de produção. Limites de reorg da implementação do journal continuam documentados; não anunciar certificação de produção.

## Fontes de entrada e eventos

- Caixa vem da blockchain atestada e deve coincidir com o journal reconstruído dos eventos ERC-20.
- Compras diretas e pelo aplicativo têm receipts/efeitos conferidos antes de classificadas como capital. Funding explicitamente identificado na fixture é capital de teste. Injeção do modelo de rodada é segregada como sintética; entradas desconhecidas ficam por classificar, nunca como lucro.
- Obrigações, distribuições, retenção e destinação de recompra vêm do `ledger` existente. Resultado/retenção do modelo sintético são identificados como tal. Recompra local significa destinar USDC à carteira de teste; não comprova compra externa nem queima de BETTEX.
- O resultado realizado externo permanece `null` sem evidência; capital alocado não representa lucro ou avaliação de posições externas.
- `audit` registra proposta, validação, aprovação/rejeição, validação pré-execução, ativação, pausa/retomada, falha e confirmação. O executor existente registra intenção, nonce e transições antes do envio, inclusive para contas de sistema com visibilidade administrativa.
- Receipt perdido ou inconsistente após reorg bloqueia relatório financeiro e novas alocações, sem reenviar nem liberar a exposição. Repetir confirmação consulta novamente a mesma transação. A quarentena exige recuperação comprovada ou intervenção, não autorização implícita para redistribuir recursos.
- Pausa cobre novas alocações e saídas da rodada controlada desta epoch; não desfaz envio iniciado nem bloqueia login, observação ou entrada de capital. Nesta implementação local, as rotas exigem RPC/contrato atestáveis; disponibilidade offline de administração e custódia institucional são pendências de produção.

## Integração e comandos de verificação

| Parte | Local |
|---|---|
| Agente de observação/proposta | `modules/agents/application/treasury-governance.ts` |
| Regras e controlador determinístico | `modules/risk/domain/governance.ts`, `modules/risk/application/treasury-governance.ts` |
| Políticas e decisões persistidas | `modules/risk/infrastructure/governance-store.ts` |
| Reservas e integração com rodadas | `modules/ledger/infrastructure/treasury-reservations.ts`, `local-round-store.ts`, composição `routes/local-round.ts` |
| Permissões | `modules/accounts/infrastructure/treasury-permissions.ts` |
| Execução e recuperação | `nativeJourney`, `journeyStore`, `journeyChain` existentes |
| Entrada HTTP e conciliação | `routes/treasury-governance.ts`, `routes/treasury-resources.ts` |
| Migração aditiva, sem concessão de papéis | `lib/db/migrations/20261005_treasury_governance.sql` |

Os caminhos de módulos/rotas são relativos a `artifacts/api-server/src/`. Não foi criado painel novo ou integração de LLM: a análise inicial é determinística e a porta permite receber propostas de IA sem dar autoridade financeira à resposta.

### Alinhamento com a hierarquia de agentes

A [hierarquia canônica](agent-hierarchy.md) substitui a alocação automática limitada que o agente de Tesouraria sugeria na primeira fixture. Tesouraria agora observa controles; BETTEX seleciona oportunidades validadas pelo Mercado de Previsões e pelo Especialista BTC. `analyze` compara registros do alpha, não inventa oportunidade nem escolhe investir o teto disponível.

Na composição atual, exposição externa não é conciliada: esse dado permanece indisponível e bloqueia seleção financeira. A observação real de Gamma/CLOB não fornece modelo, capital ou retorno calibrado. Por isso a operação normal mantém recursos disponíveis; cenários completos são verificados em fixtures internas.

Propostas `alpha:<opportunityId>` exigem decisão persistida, capital idêntico, validade e evidência de book/mercado atuais antes de aprovação e novo envio. Após envio iniciado, recuperação utiliza o mesmo journal/receipt mesmo se a cotação tiver vencido; vencimento nunca autoriza reenviar. Eventos de governança/execução são projetados na mesma oportunidade, sem tratar alocação local como ordem externa.

```bash
pnpm --filter @workspace/api-server run check:treasury
pnpm --filter @workspace/api-server run check:treasury-integration
pnpm quality
```

O teste integrado cria esquema PostgreSQL vazio com suas próprias tabelas/constraints e EVM separada; provisiona três identidades descartáveis, somente duas com papéis de tesouraria. Confere capital de 5 USDC, reserva de alocação de 0,25, pausa/retomada, transferência/receipt, conciliação de caixa de 4,75 e alocação de 0,25. Reinicia o backend no mesmo banco/chain entre envio e projeção de governança, retoma sem duplicar e confere histórico. Depois invalida a transferência por reorg e verifica bloqueio conservador. Ao final, encerra processos e remove o esquema. Nada é provisionado na conta administrativa ou blockchain principal.

### Evidência verificada — 5 de outubro de 2026

- Ambiente: EVM local isolada, `chainId 31337`; **não é testnet pública**.
- Capital conciliado: 5.000.000 micro-USDC; alocação: 250.000; caixa: 4.750.000; reserva de alocação pendente: 0, no checkpoint confirmado anterior ao teste de reorg.
- Hash da alocação: `0xffdccd14c4df9a58de9c9ad2cb4d17c844cd65add8eb6268b03396dea365e173`; receipt `status 1`; saldo do destino conferido; uma etapa de journal e uma confirmação de governança.
- Backend reiniciado no mesmo banco/chain após a transferência e antes da projeção final: mesma transação reconciliada, sem duplicação.
- Sem permissão: 403; autoaprovação: 403; nova execução durante pausa: 409.
- Após invalidar o checkpoint: relatório/execução bloqueados com 503, sem reenviar a operação. Se o reorg encurta a chain, o journal existente trata bloco ausente como indisponibilidade, não como permissão para recuperar saldo livre.
- Resultado externo realizado: `null`. Resumo de resultado/distribuição do modelo: zero neste ciclo, sem rendimento inventado.
- `pnpm quality`: passou, com 163 testes nas suítes registradas, compilação/checagens e busca de padrões de segredo sem achados. Isso não é certificação financeira ou auditoria completa de segurança.
- Fixture encerrada e esquema descartável removido. A EVM principal permaneceu parada; identidade, privilégios e saldos administrativos existentes não foram modificados.
