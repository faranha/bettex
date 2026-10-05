# Especificação curta — contratos BETTEX de teste

Pesquisa registrada em 2026-10-05, **antes de escrever os contratos**.

## Fontes e precedência

As regras vigentes do criador em `replit.md` prevalecem sobre whitepapers antigos. A fonte técnica externa orienta código, não muda economia. O pedido atual permite implementar e verificar contratos de teste; não autoriza mainnet, pagamentos reais ou publicação automática.

| Requisito | Fonte interna, seção | Decisão e implementação proposta |
| --- | --- | --- |
| Arbitrum para o token | `WhitepaperChapters.tsx`, `documentacao-rede`; `docs/personal-test-accounts.md`, rede | Alvo público de teste: Arbitrum Sepolia 421614. Execução nesta entrega somente EVM local 31337 |
| Oferta 1.000.000.000; 65/20/15 | `src/lib/tokenomics.ts`; `documentacao-emissao` | ERC-20, emissão única no construtor; alocações de 650/200/150 milhões integralmente bloqueadas |
| Toda emissão sob vesting | `VestingSchedule.tsx`, `documentacao-vesting` | Três destinações desde a emissão; nenhuma recebe tudo antecipadamente |
| Parcela 1 na abertura; 36 parcelas | `VestingSchedule.tsx`, parágrafos 1–3; `src/lib/vesting.ts` | Datas imutáveis; cumulativo `floor(50.000.000 × mês / 36) × 13/4/3` em tokens inteiros. Não usar liberação contínua do VestingWallet padrão |
| Estoque público não é vendido nem lucro | `SaleChannels.tsx`, Venda pública | Estoque de 65% fica no contrato de venda; quota liberada limita vendas; não existe saque administrativo desse estoque |
| Preço público vai integralmente à tesouraria | `SaleChannels.tsx`; `replit.md`, venda a corretoras | Transferências USDC distintas: preço à tesouraria, tarifa ao caixa operacional; compra e entrega atômicas |
| Tarifa US$2,50 no aplicativo | `ServiceFees.tsx`; `replit.md`, taxas confirmadas 03/10/2026 | 2.500.000 unidades do USDC de seis decimais; nenhuma cobrança em BETTEX, nenhuma queima na compra |
| Venda direta a corretoras | `SaleChannels.tsx`; `replit.md`, venda pública | Caminho separado autorizado pela administração, com preço explicitamente aceito pelo comprador; não acrescenta automaticamente a tarifa do aplicativo |
| Fundador pode destinar liberados; investidores sem quarta alocação | `VestingSchedule.tsx`; `replit.md`, Fundador e equipe | Dois cofres com beneficiários imutáveis; concessões individuais/captação não implementadas |
| Taxas separadas de yield | `replit.md`, taxas e recompras; `DocumentationGovernance.tsx` | Contrato não chama split 50/25/25 nem trata venda como lucro |
| Recompra seguida de queima definitiva | `replit.md`, Política aprovada de recompras | Queima voluntária do saldo próprio/permitido; não implantar motor de recompra |
| Autocustódia | decisão `0006-personal-test-wallets.md` | Contrato não recebe senhas/chaves nem mantém custódia das carteiras pessoais |
| Administração e multisig | `DocumentationGovernance.tsx`, Custódia e versões | Token sem administrador/mint/update; somente venda pausável, ownership em duas etapas. Administrador EOA apenas nos testes locais; público exige configuração de multisig e revisão |
| Arquitetura e eventos | `AGENTS.md`; decisões 0001–0004; `docs/architecture.md` | Biblioteca de contratos, não novo serviço/contexto/autenticação. ABI e eventos são fronteira para wallets/execution/reconciliation/audit; nenhum saldo emulado importado |
| Futuro staking | `replit.md`, saída cancela direitos; `documentacao-staking` | Apenas eventos ERC-20 Transfer/Burn para futura conciliação. Nenhuma promessa de que o contrato atual implementa staking/eligibilidade/rateio |
| Pool fechado e duas carteiras | anexo `Pasted-Sim-a-emiss-o-inicial-deve-separar-as-aloca-es-e-soment_1791178994163.txt`, §§5–6 | Allowlist on-chain de pagador/destinatário, revogável; `buyTo` recebe USDC do pagador e entrega BETTEX somente ao destino autorizado. Não é KYC |
| Estoque distinto da alocação | mesmo anexo, §4 | Getter `inventory` distingue alocação total, bloqueada, liberada, vendida e saldo disponível; não há AMM, reserva USDC ou venda de volta |

