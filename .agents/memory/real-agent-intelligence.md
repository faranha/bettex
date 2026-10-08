---
name: Real AI within BETTEX agents
description: Real inference, honest provenance, and evidence-bounded model citations.
---

BETTEX agents must include actual AI inference. Deterministic controls are useful for accounting, permissions and safety, but must not be presented as the agents' intelligence or as a substitute for real model reasoning.

**Why:** The creator explicitly rejected an agent system consisting exclusively of deterministic bots and called the absence of AI a serious failure.

**How to apply:** Distinguish model-generated reasoning, external model observations and fixed-rule checks. Show real model provenance and source evidence. Describe on-demand analysis, autonomous scheduling and financial execution separately; do not claim capabilities that have not been implemented or verified.

Constrain model citations to the evidence actually supplied; when the evidence list is empty, forbid citations and evidence-backed monitoring.

**Why:** A healthy provider can return valid structured JSON with nonexistent evidence references. BETTEX correctly rejects that analysis, which can otherwise be mistaken for an inference outage.

**How to apply:** Match structured-output bounds to downstream validation before inference. Preserve the final provenance checks; never silently remove invalid citations or replace rejected analysis with deterministic text.
