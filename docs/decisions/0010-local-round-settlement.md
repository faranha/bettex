# Rodada e liquidação local de teste

## Fontes e resolução

Prompts de tesouraria, percurso completo e históricos em attached_assets, revisão integral vigente; replit.md (rodadas únicas, saídas, frações, split), docs/architecture.md e decisões 0007/0009.

Participação segue saldo BETTEX × tempo confirmado, sem novo contrato de custódia. Apuração/pagamentos pertencem a ledger; execução usa o executor e journal existentes; assinatura operacional permanece no adaptador local wallets. Nenhuma chave pessoal passa ao servidor.

## Hipóteses reversíveis exclusivas do teste

- Uma injeção de resultado **sintético de 1 USDC de teste** por rodada UTC e epoch. A transferência reserva→tesouraria é evidência de funding, não prova de lucro externo.
- Sem custos/tributos/posições externos simulados escondidos: zero, identificados como hipótese. Não se confunde venda primária com resultado.
- Exigência defensiva zero exclusivamente nesta fixture sem estratégias abertas; risco bloqueia split sem liquidez após outras obrigações. Nunca usar esse mandato para políticas de produção.
- Split aprovado 50% retenção, 25% participantes, 25% recompra; micro-unidades inteiras, restos retidos. Peso zero não divide.
- Destino de recompra: sétima conta operacional da EVM local, divulgada como destino de teste, sem compra automática de tokens. Não é receita da companhia.
- Snapshot de pesos somente após funding confirmado; obrigação pendente não vira saldo. Validação de saída antes de cada envio. Rodada encerrada não autoriza novo envio; só concilia os iniciados.

Fundamento: usuário autorizou configurações reversíveis de teste para parâmetros indefinidos, mas não novas regras econômicas. Não permite dinheiro real, trading real ou afirmar deploy em Arbitrum Sepolia.

## Segurança

Somente development + runtime atestado 31337, associação explícita, sessão/CSRF/origem válidos. Usuário pode disparar o mandato de teste limitado, não escolher valor, destino, rede, owner ou saldo. Journal/nonce persistidos antes do broadcast; resultado incerto bloqueia reenvio. Só o titular vê seus pagamentos. Reservas, principal e resultado têm registros distintos.

## Contabilidade e conciliação

Transferências USDC/BETTEX têm partidas dobradas por ativo em `ledger`, com micro-unidades/18 decimais, origem/destino, epoch, hash/bloco/log e tempo do evento. Mints de teste são origem emissora, não resultado comercial. Saldo da carteira e da tesouraria é reconstruído pelo journal e comparado ao snapshot on-chain; divergência bloqueia resposta financeira, sem saldo artificial. Reorganizações verificadas produzem lançamentos reversores ligados ao original, não edição do passado. ETH de gás continua discriminado nos receipts, sem conversão inventada em custo USDC. Isso é contabilidade do ambiente local, não contabilidade de ordens externas de produção.

Referências: Ethereum JSON-RPC `eth_sendTransaction` e recibos, fonte oficial `github.com/ethereum/execution-apis`, revisão consultada pela base local em 2026-10-05; ethers instalado 6.17.0. Fonte técnica é documentação, não prova de uma operação BETTEX.
