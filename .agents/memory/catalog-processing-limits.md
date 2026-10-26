---
name: Limites no processamento de catálogos
description: Catálogos de tradução grandes podem exceder os limites de operações e memória do notebook antes de salvar.
---

Evitar carregar e serializar o catálogo inteiro de traduções no notebook para pequenas alterações. Preferir patches pontuais ou os geradores locais existentes, preservando a ordem e o formato.

**Why:** O catálogo supera 1,6 MB. Uma leitura seguida de gravação ultrapassou o orçamento de 3 MB de operações; resultados acumulados também reiniciaram o notebook ao exceder 32 MB, descartando as variáveis antes do salvamento.

**How to apply:** Filtrar dados antes de retorná-los, limitar o conteúdo retido e confirmar o arquivo efetivamente salvo. Não repetir a mesma abordagem com o catálogo integral. Evitar parse/serialização de todo o JSON para não normalizar registros duplicados nem gerar mudanças de formatação desnecessárias.
