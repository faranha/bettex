# Execuções isoladas de simulação

Decisão vigente: a autorização do criador permite fixtures apenas em modo explícito de simulação. Um contexto modular `simulation` coordena cenários e possui suas execuções, relógio e persistência, reutilizando APIs públicas de agentes, risco, execução, ledger e conciliação. Não cria aplicação paralela nem replica os motores financeiros.

Cada execução tem proprietário, ID, versão, relógio, cenário e parâmetros de teste. A persistência é independente das tabelas de contas/carteiras financeiras, alpha de dados reais, subledger paper operacional e testnet. Contas e carteiras do cenário são identificadores inertes, sem chaves.

Todas as mutações exigem sessão nativa de desenvolvimento, origem permitida, CSRF, proprietário, idempotência e revisão otimista. Não concedem autoridade sobre políticas ou recursos do app. Reset elimina somente a execução selecionada do proprietário; preserva recibo de idempotência e gera novo ID.

Probabilidades, preços e limites de cenário são parâmetros provisórios de validação, não modelo calibrado nem política econômica publicada. Reutilizar participação por saldo/tempo e plano 50/25/25 já definidos. Travas de liquidação/distribuição incluem posições e reservas abertas, resultado positivo, reserva defensiva, elegibilidade e mesma rodada; não criar retorno de lucro retido ou frações acumuladas.
