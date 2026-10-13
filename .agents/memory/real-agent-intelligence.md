---
name: Real AI within BETTEX agents
description: Real inference, honest provenance, and evidence-bounded model citations.
---

BETTEX agents must include actual AI inference. Deterministic controls are useful for accounting, permissions and safety, but must not be presented as the agents' intelligence or as a substitute for real model reasoning.

**Why:** The creator explicitly rejected an agent system consisting exclusively of deterministic bots and called the absence of AI a serious failure.

**How to apply:** Distinguish model-generated reasoning, external model observations and fixed-rule checks. Show real model provenance and source evidence. Describe on-demand analysis, autonomous scheduling and financial execution separately; do not claim capabilities that have not been implemented or verified.

## Visão técnica e apresentação da documentação

O criador definiu: “apresentar o que foi feito como linha de base, ponto de partida”, mas “o verdadeiro projeto é desenvolver uma IA capaz de partir deste ponto”, sem saber antecipadamente onde chegará; “essa incógnita é o verdadeiro valor do negócio”. Trabalhar mais os agentes e menos as regras. A documentação é visão técnica, não business case.

**Why:** O criador rejeitou a abordagem de tentar resolver todas as definições ou fortalecer regras no lugar de desenvolver inferência e inteligência. Confirmou: “finalmente migramos de uma visao deterministica para uma visao agentica”.

**How to apply:** Apresentar a inteligência central BETTEX servida pelos agentes especializados e seus parâmetros iniciais. Não apresentar governança por governança: apresentar seu agente e sua inteligência. Manter regras econômicas e controles essenciais como linha de base, sem inventar definições ausentes nem anunciar inteligência futura como entregue.

O criador reiterou: “tme cuidado para nao repetir os erros de formatacao que ja corrigimos”.

**Why:** Já houve junções de palavras e espaços ausentes nas revisões da documentação.

**How to apply:** Conferir a prosa renderizada nos três idiomas, incluindo limites de elementos inline, pontuação e apresentação responsiva; não confiar somente nos textos-fonte.

Constrain model citations to the evidence actually supplied; when the evidence list is empty, forbid citations and evidence-backed monitoring.

**Why:** A healthy provider can return valid structured JSON with nonexistent evidence references. BETTEX correctly rejects that analysis, which can otherwise be mistaken for an inference outage.

**How to apply:** Match structured-output bounds to downstream validation before inference. Preserve the final provenance checks; never silently remove invalid citations or replace rejected analysis with deterministic text.
