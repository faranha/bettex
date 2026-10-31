# BETTEX — contratos exclusivamente de teste

Requisitos e fontes: [especificação](../../docs/contracts/bettex-testnet-spec.md).
Posição na arquitetura: [decisão](../../docs/decisions/0007-testnet-contract-library.md).

```sh
pnpm --filter @workspace/bettex-contracts build
pnpm --filter @workspace/bettex-contracts test
```

A compilação gera `build/artifacts.json` com ABI, bytecode, versão do compilador e política de redes. Build é regenerável e ignorado pelo Git. Os testes instanciam uma EVM local efêmera, assinam transações com contas internas do simulador, verificam receipts/eventos e comparam os 36 meses com a agenda real do aplicativo. Não acessam carteiras pessoais, segredos, banco ou RPC público.

## Componentes

- `BettexTestToken`: ERC-20 de teste, oferta única, três alocações bloqueadas; sem mint posterior ou upgrade.
- `BettexPrimarySale`: estoque público, tarifa em USDC separada do preço, pausada inicialmente; allowlist pagador/destinatário e idempotência explícitas. `buyTo` separa carteira USDC pagadora e carteira BETTEX destinatária. `inventory` expõe estoque bloqueado/liberado/vendido/disponível.
- `BettexAllocationVault`: destinatário e calendário imutáveis, liberação acumulada por parcela.
- `TestnetSchedule`: redes 31337/421614; 36 timestamps imutáveis com intervalos de 28–31 dias.
- `test/fixtures`: USDC local e fixture adversarial, ambos proibidos em redes públicas.

## Limites

### Registro público da demonstração

`BettexPublicDemo` é um registro de atividade da ALFA na Arbitrum Sepolia, separado do token econômico, da venda, dos cofres e da liquidação financeira. Não guarda fundos nem emite tokens. Os checkpoints registram apenas um hash de observações operacionais e contagens agregadas anônimas; nomes, e-mails, credenciais, capacidades de sessão e saldos individuais nunca são enviados para a rede.

`public:prepare` cria automaticamente uma carteira de implantação, com chave criptografada usando o segredo de sessão existente e armazenada em `.local/` (ignorada pelo Git). `public:runtime` implanta o registro usando somente ETH de teste e mantém checkpoints. As chaves nunca são impressas. O processo recusa redes principais. O saldo de teste deve ser reposto se acabar; não existe autorização para gastar ETH real.

O selo LIVE exige RPC público na chain 421614, bytecode correspondente, identidade da aplicação, operador correto e checkpoint recente confirmado. Uma falha de conexão ou um checkpoint vencido remove LIVE. Esse selo não afirma que saldos, compras, saques, trades ou distribuição do token econômico estejam sendo liquidados na blockchain.

Para o token econômico e a venda, não há comando de implantação pública. Preço, endereços, quórum, timelock e calendário aprovados ainda faltam. O preço **0,05 USDC**, símbolo **tBETTEX**, administrador EOA e calendário UTC das fixtures são parâmetros de ensaio, não decisões comerciais. Em Sepolia exige-se USDC oficial e administrador contratual; isso não comprova que o administrador é um multisig válido.

O sistema completo de staking, ledger, funding, conciliação, elegibilidade e recompra não é implementado por esta biblioteca. Testes locais não substituem auditoria independente. Não enviar fundos ou tokens para contratos de teste, cofres ou estoque sem fluxo autorizado; não existe resgate administrativo genérico.
