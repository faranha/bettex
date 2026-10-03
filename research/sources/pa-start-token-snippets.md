# Evidencia de búsqueda y fetch — inicio antes de licencia, token propio BETTEX en Panamá

**Búsquedas y fetch ejecutados:** 2026-10-03. Cuatro llamadas `webSearch` precedieron a las tres llamadas `webFetch`. Resultados de otra jurisdicción (incluida la SMV de Perú) se descartaron. Los extractos de búsqueda son pistas textuales; no sustituyen la lectura de la fuente. Se conservan las fuentes completas recuperadas en sus rutas reales indicadas.

## Fragmentos de búsqueda

### Q1 — Texto primario de SMV sobre sociedades de inversión
- **Título:** Sociedades de inversion. Cristina Vence - Panamá
- **URL:** https://supervalores.gob.pa/wp-content/uploads/2021/03/sociedades-de-inversion.pdf
- **Fecha:** fecha de publicación no indicada; documento alojado en ruta de 2021; resultado consultado 2026-10-03.
- **Tier:** 1 — material SMV.
- **Texto de búsqueda:** “Las sociedades de inversión requieren registro en la CNV si ofrecen públicamente sus cuotas de participación en la República de Panamá o si son administradas en la República de Panamá o desde ésta.”
- **Calidad:** resultado de búsqueda; texto completo ya capturado en `research/sources/decision-gap-panama-06.md`.

### Q2 — Artículo 128 / oferta extranjera
- **Título:** Blockchain & Crypto-Assets 2026 — Panama
- **URL:** https://practiceguides.chambers.com/practice-guides/blockchain-crypto-assets-2026/panama/trends-and-developments/O26034
- **Fecha:** guía actualizada 2026-06-11; resultado consultado 2026-10-03.
- **Tier:** 2 — guía de práctica legal.
- **Texto de búsqueda:** “Under Article 128 of the Securities Market Law, an offer made to persons domiciled outside Panama is not deemed made in Panama merely because it is made from Panama”; también dice que la oferta a personas domiciliadas en Panamá se considera hecha allí aunque se origine fuera.
- **Calidad:** snippet secundario; full fetch guardado en `research/sources/decision-gap-panama-01.md`.

### Q3 — Requisito de autorización de ofertas públicas y excepciones
- **Título:** Fintech 2026 — Panama | Global Practice Guides | Chambers and Partners
- **URL:** https://practiceguides.chambers.com/practice-guides/fintech-2026/panama
- **Fecha:** actualizado 2026-03-31; resultado consultado 2026-10-03.
- **Tier:** 2 — guía de práctica legal.
- **Texto de búsqueda:** “All securities subject to a public offering, except those exempt from registration with the SMV, require authorisation from the SMV.” El resultado describe como excepción a personas domiciliadas fuera del país, private placements cuantitativamente limitadas e inversionistas institucionales, con formalidades para estos últimos.
- **Calidad:** snippet de guía; full fetch guardado en `research/sources/pa-start-token-02.md`. No afirma que una solicitud pendiente habilite operaciones.

### Q4 — Advertencia de entidad sin licencia
- **Título:** Advertencia – Entidad No Regulada – F1 INVESTMENTS, INC. — SMV
- **URL:** https://supervalores.gob.pa/advertencia-entidad-no-regulada-f1-investments-inc
- **Fecha:** no indicada en resultado; consultado 2026-10-03.
- **Tier:** 1 — SMV oficial.
- **Texto de búsqueda:** la SMV dice que la sociedad mencionada no es titular de licencia y “no cuenta con autorización para llevar a cabo negocios de intermediación de valores o de inversión en o desde de Panamá”.
- **Calidad:** snippet solamente; la advertencia se refiere a otra sociedad y sus hechos. No es precedente sobre BETTEX ni evidencia de regularización.

### Q5 — Alcance del Acuerdo 05-2004
- **Título:** Acuerdo 05-2004 — Superintendencia del Mercado de Valores
- **URL:** https://supervalores.gob.pa/download/acuerdo-05-2004
- **Fecha:** acuerdo de 2004; ficha con última actualización 2025-01-22; consultado 2026-10-03.
- **Tier:** 1 — SMV oficial.
- **Texto de búsqueda:** el título de la ficha dice que el acuerdo desarrolla el Título IX sobre sociedades y administradores de inversión y “establece el procedimiento para las solicitudes de autorización y licencia y las reglas para su funcionamiento y operación”.
- **Calidad:** snippet/página oficial; fetch de la ficha guardado en `research/sources/pa-start-token-01.md`. El PDF enlazado no se recuperó; no se extrajo su articulado.

### Q6 — Índice legal y versión de trabajo
- **Título:** Ley del Mercado de Valores — Superintendencia del Mercado de Valores
- **URL:** https://supervalores.gob.pa/ley-del-mercado-de-valores
- **Fecha:** ficha declara que secciones están actualizadas a enero de 2022; fetch 2026-10-03.
- **Tier:** 1 — SMV oficial.
- **Texto de búsqueda:** la ficha dice que el Texto Único de la SMV “es un documento de trabajo y no constituye una publicación oficial”, remite a Gaceta Oficial No. 26979-A y dice que ante discrepancias prevalece la Gaceta.
- **Calidad:** fetch integral; texto guardado en `research/sources/pa-start-token-03.md`.

