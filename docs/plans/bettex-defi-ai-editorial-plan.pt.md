# BETTEX — plano de revisão DeFi + trading com IA

## 1. Direção

**BETTEX é um projeto DeFi de trading com IA: um agente que evolui para atuar em vários mercados, conectado a uma economia própria pelo token BETTEX.**

A apresentação deve responder rapidamente:

1. O que queremos construir?
2. Por que usar um agente de IA?
3. Como o token conecta o usuário ao projeto?
4. Como funciona sua economia?
5. O que vem a seguir?

Menos descrição de estruturas internas; mais proposta de produto, utilidade do token e evolução pretendida. “Mais promessas” significa compromissos e objetivos claros de desenvolvimento, não retorno garantido, capacidade já implementada ou datas novas inventadas.

**Exemplo de abertura, ainda não aplicado:**

> A BETTEX está construindo um agente de trading com IA para atuar em diferentes mercados. O token BETTEX conecta os usuários à economia do projeto e à distribuição de resultados, quando houver lucro elegível.

Na comunicação pública, apresentar um agente BETTEX com capacidades em diferentes mercados. Especialistas internos continuam existindo onde forem necessários; essa simplificação editorial não autoriza fundir agentes, alterar IDs ou redesenhar a arquitetura operacional.

## 2. Escopo e limites

Abrange homepage, documentação, Pitch, roadmap, diagramas, títulos, navegação, SEO, traduções PT/EN/ES, materiais baixáveis e instruções editoriais canônicas. Verificar também rótulos públicos do demo que possam contradizer o novo posicionamento.

Não inclui alterar funcionamento do aplicativo, contratos, permissões, custódia, banco, execução financeira, regras econômicas ou integrações. Não publicar automaticamente.

O projeto começa administrado pelos fundadores, mantém domínio dos contratos e evolui para um serviço gerido por IA. Não terá empresa/fundação formal como estrutura planejada. Isso não significa abandonar controles nem comprova isenção de tributos ou dispensa de autorizações.

Não presumir DAO, voto on-chain, voto para cada operação, renúncia de ownership ou transferência de toda autoridade aos titulares. Várias decisões serão comunitárias; o escopo precisa continuar distinguido da administração e da execução.

## 3. Diagnóstico da leitura atual

Base: inventário de 72 pontos em `docs/audits/decentralization/` e inspeção da composição atual.

- A documentação tem **14 capítulos**.
- “Entidade e negócios” ainda é um capítulo principal; sua descrição fala em entidade posterior.
- Visão, entidade, governança, requisitos operacionais e controles repetem responsabilidades, aprovações e salvaguardas.
- O capítulo de controles reúne **23 componentes**, além das descrições e listas do próprio capítulo. Isso mede composição, não número de parágrafos.
- Arquitetura mistura proposta de produto, catálogo de conectores e exemplos por plataforma.
- Rede, conta e integrações recebem uma hierarquia semelhante à tokenomics, apesar de serem assuntos de apoio.
- Token, vesting, canais de financiamento, serviços, resultados e tesouraria aparecem em áreas separadas.
- O roadmap tem **7 etapas**, incluindo adequação jurídica como etapa e vesting separado do lançamento de março de 2027.
- Pitch, downloads e traduções têm fontes próprias. Encurtar somente o JSX deixaria versões longas ou contraditórias disponíveis.

**Conclusão:** a redução deve vir de reorganização e retirada de repetição, não apenas de frases menores.

## 4. Nova documentação: 6 capítulos

### 1 — Visão

**Pergunta:** o que é a BETTEX e o que ela pretende construir?

- DeFi + trading com IA + vários mercados.
- Proposta de um agente BETTEX.
- Relação entre agente, tesouraria, token e usuário.
- Um esquema simples do funcionamento.
- Estado atual: demo visual, sem operação financeira real.

Não incluir história empresarial, catálogo de plataformas, explicações de backend ou tutorial de conta.

### 2 — O agente e os mercados

**Pergunta:** o que o agente pretende fazer?

