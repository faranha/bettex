# Percurso blockchain com as carteiras pessoais existentes

**Status:** desenvolvimento local; sem implantação pública.

O pedido de ponta a ponta substitui a entrega limitada a observação. Os contratos Solidity existentes serão reutilizados, sem novo token, AMM, staking custodial ou autenticação.

O percurso utiliza a sessão nativa e o cofre pessoal já existentes em `/testes/conta`: são as carteiras desse cadastro que podem pagar e receber sem exigir importação manual em outra carteira. Isso não migra nem apaga contas Clerk. Formulários cancelados não representam escolhas.

Participação é o modelo de saldo disponível na Carteira BETTEX, sem depósito adicional: replit.md, “todo BETTEX disponível na carteira oficial”, e regras de saída/rodadas. O início vem de eventos confirmados, não de saldo USD ou do instante de abertura da tela. Rendimentos permanecem sem apuração enquanto não existir liquidação conciliada; não reutilizar os rendimentos emulados.

Não existe implantação pública/reserva operacional financiada na configuração atual. Para demonstrar operações reais sem fingir transações Sepolia, uma EVM local de desenvolvimento executa os contratos existentes e o MockUSDC restrito à rede 31337. O aplicativo identifica explicitamente essa rede como local, não como Arbitrum Sepolia. Seu RPC não é exposto ao navegador: leituras e retransmissão de transações pessoais assinadas passam pelo acesso nativo e CSRF existentes.

O operador da EVM local usa a conta desbloqueada do nó para abastecer USDC/ETH fictícios; nenhuma chave operacional ou pessoal é carregada em código, logs ou contexto da IA. Chaves pessoais continuam cifradas e são utilizadas apenas pelo titular no navegador, com senha e autorização explícita para os dados exatos da transação.

Operações e etapas pertencem a `execution`, com reserva de nonce/executor persistida antes do envio. Hash conhecido antes de broadcast e/ou origem+nonce permitem conciliar resposta perdida. Reinício/timeout não autoriza novo envio. Evidências/participação e saldos são confirmados por RPC, sem projeção demonstrativa.

A EVM local não promete persistência após reinício do próprio nó. Cada execução possui identificação própria; operações de outra execução são conservadas, mas não apresentadas como confirmação na cadeia atual. Publicação e teste público dependem de contratos/endereço/reserva financiada/assinador operacional autorizado, não são substituídos por essa demonstração.

Fontes internas: AGENTS.md §§ Fluxo/Integridade; decisões 0002, 0003, 0006–0008; replit.md §§ participação automática, cancelamentos, reservas; Solidity BettexPrimarySale §§ inventory/buyTo; cadastro e cofre pessoais existentes. Referências externas: Ethereum JSON-RPC (eth_sendRawTransaction, eth_getTransactionReceipt, eth_getLogs), documentação ethers 6 (Transaction, Wallet, Provider), Hardhat 3 EDR e PostgreSQL locks/transactions. Não é implementada movimentação em mainnet.