Os caminhos de componentes e lib nesta tabela são relativos a `artifacts/bettex-site/src/`.

## Lacunas e configurações estritamente temporárias

- “BTEX” identifica a IA principal em outras áreas; o token documentado é BETTEX. Nome **BETTEX Testnet**, símbolo **tBETTEX** e 18 decimais são convenções técnicas deste ensaio, não nova decisão de ticker econômico.
- Data de abertura e timestamps dos 36 meses não estão aprovados. O contrato recebe 36 timestamps imutáveis, estritamente crescentes com intervalos de 28–31 dias. Fixtures usam calendário UTC mensal com ajuste ao último dia; não se estabelece uma data comercial ou regra de fuso definitiva.
- Preço em USDC por token inteiro não está aprovado. Fixtures usam preço hipotético; nenhum preço histórico fiat é convertido em oferta. Não há oráculo, alteração administrativa de preço nem venda de frações nesta primeira implementação.
- Representantes, endereços, quórum de multisig e eventual timelock não estão aprovados. Venda começa pausada. Pausa não altera vesting nem congela transferências pessoais.
- Contratos não são atualizáveis. Evolução depende de nova implantação revisada e plano explícito, não proxy/backdoor que altere direitos.
- Regra atual de aportes **anjo** (100% produto/tecnologia/marketing, sem retirada do fundador, `replit.md`) prevalece sobre frases antigas de livre alocação. Não se implementa captação de investidores por esse contrato.
- “STT” permanece não identificado e não é criado ou equiparado a USDC. USDC de teste usado nos ensaios é identificado separadamente.
- Allora não é Aurora; Robinhood e Allora não são destinos de emissão deste contrato. Sem bridge, emissão duplicada multirrede ou integração inventada.
- Sem contrato de staking, ledger, funding, gas subsidy, risco automatizado, distribuição de lucro ou recompra completos nesta entrega.

## Fontes externas verificadas

- Corpus Arbitrum, `quickstart-create-a-token.mdx`, versão `git-blob:f06398aa9a8f580725ee50c541f3801a08919fe2`, conferida 2026-10-05: RPC `https://sepolia.arbitrum.io/rpc`, chain 421614, explorador `https://sepolia.arbiscan.io/`.
- https://docs.openzeppelin.com/contracts/5.x/erc20 — ERC-20, unidades e extensão de queima.
- https://docs.openzeppelin.com/contracts/5.x/access-control — ownership, contratos como administradores, transferência em duas etapas.
- https://docs.openzeppelin.com/contracts/5.x/api/token/ERC20 — SafeERC20; contratos USDC podem reverter por bloqueio/pausa.
- https://hardhat.org/docs/reference/configuration — rede EDR local; nenhuma configuração HTTP ou conta pública.
- https://developers.circle.com/stablecoins/usdc-contract-addresses — USDC de Arbitrum Sepolia `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`; não usar endereço mainnet.

Versões fixadas: Solidity/solc **0.8.37**, OpenZeppelin Contracts **5.6.1**, Hardhat **3.18.1**, ethers **6.16.0** e esbuild **0.28.2**. Compilação IR otimizada (200 runs), alvo EVM Shanghai, limites EIP-170/3860 verificados. A lista oficial de bugs do Solidity foi consultada (`https://docs.soliditylang.org/en/latest/bugs.html`); usar versão publicada atual, não nightly. A base retornou também documentos ERC antigos; eles **não** são utilizados como única referência técnica para ERC-20 atual.

## Desenho e critérios de verificação

`BettexTestToken` cria oferta única, `BettexPrimarySale` guarda 65%, dois `BettexAllocationVault` guardam 20/15%. Todos bloqueiam implantação fora de 31337/421614. MockUSDC somente local; em Sepolia a venda exige o endereço oficial, código existente, seis decimais e administrador contratual.

