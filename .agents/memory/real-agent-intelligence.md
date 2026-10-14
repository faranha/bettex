---
name: Real AI within BETTEX agents
description: Real inference, honest provenance, and evidence-bounded model citations.
---

BETTEX agents must include actual AI inference. Deterministic controls are useful for accounting, permissions and safety, but must not be presented as the agents' intelligence or as a substitute for real model reasoning.

**Why:** The creator explicitly rejected an agent system consisting exclusively of deterministic bots and called the absence of AI a serious failure.

**How to apply:** Distinguish model-generated reasoning, external model observations and fixed-rule checks. Show real model provenance and source evidence. Describe on-demand analysis, autonomous scheduling and financial execution separately; do not claim capabilities that have not been implemented or verified.

## Etapas da seleção de ordens

Inicialmente, os critérios de seleção são determinísticos. A decisão probabilística deve ser implementada na ALFA ou na BETA; no demo não é possível comprová-la com absoluta garantia.

**Why:** O criador pediu critérios de seleção claros no bloco de ordens do agente BETTEX e definiu explicitamente essa progressão.

**How to apply:** Distinguir o ponto de partida determinístico da inteligência probabilística futura. Não exigir inferência operacional do demo visual nem apresentá-lo como prova dessa capacidade. Registrar método e versões usados na decisão, preservando aprovação independente e controles de risco mesmo após a evolução probabilística.

## Visão técnica e apresentação da documentação

O criador definiu: “apresentar o que foi feito como linha de base, ponto de partida”, mas “o verdadeiro projeto é desenvolver uma IA capaz de partir deste ponto”, sem saber antecipadamente onde chegará; “essa incógnita é o verdadeiro valor do negócio”. Trabalhar mais os agentes e menos as regras. A documentação é visão técnica, não business case.

**Why:** O criador rejeitou a abordagem de tentar resolver todas as definições ou fortalecer regras no lugar de desenvolver inferência e inteligência. Confirmou: “finalmente migramos de uma visao deterministica para uma visao agentica”.

**How to apply:** Apresentar a inteligência central BETTEX servida pelos agentes especializados e seus parâmetros iniciais. Não apresentar governança por governança: apresentar seu agente e sua inteligência. Manter regras econômicas e controles essenciais como linha de base, sem inventar definições ausentes nem anunciar inteligência futura como entregue.

A própria documentação é uma linha de base para o desenvolvimento, não uma inteligência já entregue.

**Why:** O criador corrigiu a referência vaga à “linha de base”: “Esta documentação é uma linha de base” e pediu que isso fosse apresentado de forma compreensível.

**How to apply:** Nomear explicitamente a documentação como a linha de base e explicar que ela registra as definições iniciais; evitar referências sem antecedente como “a partir dela”.

A documentação deve tratar a inteligência central como **agente BETTEX** e as especialidades como **subagentes**.

**Why:** O criador definiu: “entao vamos tratar assim agente bettex, e subagentes” e “assim deve ser na documentacao”.

**How to apply:** Usar agente BETTEX para o coordenador com inteligência própria; subagentes para risco, governança, tesouraria e mercados; sistema BETTEX para a arquitetura completa. Preservar análise bidirecional e validação independente, sem apresentar as especialidades como outras BETTEX independentes.

Apresentar a identidade da BETTEX e os papéis dos agentes no presente: “é”, “somos”, não “será” ou “seremos”.

**Why:** O criador reiterou: “nunca fale no futuro, é, o agente é” e “somos, nao seremos, é presente”.

**How to apply:** Usar presente nas definições e descrições dos agentes, inclusive traduções. Separar a definição da arquitetura da disponibilidade operacional comprovada; o tempo verbal não autoriza declarar integrações, autonomia ou resultados validados sem evidência.

O foco do agente BETTEX é orquestração; ele opera com apoio dos subagentes de risco e tesouraria para a tomada de decisões.

**Why:** O criador corrigiu: “o bettex opera com apoio de SUB AGENTES DE RISCO E TESOURARIA para tomada de decisoes, e seu foco é orquestracao”.

**How to apply:** Destacar o foco de orquestração e esse apoio também nos resumos e esquemas, além da visão, da definição do agente e da apresentação dos subagentes. Não apenas mencionar risco e tesouraria ao fim de uma lista de mercados. Preservar inteligência própria e validação independente; não reduzir orquestração a encaminhamento mecânico de tarefas.

“Agente” é masculino: “o agente BETTEX será desenvolvido”.

**Why:** O criador corrigiu explicitamente a concordância após a mudança de “IA” para “agente”.

**How to apply:** Ao trocar nomenclatura, revisar também artigos e adjetivos, inclusive nos textos renderizados e rótulos dos diagramas. Não masculinizar frases cujo sujeito continue sendo “inteligência”.

A abertura e a visão inicial da documentação devem apresentar subagentes de trading para esports, iGaming, cripto e predictions, e a audiência: pessoas que hoje apostam, tratando apostas como investimento.

**Why:** O criador exigiu que os mercados e a audiência apareçam já na visão inicial, não apenas em capítulos posteriores.

**How to apply:** Manter essas informações na descrição de entrada, na Visão e na descrição do trabalho do agente, nos três idiomas. Apresentar desenvolvimento e pesquisa sem afirmar operação concluída nem prometer retorno; não alterar Homepage ou Pitch por esse pedido.

Cada mercado tem um subagente próprio que se comunica com a inteligência central, o agente BETTEX; não existe um único subagente genérico de mercados.

**Why:** O criador corrigiu explicitamente a descrição dos subagentes.

**How to apply:** Apresentar especialização por mercado e comunicação com BETTEX, inclusive nos resumos e na hierarquia. Inteligência central de coordenação não significa operador centralizado.

A abertura da documentação deve explicitar a migração de DeFi para DeFi AI (DeFAI), com um agente descentralizado, 100% autônomo e independente, sem operador centralizado.

**Why:** O criador exigiu esse conceito na abertura.

**How to apply:** Apresentar autonomia total e descentralização como direção de desenvolvimento, preservando a distinção entre objetivo e capacidade atual.

O subagente de governança deve ter a função de atualizar a documentação.

**Why:** O criador pediu explicitamente: “no subagente de governança adicione a funcao de atualizar a documentacao”.

**How to apply:** Incluir essa responsabilidade na visão técnica, sem confundir atualização documental com aprovação de políticas ou alteração de direitos.

O criador reiterou: “tme cuidado para nao repetir os erros de formatacao que ja corrigimos”.

**Why:** Já houve junções de palavras e espaços ausentes nas revisões da documentação.

**How to apply:** Conferir a prosa renderizada nos três idiomas, incluindo limites de elementos inline, pontuação e apresentação responsiva; não confiar somente nos textos-fonte.

Constrain model citations to the evidence actually supplied; when the evidence list is empty, forbid citations and evidence-backed monitoring.

**Why:** A healthy provider can return valid structured JSON with nonexistent evidence references. BETTEX correctly rejects that analysis, which can otherwise be mistaken for an inference outage.

**How to apply:** Match structured-output bounds to downstream validation before inference. Preserve the final provenance checks; never silently remove invalid citations or replace rejected analysis with deterministic text.