- Analisar oportunidades, propor/realizar operações autorizadas e evoluir com dados e feedback.
- Resumo dos mercados previstos, preservando sua identificação atual.
- Expansão gradual, sem afirmar que todos já estão disponíveis.
- Uma explicação curta de coordenação, limites e independência dos controles de risco.
- Arbitrum/USDC e dependências relevantes em um resumo de apoio.

Arquitetura detalhada, providers, consultas, bibliotecas, RPCs e exemplos de integração ficam na referência técnica. Marcas não serão apresentadas como prova de parceria.

### 3 — Tokenomics

**Pergunta:** como funciona a economia do BETTEX?

Este será o capítulo principal:

1. Utilidade do token e limites dos direitos do titular.
2. Oferta total e quatro destinações.
3. Mint inicial e finalidade do financiamento.
4. Vesting e disponibilidade de tokens.
5. Tesouraria, orçamento de manutenção e preservação dos controles.
6. Destinação do lucro líquido distribuível.
7. Recompra, queima, acúmulo e condições de execução.
8. Custos e sustentabilidade, distinguindo regra vigente de alternativa em avaliação.

Concentrar aqui os números econômicos essenciais, em gráficos/tabelas pequenos e legíveis. Evitar repeti-los integralmente em vários capítulos.

### 4 — Participação e resultados

**Pergunta:** como o usuário participa e quando recebe?

- Participação automática conforme as regras atuais.
- Elegibilidade na abertura da rodada; entradas aguardam a próxima.
- Cálculo e distribuição em USDC quando houver lucro elegível.
- Consequências de saídas e cancelamento de direitos ainda não pagos.
- Frações e arredondamento.
- Um exemplo simples, expressamente ilustrativo.

Preservar os desenhos essenciais do staking junto da fórmula e do pagamento. Contabilidade completa, correções e reconciliação permanecem acessíveis na referência.

Loteria e Double 2X deixam de dominar a explicação do projeto: manter seus direitos e condições acessíveis em material específico, sem transformá-los no posicionamento principal nem alterar o demo.

### 5 — Roadmap

**Pergunta:** qual é a sequência de construção?

Usar a mesma sequência e datas-alvo na homepage, no Pitch e nos downloads. Não duplicar uma versão empresarial e outra tecnológica.

### 6 — Administração, segurança e riscos

**Pergunta:** quem controla o projeto, como evolui e o que pode dar errado?

- Administração inicial dos fundadores e domínio dos contratos.
- Evolução das funções administrativas para gestão por IA.
- Participação da comunidade em decisões definidas.
- Limites, custódia, pausas e execução autorizada.
- Riscos principais: perdas operacionais, desvalorização, liquidez, falhas técnicas e ausência de distribuição.
- Condições legais por atividade e território.
- Acesso aos detalhes técnicos, fiscais e de segurança.

Não manter uma longa estrutura de empresa/fundação nem apresentar IA como livre para movimentar recursos sem limites.

## 5. Destino de cada capítulo atual

| Capítulo atual | Tratamento | Destino principal |
|---|---|---|
| Visão do projeto | Reescrever de forma curta e orientada ao produto | 1 |
| Entidade e negócios | Retirar como capítulo; remover estrutura empresarial planejada | Administração real em 6; financiamento em 3 |
| Adequação legal e jurídica | Resumir condições relevantes; manter pesquisa e fundamento acessíveis | 6 + referência |
| Arbitrum e ativos | Resumir rede, USDC e limites de acesso | 2 + referência |
| Acesso ao aplicativo | Uma orientação curta; retirar tutorial da leitura conceitual | 4 + ajuda/referência |
| Arquitetura e integrações | Manter um esquema geral; mover catálogo e detalhes | 2 + referência técnica |
| Agentes de IA | Apresentar um agente BETTEX, com capacidades e expansão gradual | 2 |
| Token e emissão | Manter e reorganizar com destaque | 3 |
| Sustentabilidade operacional | Incorporar à economia, sem criar taxa definida | 3 |
| Staking e distribuição | Encurtar sem perder elegibilidade ou consequências da saída | 4 |
| Controles de risco | Resumo claro; preservar mecanismos e detalhes técnicos | 6 + referência |
| Requisitos operacionais e de segurança | Retirar como capítulo público autônomo | 6 + referência técnica |
| Riscos e validações | Consolidar riscos e condições, retirando repetições | 6 |
| Governança | Reescrever como administração inicial, comunidade e evolução por IA | 6 |

