# Contrato de manutenção da documentação BETTEX

## Regra permanente do projeto

A estrutura da documentação foi construída e revisada com o criador e está aprovada. Ela funciona como o sistema próprio de documentação da BETTEX — “nosso próprio GitBook” — e deve ser preservada quando adicionarmos, editarmos ou removermos conteúdo.

**Por quê:** o criador destacou o trabalho investido na organização, na leitura e na navegação e pediu expressamente que essa estrutura seja respeitada nas próximas atualizações.

Uma solicitação de conteúdo não autoriza uma reformulação estrutural. Não redesenhar, substituir ou simplificar a experiência aprovada por iniciativa própria. Mudanças na estrutura exigem solicitação ou aprovação explícita do criador.

Este é um documento de manutenção do projeto, não um capítulo público sobre o funcionamento do produto. Deve ser lido antes de alterar a documentação.

## Organização aprovada

Preservar estas sete seções principais e sua ordem:

1. Visão do projeto.
2. Agente BETTEX.
3. Subagentes.
4. Features.
5. Tokenomics.
6. Base técnica e segurança.
7. Roadmap.

O conteúdo deve permanecer sob o responsável ou assunto correspondente:

- BETTEX e seus subagentes são os atores da arquitetura; não diluir suas responsabilidades em apêndices técnicos genéricos.
- Especializações BTC, ETH e SOL permanecem subordinadas a Cripto, não como setores independentes.
- Features reúne funcionalidades do aplicativo. Tokenomics é uma seção exclusiva para as regras econômicas; não devolver esses assuntos a Features.
- Baselines, treinamento e referências técnicas permanecem associados aos respectivos responsáveis.
- Apresentar conceitos e tecnologias antes de pressupor que o leitor os conhece. Manter continuidade entre introdução, funcionamento, regras e aprofundamento.

## Experiência de leitura e apresentação

- Exibir uma seção principal por vez na experiência normal, preservando o índice e o percurso de leitura. A versão completa usada pelas auditorias não deve substituir esse comportamento no aplicativo.
- Manter a hierarquia visual aprovada: títulos, subtítulos, separadores, recuos, guias e distinção entre níveis.
- Preservar as aberturas visíveis das seções. Subtópicos recolhíveis mantêm o padrão de expansão aprovado; não transformar a introdução em uma sanfona nem abrir todos os tópicos por padrão.
- Preservar o controle do leitor sobre o índice. Rolagem e atualização do destaque não devem fechar ou abrir opções inesperadamente.
- Menus desktop, opções mobile e seletor ativo mostram os títulos **sem números de seção ou subseção**. A numeração hierárquica permanece no conteúdo.
- Preservar a linha-guia amarela do menu, com recuos e ramificações que mostram a ligação entre cada seção e seus itens, tanto no desktop quanto no menu mobile. A indicação visual de hierarquia não deve depender da numeração.
- Preservar os desenhos e suas posições no contexto da explicação. Não reintroduzir “desenho X de Y”; referências devem identificar o assunto do desenho. A numeração dos passos internos de um fluxo não é a numeração dos desenhos.
- Preservar a organização das regras em tabelas e os agrupamentos de assuntos aprovados. Não fragmentar novamente trechos relacionados em várias sanfonas.
- Preservar a leitura e os controles no celular, sem sobreposição com a navegação fixa, cortes de conteúdo ou rolagem horizontal indevida.

## Ao adicionar, editar ou remover conteúdo

1. **Identificar o lugar correto.** Localizar a seção, o responsável e o nível hierárquico antes de alterar o conteúdo. Não criar uma nova seção principal como atalho editorial.
2. **Preservar o que não foi solicitado.** Alterar o conteúdo necessário sem refazer componentes, estilos compartilhados, ordem geral ou comportamentos de navegação.
3. **Manter a hierarquia coerente.** Atualizar índice, títulos, numeração do conteúdo, destinos e navegação anterior/próxima quando a inclusão ou remoção exigir.
4. **Proteger os links.** Preservar identificadores e links antigos sempre que possível. Quando um tópico deixar de existir, revisar referências e compatibilidade explicitamente; nunca deixar destinos quebrados ou encaminhar um termo para um assunto sem relação.
5. **Atualizar os três idiomas.** Manter PT, EN e ES equivalentes em conteúdo, regras, títulos, links e organização. Não misturar idiomas na interface.
6. **Preservar as condições do produto.** Não alterar regras econômicas, riscos, direitos, autorizações ou capacidades operacionais como consequência de uma mudança de apresentação.
7. **Respeitar o escopo das páginas.** Uma alteração documental não autoriza modificar a homepage ou o Pitch aprovados, inclusive por componentes e traduções compartilhados.
8. **Validar antes de entregar.** Confirmar que a inclusão ou remoção não descaracterizou a estrutura aprovada.

## Verificação de uma atualização

A verificação deve ser proporcional à mudança, utilizando as verificações existentes do projeto:

- Conferir estrutura, ordem, numeração do conteúdo e propriedade dos tópicos.
- Conferir índices, destinos internos, links antigos, referências e navegação anterior/próxima.
- Conferir tradução e preservação das condições normativas em PT, EN e ES.
- Executar o build completo do artefato com suas variáveis de execução quando houver alteração do conteúdo público, da composição ou da estrutura renderizada; respeitar as auditorias de HTML, conteúdo preservado, imagens e páginas protegidas.
- Quando a apresentação ou a interação mudar, conferir o trecho afetado em desktop e mobile pelo meio adequado.
- Não remover verificações nem enfraquecer as condições protegidas apenas para obter um resultado aprovado. Uma mudança estrutural autorizada pode exigir atualizar verificações específicas, mantendo as demais proteções.

Registrar o que mudou e informar qualquer efeito estrutural encontrado antes de ampliar o trabalho. Na dúvida entre acomodar novo conteúdo e modificar a experiência aprovada, preservar a experiência e consultar o criador.

## Referências de manutenção

- [Instruções gerais e prioridades do projeto](../PROJECT.md).
- [Estrutura canônica dos capítulos e da numeração](../artifacts/bettex-site/src/lib/documentation-structure.ts).
- [Títulos principais e resolução dos destinos](../artifacts/bettex-site/src/lib/documentation-navigation.ts).
- [Composição dos conteúdos por responsável](../artifacts/bettex-site/src/components/DocumentationOwnedContent.tsx).
- [Comportamento de leitura e navegação](../artifacts/bettex-site/src/components/WhitepaperSection.tsx).

Os arquivos de implementação mostram o estado atual. Este contrato registra a intenção aprovada e os limites para futuras alterações; não autoriza congelar conteúdo incorreto nem impede evoluções expressamente solicitadas pelo criador.
