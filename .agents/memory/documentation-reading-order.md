---
name: Ordem de leitura da documentação
description: Ordem dos capítulos e leitura compacta da documentação técnica.
---

## Padrão de abertura das subseções

Todas as seções e subseções seguem o estilo visual dos subagentes: título destacado, numeração azul nas subseções, ponto amarelo, subtítulo azul e separadores. Aplicar o que estiver faltando para completar esse padrão.

**Why:** O criador rejeitou a coexistência de dois estilos e escolheu explicitamente o estilo dos subagentes para todos.

**How to apply:** Preservar o conteúdo, a hierarquia e os controles de expansão; não manter cabeçalhos compactos sem o mesmo tratamento visual.

Os níveis internos precisam ser visivelmente subordinados: recuos progressivos, guias discretas nos blocos expandidos e tamanhos de título claramente distintos. “Continuidade: recuperar controles e conciliar fundos em trânsito” não pode parecer do mesmo nível que “Subagente de Tesouraria”.

**Why:** O criador apontou que os níveis internos estavam quase impossíveis de diferenciar e que a diferença pequena de fonte não bastava.

**How to apply:** Recuar o conteúdo completo de cada ramo expandido, não só o título. Encerrar a guia antes do próximo item irmão e limitar os recuos no celular para preservar a largura de leitura.

As subseções e áreas numeradas da documentação começam recolhidas, com o mesmo controle de expansão em todas elas. Carteiras, Features e Subagentes não são exceções.

**Why:** O criador apontou a Carteira BETTEX carregada aberta e exigiu “um padrão para todas as subseções e áreas”.

**How to apply:** Mostrar título, subtítulo e controle no estado inicial; manter textos, imagens e detalhes dentro do conteúdo recolhível. Navegar ao título de uma área não abre automaticamente seu corpo. Preservar links para conteúdos específicos, revelando somente os ancestrais necessários para alcançá-los.

No menu, “Demo e prova de conceito” segue os mesmos controles e destaque dos demais capítulos, com acesso aos seus subitens reais.

**Why:** O pedido anterior de link simples foi substituído pela correção de opções ausentes e seleção inconsistente, especialmente em Demo.

**How to apply:** Nome navega ao capítulo; seta abre e fecha seu índice, como nos demais capítulos. Não excluir Demo do destaque atual nem dos controles quando houver subitens. Isso não reintroduz o detalhamento de telas do aplicativo.

As seções principais não exibem números no menu, no seletor mobile nem nos cabeçalhos dos capítulos. Todos os itens principais do menu usam o mesmo tratamento visual.

**Why:** O criador pediu abolir os números das seções principais e criar divisões claras. Depois apontou que destacar apenas Subagentes e Features com cartões azuis e letras amarelas não tinha lógica.

**How to apply:** Usar títulos sem ordinais, com a mesma tipografia, cor, espaçamento e separadores para todos os itens principais. Distinguir os filhos por recuo e os controles por setas somente onde há subitens; não destacar Subagentes e Features com cartões ou caixa alta. Manter a numeração das subseções e os IDs internos.

Remover integralmente “Leia também” / “Related topics” / “Temas relacionados” de todos os blocos da documentação.

**Why:** O criador substituiu a orientação visual anterior e pediu a remoção integral desses quadros.

**How to apply:** Não reintroduzir sugestões de leitura em capítulos ou grupos, em nenhum idioma. Preservar o conteúdo principal, o índice e a navegação anterior/próximo.

O capítulo “Demo e prova de conceito” deve começar pela visão e pelos objetivos, depois explicar os conceitos. Preservar os esquemas da visão, não o detalhamento das telas do demo.

**Why:** O criador apontou que o capítulo começava seco, sem visão nem introdução, e exigiu esquemas visuais.

**How to apply:** Manter a visão antes dos avisos de escopo e das definições; integrar esquemas conceituais à explicação, com leitura no celular e distinção entre arquitetura pretendida e demonstração off-chain. O acesso ao demo é somente um link.

BTC, ETH e SOL são conteúdos subordinados ao Subagente Cripto no corpo da documentação, não capítulos principais no mesmo nível. Não aparecem no menu, que termina no segundo nível.

**Why:** O criador corrigiu explicitamente a hierarquia do detalhamento de Cripto.

**How to apply:** Preservar os especialistas no conteúdo de Cripto e os links diretos, com hierarquia subordinada no desktop e mobile. Agrupá-los em “Especializações por ativo”; não apresentá-los como irmãos do baseline e da referência técnica. O menu aponta para Cripto, sem listar os especialistas no terceiro nível.

Títulos com a mesma profundidade numérica devem usar o mesmo tamanho, independentemente de serem capítulos React, tópicos ou referências nativas.

