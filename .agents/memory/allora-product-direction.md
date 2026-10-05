---
name: Allora e visualização operacional
description: Direção do criador para inferência e gráficos do painel; diferenças importantes entre as interfaces Allora.
---

O criador quer começar a trabalhar com a Allora e chamar suas inferências. No painel, não quer “Resumo da operação” como cartões/texto principal: quer gráfico ao vivo, visualmente vivo, que abra a Central da IA ao clicar.

O criador exige Allora conectada às análises dos agentes, não apenas um gráfico de consultas; dashboard completo, todos os agentes previstos, documentação detalhada por agente e tooltips.

**Why:** O criador corrigiu explicitamente a entrega que mostrava a fonte sem integrá-la aos agentes e disse que o sistema estava longe de estar completo.

**How to apply:** Organizar e executar a integração operacional; distinguir execução do serviço, análise, proposta e autorização financeira. Não apresentar cartões, metadados ou leitura de preço como agentes prontos para operar.

**Why:** O criador disse que ninguém vai ler o resumo e que as pessoas querem ver o que está acontecendo ao vivo. Exigiu ler a API da Allora antes de decidir a visualização.

**How to apply:** Planejar a visualização a partir de dados efetivamente disponíveis e distinguir mercado observado, inferência e decisão/execução. Não simular uma previsão e atribuí-la à Allora.

A documentação da Allora distingue API assinada autenticada e leitura pública Cosmos LCD. A leitura pública foi verificada neste ambiente. Conferir o manifesto de redes: páginas gerais podem conter namespace antigo. Inferências atuais usam bundles rotulados; campos de intervalo declarados no SDK não significam que estejam presentes na resposta.

**Why:** A pesquisa encontrou diferença entre a página genérica e o manifesto de redes, e documentação explícita de campos de confiança não populados.

**How to apply:** Resolver rede/versão/horário de bloco antes de consumir; não presumir que `combined_value` seja escalar nem inventar faixa de confiança. Ver detalhes e fontes em docs/allora-live-chart-research.md.