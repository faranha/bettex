---
name: Demo exclusivamente visual
description: Escopo atual do app; substitui as exigências anteriores de testnet, operação e emulação persistida.
---

O criador pediu: “Vamos converter tudo em demo”. O app deve funcionar como demonstração visual com dados fictícios locais, sem depender de autenticação, banco, agentes reais ou testnet. Navegação, idioma, gráficos, filtros, abas e sanfonas continuam sendo interações visuais.

Transações, pedidos, novos registros, alterações persistidas, geração de relatórios e ações equivalentes devem abrir um overlay, sem executar a operação. O texto solicitado é: “Esse é um demo para a interface. É só uma demonstração visual, o software ainda está em desenvolvimento, nos acompanhe pela comunidade”, acompanhado do botão da comunidade.

**Why:** O criador substituiu expressamente o escopo operacional anterior por uma interface visual, depois de falhas de carregamento e serviços.

**How to apply:** Esta instrução prevalece sobre as memórias anteriores de fase ALFA, carteiras nativas/on-chain, emulação automática persistida, inferências reais e roteiros financeiros operacionais. Preservar registros e implementações existentes sem reativá-los no app. Não interpretar este escopo como permissão para excluir dados.

O criador reiterou: “não tem nada sendo virado em testnet”, “Substitua por endereços mock, registros mock” e “Tudo é um grande demo”, incluindo o botão Demo e o overlay com link da comunidade.

**Why:** Apenas parar os serviços não basta: os runtimes de testnet voltaram a rodar numa sessão posterior. Leituras operacionais também podem inicializar serviços ou acessar contas.

**How to apply:** Não manter runtimes blockchain configurados para iniciar; bloquear sua inicialização e não montar rotas operacionais ou autenticação na API. Endereços devem ser identificadores inequivocamente fictícios e não endereços utilizáveis. O botão Demo abre o mesmo aviso das operações.