**Why:** O criador apontou que BTC tinha fonte maior, mas a mesma profundidade da referência técnica; a tipografia por tipo de componente contradizia a hierarquia numérica.

**How to apply:** Derivar a escala visual da numeração completa. Revisar a estrutura e o índice em conjunto, não corrigir somente a fonte do item apontado.

“Features” é a abertura da seção de funcionalidades e um grupo recolhível no menu, não um capítulo independente. Sua apresentação no corpo da página permanece aberta e sem caixa.

**Why:** O criador pediu simplificar o nome e depois reiterou que carteiras, conta/acesso e demais funcionalidades precisam estar agrupadas em Features, com seções e subseções, em vez de uma lista sequencial de 17–18 opções. Corrigiu novamente que agrupar apenas o menu deixa o conteúdo gigante, sequencial e mal organizado.

**How to apply:** Preservar a introdução antes de Carteira BETTEX, sem criar um artigo extra. Colocar carteiras, conta/acesso, histórico, staking, token, recompra e jogos dentro da página principal Features. Agrupar os subagentes na página Subagentes; manter especialistas de Cripto e subseções subordinados. O índice começa recolhido, os itens fechados são compactos e a seção principal selecionada carrega seus conteúdos. Abrir os ancestrais dos links diretos após carregar a página correspondente.

Não repetir títulos consecutivos do mesmo bloco, inclusive quando um componente já possui título próprio e é colocado dentro de outro com cabeçalho.

**Why:** O criador apontou dois títulos “Sustentabilidade operacional” em sequência e pediu: “nao repita titulos assim”.

**How to apply:** Manter um único título com conteúdo, sem cabeçalho vazio acima de outro igual. Conferir o texto renderizado, inclusive traduções e referências técnicas, não somente os títulos declarados no componente pai.

Não repetir acima do índice lateral o caminho da documentação, do capítulo e das subseções.

**Why:** O criador apontou as opções duplicadas no topo do menu e pediu: “pare com isso”.

**How to apply:** Manter somente a lista de capítulos e subseções com destaque do item atual; não reintroduzir breadcrumbs acima dessa lista.

No mobile, o menu da documentação deve seguir o submenu das demais páginas: uma barra imediatamente abaixo do header principal, com acesso aos capítulos e às subseções da área selecionada. Não manter um segundo índice mobile dentro do conteúdo; preservar o índice lateral no desktop.

**Why:** O criador pediu a mesma estrutura de submenu usada nas outras páginas, no lugar do menu de capítulos mostrado no corpo da documentação.

**How to apply:** Considerar a altura real do header com a barra ao navegar para capítulos e subseções. Preservar links diretos e histórico; os atalhos carregam a seção principal correspondente e abrem o conteúdo recolhível do destino.

A seção chama “Entidade e negócios”, não “Identidade e negócios”, e deve vir imediatamente depois de “Visão do projeto”, nunca no fim.

**Why:** O criador corrigiu explicitamente o nome e a posição dessa seção.

**How to apply:** Preservar essa sequência no índice e no corpo da documentação, em todos os idiomas, ao acrescentar ou reorganizar capítulos.

Não reintroduzir os controles globais “Expandir tudo” e “Recolher tudo” na documentação.

**Why:** O criador apontou que essa opção perdeu a utilidade na organização atual.

**How to apply:** Manter o índice e a leitura dos capítulos sem acrescentar novamente essa barra de controles.

As subseções começam recolhidas em toda a documentação. Fechar uma subseção oculta também seus elementos e os títulos internos, mesmo quando a numeração antiga os apresenta como irmãos.

**Why:** O criador apontou os títulos internos expostos sob a subseção fechada 2.8.4: “ela precisa estar recolhida, seus elementos nao podem ficar expostos desta forma, em toda documentacao”.

**How to apply:** Respeitar tanto a hierarquia numérica quanto os blocos de conteúdo efetivamente contidos na subseção. Links diretos podem abrir o destino e seus ancestrais; não expandir os demais itens automaticamente. Conferir a entrada pelo capítulo e a entrada por link direto separadamente: a abertura explícita de um destino pode mascarar falhas nos controles e no estado inicial do capítulo.

A documentação carrega somente uma seção principal e seus conteúdos por vez, no mobile e no desktop. Visão é a entrada padrão.

**Why:** O criador substituiu explicitamente a página contínua: “you load only the main section and its contents not all content”, com Visão como índice e navegação próxima/anterior no rodapé.

