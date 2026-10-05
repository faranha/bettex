---
name: Detalhes opacos no OpenAPI
description: Comportamento do validador gerado para respostas que carregam estado detalhado de uma execução simulada.
---

Quando uma resposta declara `additionalProperties: true`, não presuma que o validador Zod gerado pela versão atual do Orval conservará as propriedades não listadas. Aqui ele validava a resposta, mas eliminava silenciosamente os dados financeiros aninhados, enquanto os eventos paginados permaneciam visíveis. Isso fez uma execução persistente parecer vazia na interface.

**Why:** Essa divergência entre o contrato OpenAPI e o código gerado não causa erro de tipo ou resposta HTTP. Só ficou evidente numa verificação autenticada de ponta a ponta.

**How to apply:** Para uma resposta com detalhes opacos e proprietários, valide o envelope e seus campos públicos, mas preserve explicitamente o objeto detalhado produzido pelo servidor após conferir a propriedade da execução. Quando mudar o gerador, confirme por teste que dados aninhados sobrevivem à serialização.
