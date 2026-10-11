---
name: App navigation preservation
description: Preserved navigation constraints; replit.md defines the current app areas, not the superseded mixed dashboard.
---

Follow the current application direction in replit.md, not older instructions about the mixed dashboard or finance tabs under My Account.

**Why:** The creator explicitly retired the previous dashboard and changed the ownership of the Wallets, History and Profile destinations.

**How to apply:** Consult the current direction before reorganizing menus. Do not restore the old dashboard or Profile finance tabs from historical notes. Moving a destination does not authorize recreating wallets, changing account identity or weakening key-export protections.

Não exibir Central da IA como item do menu principal do app.

**Why:** Depois de integrar a Central à home, o criador corrigiu: “central da IA pode sumir do menu principal”.

**How to apply:** A Central permanece abaixo das carteiras no Painel, acessível pela âncora interna. Não reintroduzir uma página independente no menu desktop ou lateral. No mobile, um atalho agrupado sob Painel pode apontar para essa âncora. Preservar os links antigos.

Tesouraria é uma página própria no menu principal, fora da página inicial.

**Why:** A orientação anterior de integrar a Tesouraria no Painel foi
substituída: “Nós vamos tirar a tesouraria da página inicial”, porque o
atalho no menu hambúrguer dava a impressão de abrir uma página sem fazê-lo.

**How to apply:** Manter a Tesouraria completa na sua própria rota, com
seleção de página clara no cabeçalho e nos menus. Migrar antigos links
da âncora do Painel sem perder os filtros, mantendo o conteúdo fora da home.

O menu hambúrguer precisa dar acesso também às seções internas do Painel:
Carteiras, Central da IA e Participação. Agrupar esses atalhos
sob Painel, preservando a propriedade das seções; incluir Tesouraria, Histórico,
Perfil, Voltar ao site e comunidade.

**Why:** Ao ver somente Painel, Histórico e Telegram no menu, o criador
corrigiu: “não tem todas as áreas”. A solução deve conciliar acesso
completo com a orientação de manter Central no Painel e a posterior
separação da Tesouraria.

**How to apply:** Não confundir retirar uma página independente com esconder
seu acesso do menu mobile. Os atalhos internos precisam fechar o diálogo
antes do alinhamento final, sem a restauração do foco puxar a página ao topo.

O submenu do Painel deve continuar acessível durante a rolagem, fixo
abaixo do cabeçalho, também no celular.

**Why:** O criador disse que ao rolar para baixo “a gente perde o submenu”
e pediu melhorar a navegabilidade da área Painel.

**How to apply:** Considerar as alturas reais do cabeçalho e submenu nos
destinos das âncoras, sem encobrir títulos. Destacar a seção acompanhada
na rolagem sem reescrever a URL nem perder a seleção dos agentes.

Os submenus de todas as páginas do app devem ser sticky sob o cabeçalho,
não somente o submenu do Painel.

**Why:** O criador mostrou o Histórico e reiterou: “Os submenus têm que ser sticky”.

**How to apply:** Manter a seleção acessível durante a rolagem em Histórico,
Tesouraria e Perfil, com rolagem horizontal em telas estreitas, sem cobrir
conteúdo nem compensar a altura das barras duas vezes em links profundos.

History contains statements and records without repeating balance cards or the complete wallet block.

**Why:** The creator explicitly rejected those duplicated cards in History. Moving History into the main menu does not reverse that content decision.

**How to apply:** Keep personal financial records separate from Treasury results and preserve wallet-filtered access.

History must use the same containers and organization as the rest of the platform, not loose controls on the page background.

**Why:** The creator pointed to My wallets as the reference and said History was not using the same containers and was poorly organized.

**How to apply:** Keep statement headings, export controls, filters and records inside coherent platform cards. Preserve all data, downloads and filters; matching the wallet container does not mean duplicating wallet balances.

Keep the demo environment notice and restart controls in one compact blue band, on one line and within the app layout width.

**Why:** The creator asked to merge the strips and explicitly rejected a stacked layout.

**How to apply:** Preserve the testnet status, no-real-money warning, simulated-operation notice, public contract link, tab scope and restart confirmation through compact accessible controls.

Do not reintroduce the banner sentences “Comunidade aberta · Token comunitário · Sem salários ou taxas de serviço.” or “Dados ilustrativos · Software em desenvolvimento.”, including their translations.

**Why:** The creator explicitly demanded removal of these two sentences from the app.

**How to apply:** Keep the remaining demo and no-real-money labels and any existing action controls; do not restore the removed promotional or development-status paragraphs.

Every app area, including Painel, Central da IA, Tesouraria, Histórico and Perfil, must have its own subsection submenu in the pill-button style of Histórico. Show only the options belonging to that section. Do not repeat the global menu as breadcrumbs or another complete list of app destinations.

**Why:** The creator reiterated that each page should contain only its own areas/options, then required “todas as areas [...] do app tem que ter submenus assim”, using Histórico as the visual reference.

**How to apply:** Keep general navigation in the top menu or mobile drawer. Remove repeated visible main-area labels such as “Histórico” below that menu; meaningful content headings remain. Preserve each page's filters, folds, tabs and all content while organizing it behind its own submenu.

Use a hamburger with a side drawer in the mobile system header, not an “Areas” dropdown or a permanently stacked destination menu.

**Why:** The creator said the stacked menu occupied too much screen space and covered content while scrolling; later explicitly requested a hamburger instead of the “weird dropdown”.

**How to apply:** Keep every area accessible in the side drawer, preserving the current area label, account controls and desktop navigation. Keep mobile dashboard sections close together without obsolete bottom-navigation spacing.

The demo is active after explicit entry as Alex, without repeated login prompts inside it.

**Why:** The creator requested a dedicated entry page and logout returning there, while hiding real signup/login forms “for now”, not deleting account infrastructure.

**How to apply:** Do not silently reactivate Alex after logout or reload. Keep demo, native and Clerk identities distinct.

Keep the app entry page visual and inspired by the existing homepage artwork.

**Why:** The creator called the first form-dominated entry “dead” and requested the homepage as visual inspiration.

**How to apply:** Preserve the entry/logout path and existing BETTEX artwork; do not change the homepage to compensate.

Keep compact identity/profile access in the system options bar rather than a separate dashboard greeting block.

**Why:** The creator said the account block occupied too much space and explicitly moved it beside the language and back-to-site controls.

**How to apply:** Do not reintroduce expanded personal-data headers on the wallet dashboard.

Removing the old Operations/Security navigation does not remove effective account or wallet protections.

**Why:** The creator rejected duplicated Operations UI and the standalone Security area for ALPHA, not its safeguards.

**How to apply:** Preserve authentication, safe key export and account security without recreating redundant finance tabs.
