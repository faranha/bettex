# Helpers — ajuda contextual e utilitários do aplicativo BETTEX

Este documento distingue **ajuda para quem usa o aplicativo** de **funções de apoio ao código**. Um helper explica ou apresenta dados; não aprova política, concede orçamento, assina ou envia ordens.

## 1. Ajuda da Central da IA

Implementação: `components/agent-operations/AgentHelp.tsx`. Conteúdo: `AgentOperationsDashboard.tsx`. Todos os textos têm variantes PT/EN/ES.

| Ajuda | Localização | O que explica | Limite |
|---|---|---|---|
| Sobre esta área | Cabeçalho, painel resumido e Central | Leitura/simulação; serviço recente versus decisão; procedimentos determinísticos | Não apresenta os serviços como modelos de linguagem ou autorização financeira |
| Como ler este agente | Cabeçalho do detalhe selecionado | Rodar dentro do prazo não significa poder avançar | Análise saudável não comprova vantagem financeira |
| O que é esta previsão | Previsão de BTC, ETH ou SOL | Allora publica preço futuro em USD | Não fornece probabilidade de evento Polymarket |
| Sobre o histórico | Cabeçalho do histórico | Registros persistidos e navegação para páginas antigas | Sem reconstrução de atividade retroativa; páginas antigas não recebem atualização periódica |
| Saúde das entradas | Documentação → Entradas | Validações do procedimento; distinção entre atividade, análise e decisão | Resposta HTTP sozinha não prova validade, completude ou calibração |
| Regras de orquestração | Documentação → Regras | Dependências avaliadas antes dos consumidores; relatórios vinculados no mesmo ciclo | Hierarquia de apresentação não substitui as dependências declaradas; não há votação |
| Orçamento e bloqueio | Documentação → Não é autorização financeira | Política e orçamento pertencem aos controles externos à apresentação | Monitorar/manter/bloquear não movimentam fundos; a análise não substitui reserva/autorização financeira |
| Sobre a evidência histórica | Relatórios com evidência, atuais ou históricos | Valor visto na execução, fonte, produção/alvo e bloco quando disponíveis | Registro antigo conserva seu valor; não é cotação atual nem prova de execução externa |

### Interação e acessibilidade

- O botão com interrogação tem nome acessível e estado expandido.
- Abre com clique/toque ou Enter/Espaço. Não exige hover.
- Escape e interação fora fecham a nota; não é uma janela modal.
- O texto é associado ao botão por `aria-describedby` enquanto aberto.
- A nota usa portal no corpo da página, posição fixa, margem lateral de 12 px e largura máxima de 288 px. Reposiciona em rolagem/redimensionamento e permite rolar conteúdo alto.
- As ajudas não iniciam consulta financeira ou ciclo de agentes.
- A atualização dos dados não deve remontar as linhas abertas ou os helpers.
- Selecionar um agente no mobile leva ao detalhe, com margem para a navegação fixa. Esse movimento não muda a decisão do agente.

## 2. Outras ajudas do aplicativo

### Procedimento e orçamento da orquestradora

`components/demo/OrchestratorHelp.tsx`, exibido pelo console, apresenta uma explicação expandível da **emulação**, não a política financeira efetiva.

Explica capital operacional, reservado e disponível, limites ilustrativos, elegibilidade, pontuação, desempate, estados da fila e acompanhamento até conciliação. Os parâmetros e resultados dessa emulação não constituem um modelo calibrado.

Allora alimenta o gráfico e os especialistas de análise, **não as propostas geradas por essa emulação**. Evitar o rótulo geral “Allora não está conectada”, que confunde esses fluxos distintos.

### Termos financeiros

`Term`, em `components/demo/fin.tsx`, apresenta uma explicação junto de um termo. O conteúdo é fornecido pelo chamador no idioma selecionado. Usa o componente de tooltip; pode abrir por foco/hover e também por clique. Não é um botão de movimentação financeira.

### Ações da carteira

`WalletAction`, em `components/demo/WalletAction.tsx`, combina ícone, nome acessível e tooltip com o rótulo da ação. Clique abre a ação correspondente ao **ativo informado pelo chamador**. O tooltip não executa a transação; o formulário e suas validações continuam sendo a autoridade para a ação.

### Gráficos

