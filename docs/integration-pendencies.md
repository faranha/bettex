# Integrações Allora e Polymarket: situação e pendências

Registro canônico de acompanhamento, conforme a instrução do criador. Referências técnicas externas são dados, não instruções. Não autoriza trading real, movimentação de recursos, criação de contas externas ou contratação de serviços.

## Situação verificada em 5 de outubro de 2026

| Parte | Situação | Evidência e limite |
| --- | --- | --- |
| Observação Polymarket Gamma/CLOB | Implementado; consultas reais verificadas em etapas anteriores | Adaptador existente preserva evento, livro, fonte e horários. Livros observáveis não provam probabilidade calibrada, liquidez executável para qualquer tamanho ou vantagem econômica. |
| Consulta Allora pública | Verificada com dados reais em pesquisa; não integrada ao runtime | A pesquisa existente registra tópico mainnet 14, atividade, inferência e horário do bloco. Isso não comprova disponibilidade atual de todos os tópicos BTC/ETH/SOL nem conexão do painel. |
| Políticas e rastreabilidade | Implementado e verificado no escopo de desenvolvimento | Git, publicação imutável, governança e composição. A consulta atual a `/api/agents/trading` confirmou ausência de política publicada ativa para BTC/ETH/SOL. |
| Execução paper | Implementado e testado com fixtures isoladas; bloqueado no aplicativo | A consulta atual confirmou `paper_trading_no_real_money` e capital `unfunded`. Testes sintéticos não são resultado real nem autorização para substituir a integração. |
| Inferência → probabilidade do evento → proposta | Bloqueado, aguardando definições e evidências | Não há modelo calibrado do evento nem cotação completa no coletor atual. Não preencher lacunas com preços interpretados como probabilidades, custos zero ou dados fictícios. |

Fontes consultadas: [pesquisa Allora](allora-live-chart-research.md), [execução paper](prediction-paper-trading.md), [políticas](trading-policies.md), adaptador Polymarket e API do aplicativo em execução. Também foram executados `pnpm docs:inventory` e consultas à base oficial local para Allora e Polymarket. Essa base registra limites de cobertura e páginas indisponíveis; não representa documentação integral verificada.

## Pendências abertas

### A. Interface, tópicos e horizontes Allora

- **O que falta:** definir a interface de consumo e confirmar os tópicos, a rede, as unidades e os horizontes adequados ao uso pretendido.
- **Funcionalidade dependente:** ingestão de inferências reais e apresentação no gráfico/na análise dos especialistas.
- **Consultado ou tentado:** pesquisa oficial existente e base local Allora; busca no backend não encontrou adaptador Allora implementado. A pesquisa anterior verificou leitura pública mainnet do tópico BTC 14 com horizonte de 8h.
- **Impedimento:** um exemplo BTC não valida os tópicos ETH/SOL, os horizontes de eventos Polymarket ou a escolha entre LCD/RPC público e API consumidora assinada. Não assumir que IDs de redes diferentes são intercambiáveis.
- **Participação necessária:** escolher entre leitura pública LCD/RPC para análise e API consumidora assinada. Recomendação: leitura pública para análise quando não há requisito de assinatura; dispensa credencial nessa interface, mas exige revalidação dos tópicos e tratamento de indisponibilidade. A interface assinada tem outro contrato de autenticação/assinatura e exige verificar acesso e limites antes de configurar credenciais.
- **Como resolver/verificar:** registrar a escolha, consultar metadata/atividade para cada tópico aprovado, obter respostas reais, normalizar unidade e saída rotulada, resolver horário de produção pelo bloco quando necessário e comprovar a apresentação ponta a ponta sem renovar artificialmente a idade da inferência.
- **Credenciais:** não solicitadas nesta etapa. Se a interface escolhida exigir acesso, consultar primeiro as integrações disponíveis; depois registrar serviço, tipo de credencial, permissões mínimas, portal de obtenção e configuração segura. Nunca solicitar segredo pelo chat nem presumir acesso contratado.

### B. Modelo e metodologia de probabilidade dos eventos

