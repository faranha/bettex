# Mapa CSS e SEO da BETTEX

## Estrutura e responsabilidades

| Arquivo | Responsabilidade |
|---|---|
| `src/index.css` | Tokens, fontes, cores, Tailwind, largura `.page-wrap` e estilos básicos. |
| `src/pages/pitch.css` | `.pitch`, offsets globais `--site-header-h`, ajustes responsivos comuns e tabelas do pitch. |
| `src/components/WhitepaperSection.css` | `.whitepaper`, tipografia editorial, índice desktop/mobile, tabelas e cartões mobile, impressão. |
| `src/components/reading-disclosure.css` | Sanfonas por tópico, resumos, indicações de expandir/recolher e controles de leitura da documentação e do pitch. |
| `src/components/growth.css` | `.growth-*`, cartões, canais e dados da estratégia de aquisição. |
| CSS de `hero`, `technology`, `robot-floor`, `investor` | Ilustrações, mercados e prévias conceituais da homepage. |
| `HumanStorySection.css`, `NewEconomySection.css`, `ProjectModelSection.css`, `RoadmapSection.css` | Seções específicas e seus pontos de adaptação. |
| `SiteFooter.css` | Rodapé, links e decoração sem alargar a página. |

O índice de documentação usa lista vertical recolhível no celular, nunca abas com rolagem lateral. Tabelas tornam-se linhas/cartões com os rótulos das colunas, mantendo todos os dados. No desktop, os dados continuam em tabelas e o índice permanece lateral. A largura é controlada pela estrutura dos elementos, não por ocultar conteúdo que excede a tela.

O cabeçalho tem uma ou duas linhas conforme o tamanho da tela. Seus offsets devem considerar o índice fixo e o cálculo JavaScript de navegação, além do `scroll-margin`. Não adicionar regras concorrentes de `top` sem conferir a cascata.

Documentação e pitch usam leitura progressiva por tópico: resumos e avisos essenciais ficam visíveis, detalhes começam recolhidos e os controles permitem expandir/recolher tudo. Conteúdo público permanece no HTML das sanfonas nativas, sem montagem condicional. Links diretos devem abrir os ancestrais recolhidos antes de calcular a rolagem.

## SEO e compartilhamento

- `src/lib/site-seo.json`: fonte única de título, descrição, indexabilidade, imagem e origem pública verificada.
- `scripts/seo.mjs`: HTML inicial de metadados, canonical, Open Graph, Twitter/X, JSON-LD e arquivos de descoberta. O JSON-LD descreve páginas/site, não uma empresa já constituída, oferta, avaliação ou retorno financeiro.
- `scripts/prerender.mjs`: executado após Vite no build; gera o conteúdo HTML real das quatro páginas e uma página 404.
- As reescritas do artefato apontam cada rota pública para seu próprio HTML. Não restaurar a reescrita genérica `/* → /index.html`: ela apaga o SEO específico das outras páginas.
- `src/entry-server.tsx`: renderização da mesma árvore React usada no site; não criar uma cópia editorial que fique desatualizada.
- `PageMetadata.tsx`: mantém as mesmas configurações quando o usuário navega pelo site sem recarregar.
- `/demo`: `noindex, follow` enquanto contém apenas “Em breve”; excluída do sitemap.
- `public/social/*.jpg`: quatro capas reais de 1200 × 630 para início, pitch, documentação e Demo.
- `public/social-preview.html`: fonte visual das capas; não indexar nem incluir no sitemap.

Atualizações na origem pública exigem conferir o domínio principal pela configuração de publicação, atualizar a fonte única e recompilar. URLs de desenvolvimento não são canonical nem endereço da imagem social.

## Verificação

Conferir 320, 375, 402, 768 e 1024 px, rolagem horizontal da página, abertura/fechamento do índice, links diretos com fragmentos, dados de tabelas, foco e telas do pitch. Checar também o HTML compilado sem JavaScript: títulos únicos, H1, texto, links reais, canonical, imagem existente, robots, sitemap e status 404.

O build pré-renderiza o conteúdo público. O servidor de desenvolvimento mantém a montagem normal do React e fornece metadados por rota; a validação de conteúdo inicial para buscadores deve usar a saída de produção. Indexação e posição nas buscas não são garantidas por mudanças técnicas. O tamanho do JavaScript e métricas reais de carregamento devem ser acompanhados separadamente.