**How to apply:** Montar apenas a seção principal selecionada: Visão, BETTEX, Subagentes, Features, Tokenomics, Base técnica ou Roadmap. Manter os subitens agrupados dentro dela. O rodapé oferece Próximo e, quando existir, Anterior; Visão não tem Anterior e Roadmap não tem Próximo. Menu, intralinks, recarga e histórico devem carregar a seção do destino antes de abrir seus ancestrais. Não manter todos os capítulos ocultos no DOM. Preservar assuntos, ordem, âncoras e idiomas. Não aplicar ao Pitch.

O cabeçalho geral da documentação continua disponível no topo, independentemente da seção ou subseção selecionada.

**Why:** O criador apontou que o cabeçalho desaparecia ao entrar em uma subseção, mesmo fazendo parte da identidade da documentação.

**How to apply:** Não condicionar a renderização do cabeçalho à Visão. Ao navegar por âncoras, continuar levando o leitor ao tópico solicitado; ao voltar ao topo, mostrar o mesmo cabeçalho sem criar uma cópia fixa sobre o conteúdo.

Nenhuma cabeça de seção no topo da documentação fica dentro de uma caixa ou sanfona. Todas as seções começam com título, descritivo e apresentação; depois vêm as subseções.

**Why:** O criador corrigiu a seção Subagentes em uma captura mobile: “Nenhuma cabeça de seção topo pode ficar dentro de um container. Toda a de seção precisa ter um descritivo, uma apresentação. Então as subseções.”

**How to apply:** Manter as aberturas das sete seções e dos capítulos visíveis e sem moldura, fundo de cartão ou controle de recolher. Recolher somente as subseções e referências, não a apresentação. Preservar o carregamento de uma seção principal por vez e a navegação do rodapé. Aplicar somente à documentação.

A numeração da documentação segue a hierarquia das sete seções principais, não uma contagem independente de todos os capítulos.

**Why:** O criador corrigiu explicitamente: Subagentes é 3, Subagente de Risco é 3.1 e Investigar além dos limites é 3.1.1; apontou o erro como generalizado.

**How to apply:** Usar o mesmo número no cabeçalho, índice e tópicos em todos os idiomas. As funcionalidades pertencem à seção 4 e os especialistas pertencem a Cripto. Os especialistas seguem os tópicos do próprio Cripto na ordem de leitura, sem reutilizar seus números. Preservar os IDs e links antigos, mesmo quando seus números mudarem.

Expectativas e planos de lançamento, metas, projeções e plano comercial ficam exclusivamente no Pitch. Na documentação, deixar apenas um link para o Pitch.

**Why:** O criador pediu retirar todo esse conteúdo da documentação, não somente atualizar os números.

**How to apply:** Manter na documentação as regras do produto, da entidade, das taxas e os procedimentos técnicos. Não reintroduzir planos de aquisição ou cenários comerciais, inclusive nos materiais baixáveis.

Todas as áreas precisam introduzir os conceitos e recursos antes de pressupor que o leitor já os conhece.

**Why:** O criador apontou que Loteria, Double 2X e exportação de chaves apareciam sem apresentação: “esses elementos adcionais precisam de introducao em algum momento”. Reiterou que a documentação não explica a participação para quem não entende o sistema: “precisa introduzir, falta isso em todas as areas”, incluindo staking, DeFi, DEX e DeFAI.

**How to apply:** Começar cada área com uma explicação didática do conceito e de sua aplicação na BETTEX, antes de elegibilidade, cálculos ou referências técnicas. Na participação, explicar o que é staking e de onde vem um eventual pagamento antes das regras. Introduzir DeFi, DEX, DeFAI e os demais termos na primeira utilização; não deixar suas definições apenas em um glossário ao fim. Explicar os recursos opcionais antes de suas regras, separados da participação, mantendo riscos e estado visual do demo claros.

Não transformar a descrição de uma área em sua primeira subseção. A introdução fica visível diretamente sob o título da própria seção, sem numeração adicional nem controle de recolher.

**Why:** O criador apontou que o antigo 3.1.1 apenas descrevia o Subagente de Risco (3.1) e reiterou que “o item 1.1 na verdade já tem que ser o 1”; nenhuma seção pode ficar vazia por esconder sua apresentação.

**How to apply:** Revisar todas as áreas por significado, não apagar indiscriminadamente o primeiro tópico. Incorporar apresentações e definições à introdução, mantendo somente regras e assuntos próprios como subseções. Renumerar os tópicos restantes e preservar os destinos dos links anteriores.

A documentação deve oferecer somente o link para o demo, sem detalhamento das telas ou caso ilustrativo de uso.

**Why:** O criador substituiu o pedido anterior de percurso ilustrativo: “remova o detalhamento do demo apenas coloque o link”.

**How to apply:** Não reintroduzir o passo a passo das quatro telas, os cartões do percurso visual nem a simulação narrada de uma rodada. Manter um único link para abrir o demo no idioma selecionado, preservando a visão, os conceitos do projeto e os links diretos antigos.

