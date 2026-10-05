# Percurso integrado de testes BETTEX

## Fontes e decisões

| Requisito | Fonte e seção | Estado |
| --- | --- | --- |
| Carteiras pessoais, sessão, cofre e propriedade | `docs/decisions/0006-personal-test-wallets.md`, §§ conta, cofre e associação inicial; `replit.md` §102 | Aprovado. Reutilizar; sem migração Clerk. |
| Principal da compra na tesouraria e taxa separada | `replit.md` §§89, 92, 115; `BettexPrimarySale.sol`, `_purchase` e `APP_FEE_USDC` | Aprovado. Efeitos confirmados em eventos ERC-20 da mesma compra. |
| Vesting público predefinido | `docs/contracts/bettex-testnet-spec.md`; `TestnetSchedule.sol`, `releasedGroups`; `BettexPrimarySale.sol`, `inventory` | Aprovado; o fixture local utiliza 36 datas mensais, não emissão adicional. |
| Quantidade × tempo, carteira oficial, rodada UTC | `replit.md` §§101, 104; §105 para saídas | Aprovado: modelo por saldo, sem depósito custodial; entradas não são retroativas, saída parcial cancela peso anterior. |
| Usar unidades inteiras e fonte conciliada | `docs/architecture.md`, Fontes de verdade/Operação/Falhas; decisão 0002 | Aplicado aos valores do percurso. Não equivale a ledger patrimonial completo. |
| Repetição/reinício/resposta perdida | `replit.md` §172; `docs/architecture.md` §§72, 82 | Uma etapa reserva nonce/executor antes do conector. Confirmada/incerta não é reenviada. |
| Reservas/apuração/distribuição | `replit.md` §§90, 95, 154–174 | Regras aprovadas, controlador/apuração desta entrega anterior ainda incompletos. Indisponíveis, não zeros inventados. |
| USDC na carteira de ganhos | `replit.md` §90 vs anexo antigo §157 | Divergência identificada. Este percurso não realiza pagamentos de staking nem escolhe novo destino. |

“STC” não é um ativo encontrado na documentação/configuração vigente. O ativo implementado é USDC de teste com 6 decimais, separado de BETTEX com 18 decimais. O fixture local não é o USDC Circle público.

## Ambiente e limites

- Sessão: cadastro existente em `/testes/conta`, apenas desenvolvimento.
- Rede disponível para o percurso verificado: **EVM local 31337**, não testnet pública.
- A associação local exige consentimento explícito no recebimento de saldo de teste. Cadastro continua criando a associação original Arbitrum Sepolia.
- Reserva local: MockUSDC já emitido no fixture (100.000 USDC fictícios) e ETH de gênese do nó. Receber saldo transfere da reserva, não altera saldo SQL nem cunha moedas a cada pedido.
- Abastecimento: 25 USDC, 0,003 ETH na carteira pagadora e 0,001 ETH na Carteira BETTEX; uma solicitação por conta/dia/execução local. Os valores são exclusivamente parâmetros do fixture, não tarifa ou política financeira de produção.
- Cotação local inicial: 0,05 USDC por BETTEX; a tela lê o preço do contrato, não de uma constante de interface. Taxa do canal de aplicativo: 2,50 USDC, conforme contrato existente.
- Para conferir recibos, o critério local é execução bem-sucedida, contrato/ativo/origem/destino/valor e evento exatos, bloco/índice/hash canônicos. Não aplicar esse critério à Sepolia pública sem política própria.
- Saída e reentrada no aplicativo e reinício do backend preservam registros PostgreSQL e a conciliação com o mesmo nó. Reiniciar o **nó EVM local** inicia outra cadeia; registros anteriores são preservados/identificados como outra execução, sem presumir saldo atual.
- Implantação pública, reserva pública financiada, assinatura institucional autorizada e política de confirmação pública continuam pendentes.

## Repetir pela interface

1. Abrir `/testes/conta`, criar conta, guardar senha e aceitar o aviso de ausência de recuperação.
2. Na aba Operações, conferir rede, endereço, ativo e QR de Depositar.
3. Aceitar o uso da EVM local e clicar em **Receber saldo de teste**. Aguardar os eventos confirmados e conferir USDC/gas.
4. Informar **100 BETTEX**, clicar em Cotar compra: principal **5 USDC**, taxa **2,50 USDC**, total **7,50 USDC**, gas separado e Carteira BETTEX destinatária.
5. Confirmar os dados e a senha para a aprovação exata; ela não compra tokens.
6. Confirmar novamente a compra final após a estimativa de gas da compra estar disponível.
7. Conferir **17,50 USDC** restantes, **100 BETTEX** recebidos/elegíveis, início e peso temporal, principal **5 USDC** efetivamente recebido pela tesouraria e taxa separada.
8. Consultar hashes/blocos/índices no histórico. Sair e entrar novamente; os mesmos registros devem permanecer.

9. Executar/retomar **Distribuição de teste**: resultado sintético global limitado a 1 USDC por rodada UTC. Se este for o único peso elegível, recebe 0,25 USDC; reexecutar não duplica o hash nem o saldo. Consultar a entrada em Distribuições no histórico compartilhado.

O journal USDC/BETTEX reconstrói e concilia saldos de carteiras/tesouraria em unidades inteiras, com reversões auditadas em reorganização. Não oferece recompra automática, conversão inversa on-chain ou lucro de trading real. Ver [limites da liquidação local](../decisions/0010-local-round-settlement.md) e [matriz da revisão](../requirements/review-2026-10-05.md). Valores do demo emulado não são evidência da EVM. Pagamento local por EOA não garante atomicidade contra saída concorrente de BETTEX ou virada de rodada durante o envio; não está autorizado para finanças públicas.

## Referências técnicas oficiais

- https://ethereum.org/en/developers/docs/apis/json-rpc/ — balances, logs, receipts, nonce e raw transactions.
- https://docs.ethers.org/v6/api/providers/ — consultas e recibos; `/api/wallet/` e `/api/transaction/` — assinatura no navegador e transações.
- https://hardhat.org/docs/reference/network-manager — EVM simulada de desenvolvimento.
- https://www.postgresql.org/docs/current/explicit-locking.html — exclusão/locks duráveis do executor e nonce.
- https://developers.circle.com/stablecoins/usdc-contract-addresses — identificação da configuração Sepolia existente, não do fixture MockUSDC.

As fontes internas são normativas para economia; referências externas explicam a integração técnica, não aprovam novos percentuais.
