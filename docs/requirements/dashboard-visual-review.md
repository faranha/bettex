# Revisão do dashboard, documentação e helpers

## Escopo efetivamente revisado

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