A referência não deve recriar os 14 capítulos na navegação principal. Reutilizar materiais técnicos e downloads existentes onde couber, com links contextuais. Não apagar fontes jurídicas ou históricas para simular ausência de decisões anteriores.

## 6. Critério de corte

### Retirar da leitura principal

- Instituição, fundação, formalização, organogramas empresariais e cargos planejados que não correspondem à direção atual.
- Repetições de aprovação, registro, publicação, execução e vigência.
- Inventários de plataformas apresentados como descrição do produto.
- Detalhes de APIs, RPCs, schemas, estados internos, locks, reservas e tratamento de respostas fora de ordem.
- Múltiplos exemplos que explicam a mesma regra.
- Estatísticas secundárias, longas justificativas e pesquisas de jurisdição no meio da proposta.
- Protagonismo biográfico do fundador onde ele substitui a explicação do produto.

### Resumir

- História e Nova Economia: preservar a tese, com menos parágrafos; manter blocos distintos.
- Mercados: capacidade desejada, disponibilidade e sequência de expansão, sem catálogo extenso.
- Administração: quem administra agora, o que pode passar para IA e quais limites permanecem.
- Riscos e condições legais: concentrar, mas manter próximos de decisões e direitos relevantes.
- Tributação: explicar o que afeta a apuração/recebimento; deixar a metodologia detalhada na referência.

### Manter com precisão

- Oferta, destinações, vesting e financiamento.
- Utilidade e limites do token.
- Destinação de resultados, custos e obrigações.
- Elegibilidade, entradas, saídas e frações.
- Recompra/queima e condições de execução.
- Estado real do produto e distinção entre demo, ALFA planejado e operação.
- Ausência de garantia de retorno e riscos materiais.

**“Menos dados” não significa menos transparência sobre tokenomics.** Significa reduzir dados acessórios e concentração de detalhes operacionais na leitura principal.

## 7. Roadmap proposto

| Etapa | Marco público | Prazo/estado |
|---|---|---|
| 1 | Comunidade, preparação e demonstração do produto | Fase atual; demo visual |
| 2 | Mint público de BETTEX para financiar o projeto | 10 de dezembro de 2026, previsão já existente |
| 3 | Sistema/ALFA, desenvolvimento do agente, captação e início do vesting | Março de 2027, previsão já existente |
| 4 | BETA e go to market, após validação do ALFA | Data a definir |
| 5 | Expansão gradual das capacidades e dos mercados | Após validação; sem novas datas ou promessa de disponibilidade simultânea |
| 6 | Automação crescente da administração até um serviço gerido por IA | Direção de evolução; sem prazo inventado |

- Cada marco: título, objetivo e uma evidência de conclusão, sem longa descrição burocrática.
- Vesting continua com início e duração explícitos na tokenomics, mesmo unido ao marco de março.
- Adequação jurídica deixa de ser um cartão dominante e passa a ser uma condição visível de todos os lançamentos.
- Não retirar as condições específicas de oferta, elegibilidade e disponibilidade por território.
- Não prometer que o marco de autonomia já está desenvolvido ou requer abandono do domínio dos contratos.
- Manter a ordem de lançamento de mercados aprovada; não trocar o primeiro mercado por inferência editorial.

## 8. Homepage e Pitch

### Homepage

