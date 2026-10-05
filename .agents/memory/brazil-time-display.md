---
name: Horários do app no Brasil
description: Apresentar horários no fuso de São Paulo sem mudar os instantes internos dos ciclos.
---

O app deve mostrar os horários no fuso de São Paulo, com “Horário do Brasil” em vez de “UTC”. O contador pode continuar calculado com instantes UTC.

**Why:** O criador disse: “O contador pode ser UTC, mas tem que mostrar no horário do Brasil. Não precisa botar UTC, horário do Brasil”.

**How to apply:** Converter os horários exibidos usando America/Sao_Paulo, inclusive datas próximas da meia-noite, eventos e prazo dos ciclos. Preservar a duração do contador e os cortes existentes; não mudar regras financeiras por uma mudança de apresentação. Traduzir o rótulo conforme o idioma selecionado.