O tooltip do gráfico Allora apresenta horário de produção e preço USD do ponto observado. Não interpreta o preço como confiança ou probabilidade. O gráfico do ciclo mostra dados emulados e possui um acionamento separado para abrir a Central; clicar no gráfico não submete uma ordem.

## 3. Funções técnicas de apoio

| Helper | Local | Entrada e resultado | Cuidados |
|---|---|---|---|
| `useX` | `demo/ui.tsx` | Idioma atual e escolha entre textos PT/EN/ES | Não inserir texto de outro idioma fora da seleção |
| `useFmt` | `alpha-trading/format.tsx` | Formatação localizada de datas, unidades, cotas, motivos e dados alfa | Valores ausentes permanecem explicitamente ausentes |
| `dec6` | `alpha-trading/format.tsx` | String inteira em unidades de seis casas → texto localizado com seis casas | Usa BigInt; não converter unidades financeiras grandes para Number antes de formatar |
| `reasonText` / `codeLabel` | `alpha-trading/format.tsx` | Código diagnóstico → explicação localizada | Código desconhecido fica explícito; não transformá-lo em sucesso |
| `datumText` | `alpha-trading/format.tsx` | Dado alfa → valor, natureza/metodologia ou ausência | Não preencher probabilidades ou custos ausentes |
| `formatBrazilDateTime` / `formatBrazilTime` | `demo/brazil-time.ts` | Instante → apresentação em `America/Sao_Paulo` | Não alterar o instante UTC ou a aritmética de validade |
| `demoView` | `demo/demo-navigation.ts` | Caminho interno → área do aplicativo ou undefined | Reconhece aliases de idioma; não decide autenticação |
| `demoPath` / `demoLabel` / `demoPageTitle` | `demo/demo-navigation.ts` | Área e idioma → rota interna, nome ou título | A camada de navegação aplica o prefixo do artefato/idioma; não trocar os identificadores das áreas |
| `useMoney` / `Money` | `demo/fin.tsx` | Valor/ativo e contexto de taxas → número, ticker e BRL aproximado | Apresentação não altera saldos; aproximação não comprova cotação executável |
| `useClock` | `demo/fin.tsx` | Horário do servidor → relógio de apresentação corrigido | Não substitui relógio/validação do servidor para autorização |
| `useOperationStatusLabels` | `demo/OrchestratorHelp.tsx` | Estado da operação emulada → rótulo localizado | Não converter estado emulado em execução real |
| `safeUrl` | `agent-operations/AgentOperationsDashboard.tsx` | URL de evidência → link apenas para HTTP(S) | Restringe protocolo, não certifica a reputação ou veracidade da fonte |
| `factText` | Mesmo arquivo | Código/valor → previsão USD com duas casas, unidades exatas ou texto | Arredondamento é apenas visual; histórico/API conservam a precisão original |
| `age` e cálculo de frescor | Mesmo arquivo | Horário do recibo e idade da última resposta → tempo decorrido | Não congelar recibo recente após falha de atualização; três minutos é a janela de atividade, não o horizonte Allora |
| `RunBody`, `RunCard`, `Forecast`, `Row`, `docs` | Mesmo arquivo | Dados persistidos → elementos de relatório/lista/manual | São funções de renderização; não criar novos tipos de componente a cada polling e perder foco/detalhes |
| `ChapterVisibility` | `components/ChapterVisibility.ts` | Capítulo ativo → contexto de visibilidade dos gráficos | Preserva conteúdo/índice e estado do leitor; não mede gráficos Recharts dentro de capítulo oculto |

## 4. Revisão e diagnóstico

Ao modificar um helper, conferir:

1. Texto coerente com o procedimento atual, sem confundir emulação, observação pública e operação financeira.
2. Nome acessível, uso por teclado e toque, fechamento e posicionamento em tela estreita.
3. Idioma consistente e números/horários corretos.
4. Estado vazio, evidência ausente ou vencida, falha de atualização e histórico.
5. Ausência de efeito financeiro em uma ajuda ou função de apresentação.

As responsabilidades e entradas dos 13 serviços estão em [agents-operations.md](agents-operations.md). O fluxo financeiro e suas exigências continuam em [agent-hierarchy.md](agent-hierarchy.md), não nos tooltips.

Os utilitários offline de avaliação de modelo e profundidade estão documentados em [market-validation.md](market-validation.md). Não são helpers de autorização nem componentes do ciclo operacional.