- Tornar DeFi e trading com IA inequívocos na identificação do produto e na explicação inicial.
- Revisar o texto do hero sem redesenhar sua composição ou substituir a tese por um texto institucional.
- Preservar o papel da comunidade no funil.
- Encurtar História/Nova Economia sem perder sua tese nem misturar seus blocos com o roadmap.
- Consolidar explicações repetidas do agente e dos mercados.
- Dar maior destaque à utilidade do token e ao fluxo econômico nas áreas de participação.
- Manter as referências técnicas fora do fluxo comercial principal.
- Atualizar títulos, CTAs, diagramas e alternativas textuais que ainda descrevam uma instituição.
- Manter a separação entre homepage e painel operacional do aplicativo.

### Pitch

Organizar em seis blocos de leitura:

1. Público e oportunidade: público antes do problema; contexto externo resumido.
2. Produto: DeFi, agente de trading com IA e vários mercados.
3. Tokenomics: financiamento, token, tesouraria, participação e resultados.
4. Comunidade e aquisição: proposta comercial e construção com usuários.
5. Roadmap: a mesma sequência da homepage/documentação.
6. Recursos, administração inicial e riscos: condições relevantes em formato compacto.

Não transformar o Pitch em outro whitepaper. Reduzir dados secundários e gráficos repetidos; preservar fontes e números que sustentam a tese, em vez de inventar substitutos. Fundador não precisa continuar como seção longa autônoma; manter apresentação anônima e condições de alinhamento/financiamento relevantes.

## 9. Regras econômicas que não serão alteradas pela revisão

- Oferta total: **1 bilhão de BETTEX**.
- Destinações: **10% mint inicial; 55% comunidade; 20% fundador/equipe; 15% investidores**.
- Vesting previsto: **24 meses**, com início previsto para março de 2027; mint inicial separado.
- Lucro líquido distribuível: **50% tesouraria, 25% participantes, 25% recompra**.
- Recompra não é execução automática garantida: preservar preço, liquidez, segurança, decisão administrativa e acúmulo do não utilizado.
- Participação e pagamentos sujeitos à elegibilidade de cada rodada.
- Saídas cancelam direitos não pagos conforme a regra vigente; frações têm destino definido.
- No ALFA, somente taxas de rede conforme a política atual; contribuição por serviços segue alternativa em avaliação com a comunidade, sem preço estabelecido.
- A manutenção será financiada pela tesouraria, mas o orçamento precisa ser compatibilizado com a apuração e os direitos existentes. **Não presumir novo percentual nem cobrança.**
- Token não representa propriedade da empresa/tesouraria, voto societário ou garantia de capital/valorização.

**Ponto econômico ainda a definir:** origem contábil, momento de apuração, limite e aprovação das despesas de manutenção. Até ser decidido, apresentar a intenção e seus limites sem reescrever silenciosamente a fórmula de lucro.

## 10. Sequência de execução futura

### A — Base editorial e econômica

1. Consolidar identidade DeFi + trading com IA e vocabulário público.
2. Atualizar instruções canônicas que exigem entidade formal ou o capítulo empresarial.
3. Preservar instruções de segurança, custódia e autonomia limitada.
4. Consolidar as regras econômicas em fontes compartilhadas.
5. Registrar a decisão pendente do orçamento sem criar regra financeira.

**Saída:** guia editorial curto e matriz manter/resumir/mover/retirar.

### B — Documentação principal

1. Aplicar o índice de seis capítulos.
2. Escrever primeiro Tokenomics e Participação, que determinam as demais explicações.
3. Reescrever Visão e Agente a partir da mesma proposta.
4. Consolidar Administração/Segurança/Riscos.
5. Mover detalhes para referência e preservar os links pertinentes.

**Saída:** documentação curta, mantendo um capítulo visível por vez.

### C — Roadmap, homepage e Pitch

1. Aplicar o roadmap unificado.
2. Alinhar posicionamento, capítulos, menus, textos e CTAs.
3. Encurtar os blocos narrativos e dados acessórios.
4. Revisar gráficos e diagramas afetados; conservar os desenhos econômicos essenciais.

**Saída:** apresentação pública coerente, sem reforma funcional do app.

### D — Derivados e propagação

