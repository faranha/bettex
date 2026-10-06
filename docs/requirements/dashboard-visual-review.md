# Revisão do dashboard, documentação e helpers

## Revisão inicial

| Superfície | Revisão |
|---|---|
| Meu painel | Captura desktop; gráfico do ciclo, seleção de série, acesso à Central e resumo de serviços revisados no código |
| Central da IA | Captura desktop; inventário, estados, relatórios, histórico, documentação e ajuda revisados no código |
| Saldo e histórico | Captura mobile; rótulos acessíveis, ícones, disposição dos saldos e controles revisados |
| Tesouraria | Captura desktop; separação entre emulação, capital de papel e administração protegida |
| Simulação | Captura mobile da tela de acesso; componentes revisados por padrões de acessibilidade, sem executar sessão autenticada |
| Minha conta | Captura desktop do cadastro/acesso; sem criar conta ou testar fluxos financeiros/autenticados |
| Homepage | Captura mobile e verificação dos padrões de imagens, rótulos e foco; conteúdo e desenho aprovados preservados |
| Pitch | Captura desktop e revisão de navegação/tabelas; conteúdo e desenho aprovados preservados |
| Documentação pública | Captura mobile e verificação de padrões de apresentação; não revalidada integralmente cada figura de cada capítulo |

A auditoria de código verificou controles nomeados, foco visível, texto alternativo, regiões de tabelas com rolagem, links externos e padrões de responsividade nos componentes do aplicativo e páginas. Não é uma declaração de teste interativo de todos os menus, modais, estados ou sessões autenticadas.

## Correções realizadas

- Seleção de agente no mobile leva ao detalhe, com margem para navegação fixa.
- Cripto e bônus explicam que não têm entradas configuradas.
- Acrescentadas ajudas de entradas, orquestração, orçamento e evidências históricas.
- Orquestração descrita como avaliação de dependências na mesma rodada, não ciclos independentes por agente.
- Saúde da análise não é definida apenas por resposta HTTP.
- Falha distingue análise degradada, erro de captura e ausência de persistência.
- BETTEX observadora documentada como consolidação de avaliações/contadores, não como nova seleção de ordens.
- Manual/hierarquia atualizados para Allora BTC/ETH/SOL e descoberta esportiva; removida afirmação geral de Allora desconectada.
- Ajuda da emulação distingue suas propostas das inferências reais do gráfico/especialistas.
- Inventário de oito ajudas da Central, outras ajudas do aplicativo e funções técnicas em [helpers.md](../helpers.md).

## Verificação

- TypeScript do frontend: aprovado.
- Auditoria dos textos isolados PT/EN/ES: aprovada, 1487 chamadas explícitas.
- Preview das rotas canônicas: carregou as superfícies acima; português usa rota sem `/pt`, inglês/espanhol usam os prefixos correspondentes.
- Revisão visual não alterou saldos, políticas, contratos, chaves, atores ou execução financeira.

## Limites observados

- Simulação e administração protegidas foram verificadas somente na apresentação pública e no código, não em sessão autenticada.
- As novas ajudas mantêm o componente de interação já verificado anteriormente; seus novos textos foram conferidos por código e idiomas, não por uma nova passagem interativa de navegador.
- A documentação pública registra avisos iniciais de dimensão zero de gráficos em conteúdo não visível; a captura inicial renderizou. As figuras escondidas não foram abertas uma a uma nesta revisão.
- Inferência de preço, saúde do serviço e relatório de controle continuam sem equivaler a modelo calibrado ou autorização financeira.

## Verificação interativa — 6 de outubro de 2026

Os limites de acesso/figuras acima pertencem à revisão inicial, não ao estado após esta passagem.

- Criada conta nativa sintética exclusiva de desenvolvimento, com aceite de ausência de recuperação; perfil retornou após recarga. Apenas informações públicas das carteiras foram vistas; nenhuma chave/backup foi exibida ou exportada.
- Percurso completo da simulação isolada concluído e histórico consultado. O cenário foi reiniciado, sem movimentar dinheiro real. Administração protegida da Tesouraria respondeu 403; não houve concessão de permissões.
- Central: seleção, quatro ajudas contextuais, ajuda por agente, foco/Enter, fechamento externo, atualização, busca/filtros sem resultados e paginação de histórico exercitados. Textos PT/EN/ES conferidos.
- Todos os 13 capítulos foram navegados. Os dois gráficos de vesting não montam em capítulo oculto; no capítulo ativo apresentaram dimensões positivas (786×320 desktop; 326×270 mobile), sem aviso de dimensão zero. Tooltips dos meses 1/36 couberam no mobile.
- Menus públicos de Pitch e Home espanhóis abriram com links/idioma corretos e fecharam pelo X.

### Problemas encontrados e mudanças

- Falha de atualização da Central não apareceu na passagem inicial. O aviso agora considera também a primeira falha durante retry, preservando o recibo antigo com indicação explícita.
- Seleção mobile não levou ao detalhe na passagem inicial. O alvo agora é uma referência local do componente, com rolagem após o layout confirmado e sem animação interrompível; tocar o agente já selecionado também abre/posiciona o detalhe.
- Escape/toque externo não fechavam o menu público. O cabeçalho compartilhado agora remove o menu nesses dois casos; Escape devolve foco ao botão.
- O teste interpretou `payment_failure` como falha do depósito. Conferência da implementação e testes demonstra que este cenário falha **no repasse de lucro do ciclo**, preservando sua obrigação; o depósito inicial é esperado e isolado. O rótulo foi explicitado em PT/EN/ES e acrescentadas asserções do depósito positivo e ausência de recebimento de lucro enquanto o repasse falha. Nenhuma regra financeira foi alterada.

A confirmação visual restrita das três correções de interação **passou**:

- Mobile 390×844: BTC e depois ETH selecionados com detalhe posicionado abaixo da navegação fixa.
- Interceptor exclusivamente no navegador confirmou dois GETs 500 com query `agentId`; após dois segundos o aviso apareceu mantendo o recibo em cache. Ao remover o interceptor e atualizar, o aviso desapareceu.
- Pitch espanhol: Escape fechou menu/devolveu foco; toque externo também fechou. Home espanhola: Escape fechou o mesmo cabeçalho e devolveu foco.

Essa confirmação não repetiu cadastro, não criou atores e não alterou fundos, permissões, políticas ou históricos.

### Produção e pesquisa financeira

- `https://bettex.ai/api/healthz`: 200. `/api/agents/center`: 404, confirmado por corpo HTTP e logs de produção. O runtime publicado não oferece essa rota; atualizar a versão publicada continua pendente. Não houve publicação nesta execução.
- Documentação publicada carregou em captura externa. Não houve login, alteração de dados ou política em produção.
- Pitch espanhol registrou mensagens TrustedHTML/WebGPU sem impedir renderização. Não foi comprovada origem no código do produto; não houve enfraquecimento de CSP/TLS para silenciá-las.
- Build frontend de produção e build da API aprovados; testes de políticas, paper, agentes, operações, Allora, contas e carteiras aprovados. A simulação tem cinco testes, inclusive falha de repasse e retomada.
- Ferramentas novas de pesquisa/validação e bloqueios externos em [market-validation.md](../market-validation.md). O modelo não foi validado economicamente e os livros exploratórios não constituem cotações completas.