A data da primeira parcela não pode estar no passado na implantação. Uma venda direta exige intenção explícita revogável do comprador (quantidade/teto/operationId), aprovação USDC e execução autorizada pela administração. Ownership público não pode ser transferido para EOA; renúncia administrativa é bloqueada. Exigir código contratual **não prova** quórum/multisig válido: sua validação permanece obrigatória antes de implantação pública.

Testar: bloqueio mainnet; construtores inválidos; oferta e ausência de mint; três cofre/estoque; limites dos 36 meses e proporções; primeira parcela; catch-up sem duplicação; venda pausada; permissões; split de USDC exato; idempotência; rollback completo em falha; queima sem emissão; transferência pessoal sem tarifa; persistência e confirmação dos eventos EVM locais.

**Barreira de publicação:** não incluir comando de broadcast nem assinatura pública. Implantação pública permanece pendente de datas, preço de teste aprovado, endereços, multisig/timelock e revisão de segurança. Testes locais não equivalem a auditoria independente ou confirmação em explorador público.

## Resultado da verificação local

Em 2026-10-05: **19 testes aprovados**, com transações, receipts e eventos da EVM local. Comparação automática de **todas as 36 parcelas** com `src/lib/vesting.ts` compilado diretamente da aplicação. Inclui rollback da transferência do preço quando a transferência da tarifa falha, rejeição de compras duplicadas, intents revogáveis de corretoras, reentrada durante pagamento, isolamento dos IDs por comprador, autorização/revogação de acesso e pagamento/entrega em duas carteiras distintas. O teste adicional exercita leitor blockchain, runtime verificado, isolamento de contas e o helper real da compra do cliente; uma resposta perdida depois da execução é conciliada sem segunda assinatura/pagamento. A suíte não lê chaves de usuários nem chama RPC público. A EVM emulada com chainId Sepolia não é implantação pública.

Executar `pnpm --filter @workspace/bettex-contracts test` e `pnpm --filter @workspace/bettex-contracts build`. Ambos foram incorporados ao verificador existente `scripts/validate-development.mjs`. A execução local não cria saldo financeiro real ou confirma a operação da plataforma inteira.

## Integração e limites do fluxo completo

O segundo anexo também exige persistência/processamento de eventos e painel. A [decisão de observação](../decisions/0008-test-contract-observation.md) registra a integração em `reconciliation`, API tipada e painel na página existente de saldo/histórico. Configuração é vinculada à identidade Clerk já verificada; eventos EVM são persistidos idempotentemente por rede/endereço/tx/log/hash do bloco. O runtime é comparado com as fontes compiladas, ignorando apenas os slots imutáveis informados pelo compilador. Todas as leituras usam o mesmo bloco e seu hash é conferido novamente. Falha não retorna saldo demonstrativo nem snapshot velho como evidência nova.

O painel aceita endereço já implantado; sem endereço configurado não mostra números financeiros. Histórico exibido cobre até 2.000 blocos e 50 eventos recentes, explicitamente parcial; o banco não substitui verificação blockchain nem constitui ledger. Eventos anteriores/orfanados são conservados como observações, não retornados como confirmação atual. O principal encaminhado é calculado a partir de `sold` e preço imutável lidos no bloco verificado, equivalente às transferências do contrato; não representa saldo livre da tesouraria.

A compra pelo painel pede assinatura na carteira do próprio usuário: rede obrigatória 421614, pagador/destino previamente autorizados, USDC/ETH gratuitos, aprovação USDC limitada ao total e `buyTo` com nonce persistido. Resultado incerto bloqueia nova submissão e consulta `processed`/receipt antes de continuar. Não há chaves no servidor/IA, recompra ou ligação ao ledger emulado.

O novo fluxo usa o Clerk existente e não cria autenticação adicional. A conta nativa isolada anterior não foi migrada/excluída; uma unificação global permanece sem decisão do criador, e o cancelamento do formulário não é uma escolha. Ainda **não** há endereços públicos ou compra em explorador: antes da implantação faltam datas/preço/endereços/administração aprovados e abastecimento gratuito. Não apresentar esta entrega como fluxo público já operante.

A afirmação genérica do segundo anexo de que a cadência não estava definida foi confrontada com a fonte atual `VestingSchedule.tsx` e `lib/vesting.ts`, que definem explicitamente as 36 parcelas mensais e sua fórmula. O desenho usa essa decisão vigente, mantendo apenas timestamps/preço/contas como configurações de teste.
