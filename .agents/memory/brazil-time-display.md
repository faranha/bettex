---
name: Horários do app no Brasil
description: Apresentar horários em São Paulo; o roteiro compartilhado do demo abre às 16h e fecha 24 horas depois.
---

O app deve mostrar os horários no fuso de São Paulo, com “Horário do Brasil” em vez de “UTC”. O contador pode continuar calculado com instantes UTC.
O roteiro do demo deve abrir às 16h de São Paulo e fechar às 16h do dia seguinte, com 24 horas reais. Essa mudança de corte aplica-se ao demo, não aos contratos ou registros de carteiras reais.

**Why:** O criador disse: “O contador pode ser UTC, mas tem que mostrar no horário do Brasil. Não precisa botar UTC, horário do Brasil”, e depois determinou que o ciclo atual deve ser o padrão para todos os dados, começar às 16h e fechar em 24h.

**How to apply:** Converter horários exibidos usando America/Sao_Paulo, inclusive datas próximas da meia-noite, eventos e prazo dos ciclos. No demo, agrupar extratos e histórico pelo corte das 16h, não pela meia-noite UTC, e manter os gráficos e contadores no mesmo ciclo. Preservar instantes e regras de contratos/registros nativos. Traduzir os rótulos conforme o idioma selecionado.