Os itens do menu da documentação não precisam de pontuação final.

**Why:** O criador pediu “os itens de menu nao precisam de pontuacao”, apontando os pontos finais nos nomes dos capítulos.

**How to apply:** Omitir pontuação final dos rótulos de navegação em todos os idiomas, no desktop e mobile, preservando títulos do conteúdo, números e pontuação interna necessária.

O menu mostra somente seção e subseção, nunca o terceiro nível ou níveis mais profundos.

**Why:** O criador substituiu a expansão detalhada do menu: “No menu, somente seção e subseção. Não vamos descer até o terceiro nível”.

**How to apply:** Aplicar o limite no índice desktop e no menu mobile, também ao rótulo compacto ativo. Subagentes e funcionalidades não têm setas para tópicos de terceiro nível; especialistas de Cripto ficam somente no corpo. Preservar todos os tópicos, numerações e links diretos no conteúdo. Nos capítulos principais, listar somente seus tópicos de segundo nível. Não reintroduzir controles globais de expandir tudo.

Usar termos em negrito com links internos para suas descrições e ampliar as referências úteis entre áreas da documentação.

**Why:** O criador pediu “use negrito nos termos e use links para linkar onde esta a descricao, Defi Defai etc” e depois reforçou “use mais intralinks na documentacao”.

**How to apply:** Levar o leitor às definições e aos assuntos relacionados, preservando o idioma e a navegação de capítulos. Não transformar cada repetição do mesmo termo em um link nem criar novos itens no índice para essas referências.

Os itens principais do índice devem começar recolhidos, inclusive o capítulo ativo, e permitir abrir ou fechar seus subitens individualmente.

**Why:** O criador reforçou: “precisamos poder recolher os itens princiais, os indices, eles tem que estar sempre recolhidos”.

**How to apply:** Abrir os índices somente por ação explícita do leitor, no desktop e mobile. Navegação e recarga não devem expandi-los automaticamente. Os controles do índice não recolhem o conteúdo do capítulo nem seguem a abertura de suas referências técnicas.

Atualizações da seção ativa por rolagem não devem recolher um índice que o leitor acabou de abrir; o destaque atual cobre a linha inteira, não fundos separados no nome e na seta.

**Why:** O criador relatou coloração falha e opções que pareciam recarregar ao selecionar BETTEX agent. A navegação por âncora e o acompanhamento de rolagem podem disputar a seleção durante o fechamento do menu.

**How to apply:** Separar foco/hover de seção atual e manter a seleção de destino durante a navegação. Recolher o índice ao abrir um novo menu, navegar explicitamente ou trocar idioma, não a cada atualização da posição de leitura.

Na documentação, não adicionar links para palavras diferentes: se não há um item para o termo, não adicionar link para outro assunto.

**Why:** O criador rejeitou o link de “blockchain” para DeFi e reiterou a correção ao encontrar ALFA com link: “só o básico que tenha sim uma seção ou subseção; se não tem, não põe link interno”.

**How to apply:** Manter somente termos básicos com definição própria ou nomes explícitos de seções/subseções correspondentes. Deixar sem link termos genéricos, ALFA, demo e prova de conceito; não encaminhar palavras para conceitos apenas relacionados.

Evitar fragmentar parágrafos curtos e relacionados em tópicos numerados e sanfonas independentes; reunir saída, frações, exemplo e regras complementares da participação em um único tópico. Segurança, controles e riscos materiais também formam um único tópico.

**Why:** O criador apontou os quatro trechos e corrigiu: “Tudo isso aqui podia ser um único tópico”.

**How to apply:** Usar um único cabeçalho e controle de expansão para esse conjunto, com parágrafos e rótulos internos simples; preservar as regras, o exemplo e os destinos dos links antigos.

Tokenomics é uma seção principal exclusiva, separada de Features.

**Why:** O criador pediu extrair de Features tudo que compõe tokenomics: “não é feature, é tokenomics”.

**How to apply:** Reunir emissão, venda, vesting, direitos, taxas, staking, distribuição de resultados, recompra e queima em Tokenomics. Features mantém as funcionalidades do aplicativo. Preservar o conteúdo e os links antigos; não mover controles técnicos de Risco ou Tesouraria para fora de seus responsáveis.

O menu da documentação não exibe números de seção nem de subseção.

**Why:** O criador corrigiu: “nao precisa por o numero no menu cara nem de secao nem subsecao”.

**How to apply:** Mostrar somente os títulos no índice desktop, nas opções do menu mobile e no seletor da seção ativa. Preservar a numeração dos títulos no conteúdo.