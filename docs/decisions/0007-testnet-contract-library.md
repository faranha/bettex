# Contratos de teste como biblioteca da arquitetura existente

**Status:** ensaio local, implantação pública bloqueada.

Não havia Solidity, configuração de compilador ou contratos instalados. Criar `lib/bettex-contracts` é necessário para manter fontes, compilação reproduzível, ABI e testes da capacidade on-chain, sem inventar outro domínio, serviço, banco ou autenticação.

Fontes seguem a [especificação pesquisada](../contracts/bettex-testnet-spec.md). Wallets mantém geração/assinatura pessoal; execution adapta as chamadas; reconciliation verifica rede/contrato/evento/confirmacões; audit consome eventos. A biblioteca não importa tabelas internas nem substitui ledger por saldo ERC-20.

Token/cofres não possuem upgrade, mint pós-construtor ou resgate discricionário. A venda começa pausada e tem administração explícita em duas etapas. Datas, destinos e preço ficam imutáveis nesta versão de teste para evitar alteração silenciosa da economia. Calendário, preço, quórum e timelock definitivos ainda exigem decisão.

Rejeitados token genérico com todo supply na carteira do criador, mint ilimitado, vesting linear em segundos, compra sem divisão preço/tarifa, assinatura por IA e implantação automática. Testar em EVM local não autoriza transações públicas.