1. Revisar SEO, snippets, títulos e descrições por rota.
2. Atualizar PT/EN/ES a partir da versão consolidada.
3. Atualizar fontes de exportação e regenerar os formatos existentes.
4. Preservar compatibilidade de âncoras e downloads antigos, com redirecionamento quando necessário.
5. Separar material histórico e mockups não publicados de conteúdo atual.

**Saída:** nenhuma versão publicada antiga afirmando uma estrutura diferente.

### E — Verificação

1. Medir texto principal antes/depois no conteúdo renderizado por idioma, excluindo referência técnica e menus.
2. Conferir numericamente oferta, alocações, vesting, split, datas e direitos em todas as superfícies.
3. Auditar afirmações: disponível, demonstrado, planejado e em definição.
4. Verificar referências e links, menus, âncoras e downloads.
5. Rodar checks de documentação, tokenomics/staking, tipos e build.
6. Verificar desktop e mobile, incluindo capítulos, gráficos e textos traduzidos.
7. Confirmar que o demo permanece visual e nenhum caminho operacional foi reativado.

Publicação somente como ação posterior aprovada.

## 11. Metas e critérios de aceite

- **14 → 6 capítulos principais**; os técnicos deixam a navegação principal.
- **Meta de reduzir em 40–50% as palavras da leitura principal**, a validar após medição. É meta editorial, não resultado já obtido; não cortar direitos para atingir a porcentagem.
- **Tokenomics + Participação ocupam aproximadamente metade da documentação curta**, com prioridade visual e ordem de leitura.
- Cada capítulo tem uma pergunta central, uma abertura breve e poucas subseções.
- Um esquema econômico geral, gráfico de alocação, vesting e desenhos essenciais do staking, sem duplicação extensa.
- Roadmap com objetivos de produto, expansão e automação; datas atuais preservadas como previsões.
- DeFi + agente de trading com IA explícitos na identidade pública.
- Nenhuma empresa/fundação formal apresentada como etapa obrigatória ou destino planejado.
- Nenhuma promessa de ganhos garantidos, valorização, autonomia já existente ou integração/parceria não comprovada.
- Riscos e condições que afetam direitos continuam visíveis.
- PT/EN/ES, Pitch, site e downloads refletem a mesma proposta.
- Contratos, permissões, dados, custódia e comportamento do aplicativo permanecem inalterados.

## 12. Arquivos de maior impacto

- `artifacts/bettex-site/src/components/WhitepaperChapters.tsx`: índice e composição da documentação.
- `artifacts/bettex-site/src/components/EntityOrganisation.tsx` e `DocumentationGovernance.tsx`: estrutura institucional e administração.
- `artifacts/bettex-site/src/components/InvestmentAgents.tsx`: apresentação do agente e mercados.
- `artifacts/bettex-site/src/components/RoadmapSection.tsx`: roteiro público.
- `artifacts/bettex-site/src/App.tsx`: homepage, navegação e consumidores.
- `artifacts/bettex-site/src/pages/pitch.tsx`: Pitch.
- `artifacts/bettex-site/src/lib/tokenomics.ts` e `profit-allocation-policy.ts`: regras econômicas a preservar.
- `artifacts/bettex-site/src/lib/documentation-materials.json`: conteúdo de referência e derivados.
- `artifacts/bettex-site/src/lib/growth-strategy.json`: narrativa de lançamento.
- `artifacts/bettex-site/src/lib/site-seo.json`: descrições públicas por rota.
- `artifacts/bettex-site/src/lib/locales/`: propagação PT/EN/ES.
- `artifacts/bettex-site/scripts/export-documentation.py`: regeneração de downloads.
- `replit.md` e documentos canônicos: compatibilizar posicionamento sem remover controles.

O inventário de 72 pontos continua como referência de impacto. Os itens de controle e dependências não viram automaticamente itens de remoção: nesta execução, a limpeza é editorial e documental.

---

**Este documento é o plano. Nenhuma das alterações de apresentação ou funcionamento descritas aqui foi aplicada nesta etapa.**