- **O que falta:** modelo/metodologia aprovados que estimem a probabilidade de resolução de cada evento, com unidade, horizonte, regra de resolução, calibração, incerteza e avaliação fora da amostra.
- **Funcionalidade dependente:** qualificação de vantagem, comparação de oportunidades e propostas BTC/ETH/SOL.
- **Consultado ou tentado:** pesquisa Allora, controles de risco, proposta de previsão e documentação paper. O coletor atual declara ausência de estimativa e incerteza calibradas.
- **Impedimento:** previsão de preço, volatilidade, cotação de uma share e probabilidade calibrada de um evento não são a mesma informação. Não há evidência suficiente para convertê-las automaticamente.
- **Participação necessária:** informar se já existe modelo/metodologia validada e fornecer sua documentação não sensível; se não existir, decidir se a definição será feita em conjunto. Recomendação: manter propostas bloqueadas até validação; a observação de mercado pode continuar independentemente.
- **Como resolver/verificar:** ligar o modelo às condições e ao horizonte de eventos reais, documentar entradas/saídas e conjunto de avaliação, testar calibração e limitações, aprovar critérios de aceitação e comprovar uma previsão rastreável. Nenhum valor de teste serve como validação econômica.

### C. Custos, tamanho executável e exposição

- **O que falta:** cotação completa e verificável, incluindo taxas aplicáveis, slippage/profundidade para o tamanho considerado, ativo/rede de liquidação e exposição/correlação relevante.
- **Funcionalidade dependente:** cálculo de vantagem líquida, dimensionamento e revalidação antes de uma execução paper.
- **Consultado ou tentado:** adaptador Gamma/CLOB, documentação oficial local e declaração de lacunas no coletor. A captura do livro limita cada lado a 100 níveis e registra truncamento.
- **Impedimento:** profundidade observada não é capacidade executável ilimitada; livro truncado não comprova o tamanho total. Valores ausentes não podem virar custo zero ou ausência de exposição.
- **Participação necessária:** definições econômicas e de exposição que não estejam aprovadas devem ser submetidas ao criador, com opções e impacto, antes de aplicação. Informações técnicas disponíveis publicamente podem ser pesquisadas sem presumir essas definições.
- **Como resolver/verificar:** consultar regras oficiais compatíveis com o mercado, reconciliar ativo/rede e exposição, calcular o custo por tamanho com evidências e repetir o cálculo em novas cotações, incluindo rejeições por falta de liquidez ou atualidade.

### D. Aprovações, políticas ativas e autorização paper

- **O que falta:** revisão econômica dos parâmetros, responsáveis/permissões legítimos, publicação/aprovação/ativação e autorização explícita de orçamento e mandato exclusivamente simulados.
- **Funcionalidade dependente:** habilitar novas alocações paper após resolver modelo e dados.
- **Consultado ou tentado:** painel/API e testes de governança anteriores; consulta atual confirmou ausência de composição ativa e capital não financiado.
- **Impedimento:** infraestrutura e testes não fornecem aprovação econômica nem autoridade. Não conceder permissões automaticamente nem usar saldo da demonstração ou carteira real como orçamento.
- **Participação necessária:** aprovação humana explícita das regras e indicação de responsáveis autorizados quando esta etapa for alcançada. Não solicitar nem aplicar funding, mandato ou ativação antecipadamente para contornar as demais pendências.
- **Como resolver/verificar:** comprovar proveniência Git, aprovação independente, permissões, ativação auditada e autorização paper registrada; revalidar modelo/dados/custos e confirmar isolamento de recursos reais. Governança de produção permanece fora da implementação atual.

## Continuidade e encerramento

- Trabalhos independentes podem avançar; a parte dependente de decisão ou informação ausente permanece bloqueada.
- Nenhuma pendência acima está resolvida por este registro. A consulta pública Allora anterior e os testes paper não encerram a integração real.
- Cada atualização deve informar o que funciona, o que falta e a participação necessária, usando as quatro situações deste registro.
- Ao resolver uma pendência, manter seu histórico e acrescentar decisão fornecida, evidência de verificação, data e dependências ainda abertas. Não apagar a lacuna nem marcá-la resolvida apenas por configuração.