## Fragmentos recuperados por fetch

### F1 — Acuerdo 05-2004
- **Título:** Acuerdo 05-2004 — Superintendencia del Mercado de Valores
- **URL:** https://supervalores.gob.pa/download/acuerdo-05-2004
- **Fecha:** ficha actualizada 2025-01-22; fetch 2026-10-03.
- **Tier:** 1 — SMV oficial.
- **Texto:** establece “el procedimiento para las solicitudes de autorización y licencia y las reglas para su funcionamiento y operación”; la página indica que el texto único fue modificado por varios acuerdos.
- **Calidad:** parcial. El fetch alcanzó la ficha de descarga y no el PDF adjunto. Ruta real: `research/sources/pa-start-token-01.md`.

### F2 — Chambers Fintech 2026
- **Título:** Fintech 2026 — Panama | Global Practice Guides | Chambers and Partners
- **URL:** https://practiceguides.chambers.com/practice-guides/fintech-2026/panama
- **Fecha:** última actualización 2026-03-31; fetch 2026-10-03.
- **Tier:** 2 — guía legal secundaria.
- **Texto:** “All securities subject to a public offering, except those exempt from registration with the SMV, require authorisation from the SMV”; exención para ofertas a personas domiciliadas fuera de Panamá; otros supuestos para private placements limitadas e inversionistas institucionales; para ofertas que requieren registro se presenta solicitud/prospecto a la SMV para aprobación.
- **Calidad:** integral. No contesta si hay regularización posterior ni analiza el token BETTEX. Ruta real: `research/sources/pa-start-token-02.md`.

### F3 — Índice SMV de la Ley
- **Título:** Ley del Mercado de Valores — Superintendencia del Mercado de Valores
- **URL:** https://supervalores.gob.pa/ley-del-mercado-de-valores
- **Fecha:** actualización declarada: enero 2022; fetch 2026-10-03.
- **Tier:** 1 — SMV oficial.
- **Texto:** el Texto Único es “documento de trabajo” y “no constituye una publicación oficial”; debe consultarse Gaceta 26979-A y esta prevalece si hay discrepancia.
- **Calidad:** integral para la página; no actualiza ni reemplaza el texto legal. Ruta real: `research/sources/pa-start-token-03.md`.

## Fuentes anteriores reutilizadas por pertinencia

### R1 — Texto legal consolidado de trabajo SMV
- **Título:** Unified Text of Decree Law No. 1 of 1999 (Securities Market Law)
- **URL:** https://supervalores.gob.pa/wp-content/uploads/2021/03/UNIFIED_TEXT_DL1-1999-1.pdf
- **Fecha:** corte/consulta 2026-10-03; SMV informa actualización de la página legal hasta enero 2022.
- **Tier:** 1 — texto legal del regulador con limitación de versión.
- **Texto:** artículo 115 incluye valores sujetos a oferta pública que requiere autorización; artículo 128: oferta a domiciliados panameños se considera hecha en Panamá, mientras la dirigida a personas domiciliadas fuera no se considera oferta hecha en Panamá aunque se origine en Panamá; artículos 129–130 recogen excepciones y solicitud de registro de oferta pública.
- **Calidad:** parcial — extracción de secciones pertinentes, no Gaceta oficial vigente completa. Ruta real: `research/sources/decision-gap-panama-02.md`.

### R2 — Sociedades de inversión, Cristina Vence
- **Título:** Sociedades de inversion. Cristina Vence — Panamá
- **URL:** https://supervalores.gob.pa/wp-content/uploads/2021/03/sociedades-de-inversion.pdf
- **Fecha:** documento oficial alojado en ruta de 2021, publicación no indicada; recuperado 2026-10-03.
- **Tier:** 1 — material explicativo SMV/CNV.
- **Texto:** recaudación de recursos del público por cuotas, inversión en valores/divisas/otros bienes; registro si oferta pública de cuotas en Panamá o administración en/desde Panamá; administrador profesional licenciado.
- **Calidad:** integral. Explicativo, no decisión sobre un token profit. Ruta real: `research/sources/decision-gap-panama-06.md`.

### R3 — Opinión 04-2025
- **Título:** Opinión 04-2025 — SMV
- **URL:** https://supervalores.gob.pa/download/opinion-04-2025/?wpdmdl=31565&ind=1758042988802&refresh=a6538178&filename=Opinion_4-2025.pdf
- **Fecha:** 2025-09-08; fetch anterior 2026-10-03.
- **Tier:** 1 — opinión oficial SMV.
- **Texto:** considera un modelo no custodial de interacción con BTC/ETH, sin captación ni derecho de flujos de caja/dividendos del rendimiento de una entidad. El token BETTEX sí ofrece derecho contractual a beneficios.
- **Calidad:** integral; útil para distinguir hechos, no para clasificar BETTEX. Ruta real: `research/sources/decision-gap-panama-07.md`.
