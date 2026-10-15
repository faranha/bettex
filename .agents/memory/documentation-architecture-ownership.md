---
name: Documentação orientada por atores e features
description: Modelo exigido pelo criador para organizar a linha de base por inteligência central, subagentes e funcionalidades determinísticas.
---

A arquitetura do projeto é baseada em um agente BETTEX, inteligência central orquestradora, seus subagentes e features não agênticas. Os agentes e subagentes são atores principais da documentação, não um complemento de um catálogo técnico.

**Why:** O criador explicou que referências técnicas estavam sem conexão e sem agrupamento pelo subagente responsável, e pediu documentação que acomode “a arquitetura real do sistema” baseada em “agente, subagentes e features”.

**How to apply:** Cada ator deve reunir suas capacidades já descritas, regras iniciais, ponto de partida e baseline, com as referências técnicas pertinentes no próprio item. Apresentar a inteligência central e depois seus subagentes. Separar staking, Carteira BETTEX, Carteira USDC, exportação e demais mecanismos determinísticos das inteligências que analisam ou propõem decisões. Material realmente compartilhado pode ter endereço comum, mas não deve retirar dos atores suas capacidades e regras específicas. Não promover controles fixos a agentes nem reduzir os agentes inteligentes aos monitores determinísticos legados.

Não criar uma subseção com o mesmo nome do agente dentro do próprio capítulo. Distribuir os requisitos técnicos pelo responsável, não apenas criar links para um catálogo separado.

**Why:** O criador apontou a repetição dos nomes de todos os agentes e reiterou que os requisitos deveriam ter sido distribuídos entre as respectivas seções.

**How to apply:** O capítulo identifica o agente uma única vez; seus subitens identificam capacidades, baseline e requisitos concretos. BETTEX reúne execução e conciliação de ordens; Risco reúne limites, precisão e recuperação; Tesouraria reúne reservas, custos e proteção de fundos; Governança reúne aprovações e adequação legal; cada agente de mercado reúne suas fontes e conectores. Somente infraestrutura realmente comum permanece na base técnica compartilhada. Preservar regras, estados de disponibilidade, idiomas e âncoras ao mover conteúdo.

A reorganização também precisa permitir que pessoas sem conhecimento prévio aprendam a arquitetura.

**Why:** O criador pediu um plano de analista/arquiteto de software “tambem revisado por um designer instrucional, para educar as pessoas tambem”.

**How to apply:** Preservar a sequência conceito e finalidade → papel no sistema → capacidades → baseline e regras → referência técnica, reaproveitando as introduções existentes. Uma proposta de organização não autoriza inventar capacidades, novos atores ou protocolos de comunicação.

A documentação deve distinguir o demo/POC da especificação da ALFA. O escopo atual inclui documentar ambos, sem mudanças de código.

**Why:** O criador atualizou a ordem anterior, reiterando: “nao queremos mudanca de codigo queremos documentação para o demo e o alfa”.

**How to apply:** Documentar ambos com escopos e estados explícitos, sem apresentar especificação como funcionalidade entregue ou aprovada. Não inventar poderes, protocolos ou parâmetros ainda não definidos. Ver [escopo documental](documentation-update-scope.md) para a restrição de alterações.

A faixa vermelha da documentação deve usar exatamente: “Esta documentação cobre a versão demo off-chain (POC) da BETTEX”. Não acrescentar “também” nem qualificações adicionais. Não deve afirmar que o conteúdo é administrado pelo subagente de governança.

**Why:** O criador pediu essa explicação para evitar confusão, rejeitou a observação sobre governança na faixa e depois forneceu o texto exato.

**How to apply:** Preservar o aviso de escopo nos três idiomas, sem usar essa correção da faixa para remover o agente de governança da arquitetura.

O mercado citado na abertura da documentação é “esportes (surebet)”, não “esports”.

**Why:** O criador corrigiu explicitamente a identificação desse mercado.

**How to apply:** Não confundir esportes com esportes eletrônicos nas descrições da arquitetura. Preservar o mesmo sentido nas traduções.

Na abertura da documentação, a proposta deve ser expressa como: “A proposta da BETTEX é transformar apostadores em investidores por meio de um projeto DeFAI”.

**Why:** O criador forneceu essa frase para substituir a descrição por estratégias de mercado, automação por IA e gestão de risco.

**How to apply:** Manter essa formulação e seu sentido nas traduções, sem acrescentar explicações à frase aprovada.

Toda a documentação ainda é teórica e será consolidada antes do lançamento da versão ALFA.

**Why:** O criador exigiu essa explicação ao revisar a apresentação tecnológica da documentação.

**How to apply:** Apresentar arquitetura, integrações e regras como propostas a consolidar e validar, não como uma versão operacional já entregue.

Na apresentação tecnológica, citar obrigatoriamente Allora como alternativa de inferência e explicar sua função.

**Why:** O criador pediu expressamente a inclusão da Allora como alternativa, não como integração presumida.

**How to apply:** Explicar que pode fornecer previsões e sinais agregados para apoiar a análise; não substitui a inteligência da BETTEX, não controla carteiras nem executa ordens.

Ao mencionar nominalmente uma tecnologia candidata, usar “caso utilizada”, “na hipótese de adoção” ou equivalente. Nenhuma escolha tecnológica está 100% confirmada.

**Why:** O criador reiterou essa condição para nomes como Allora e Starknet e pediu explicitamente não alastrar a noção.

**How to apply:** Qualificar a adoção das tecnologias pelo nome, sem espalhar ressalvas às regras, à visão ou aos demais assuntos. Preservar fatos verificados sobre fornecedores externos; existência de uma API ou consulta pública não confirma sua adoção pela BETTEX.

O agente BETTEX seleciona a melhor oportunidade.

**Why:** O criador esclareceu explicitamente o responsável pela seleção no fluxo de oportunidades.

**How to apply:** Nomear o agente BETTEX nessa decisão, preservando os critérios de comparação e o registro dos motivos.

Todos os subagentes e especialistas devem ter uma estratégia-base de treino descrita, suficiente para fundamentar as propostas e os registros ilustrativos do demo, e acesso ao aprofundamento técnico correspondente.

**Why:** O criador pediu “uma estratégia básica pra todos” para conseguir documentar os pedidos e apontou a falta de aprofundamento técnico nos especialistas.

**How to apply:** Distinguir roteiro documental de treino realizado ou estratégia validada. BTC, ETH e SOL compartilham a base de Cripto; não criar setores ou mandatos independentes. Preservar as referências por responsável e ligá-las aos perfis, ao protocolo comum e ao contrato da ordem. Não ativar operação ou persistência no demo.
