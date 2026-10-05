# Contas de teste e carteiras pessoais sob controle do titular

**Status:** implementação de desenvolvimento, sem substituição do Clerk.

O cadastro solicitado dispensa verificação de e-mail, KYC e recuperação. As contas Clerk existentes são preservadas: a migração do login não foi autorizada. O novo fluxo fica em `/testes/conta`, com identidade e sessão próprias, indisponível quando `NODE_ENV` não for `development`. Não há importação dos saldos demonstrativos.

As duas carteiras EVM são geradas no navegador com ethers 6.16, aleatoriedade criptográfica e chaves distintas. O servidor recebe metadados públicos e um cofre AES-256-GCM/PBKDF2-SHA256 (600.000 iterações), nunca as chaves. A senha de autenticação usa scrypt separado. Não há chave administrativa de descriptografia, recuperação ou assinatura pelo servidor.

`accounts` possui identidade, autenticação, consentimentos e sessões; `wallets` possui cofres, carteiras e associações de rede. A composição HTTP injeta seus adaptadores em casos de uso e coordena uma transação PostgreSQL para cadastro e mudança de senha. Esse ponto de composição, fora dos módulos, pode importar os adaptadores dos dois contextos; não concede acesso cruzado às tabelas dentro deles.

Cadastro e alteração de senha são atômicos. IDs internos permanecem imutáveis. Repetir o identificador de cadastro exige a senha correta e preserva as carteiras originalmente atribuídas. Alterar senha recriptografa no cliente, com controle de revisão e revogação das outras sessões.

Revelar, copiar ou baixar material privado exige senha atual, aviso contra golpes e confirmação desmarcada. Revelação temporária é fechada ao sair da página, ocultar a aba ou vencer o prazo. Backup individual usa JSON Keystore V3, interoperável com ethers e ferramentas compatíveis; ele não restaura a conta do aplicativo.

A associação inicial é Arbitrum Sepolia, chain ID 421614. Não são provisionados agentes ou workers por usuário. O modelo suporta outras associações, mas elas não são habilitadas implicitamente. Nenhum saldo, depósito, contrato ou pagamento é declarado confirmado apenas por existir endereço. Staking e operações financeiras permanecem pendentes de contratos e conciliação; criação de carteira não executa transações.

Fontes verificadas em 2026-10-05:
- Corpus Arbitrum: `pnpm docs:query --platform arbitrum --query "Arbitrum Sepolia chain ID 421614"`.
- https://docs.ethers.org/v6/api/wallet/ — geração aleatória e JSON Keystore.
- https://developers.circle.com/stablecoins/usdc-contract-addresses — USDC de teste Arbitrum Sepolia: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`.

**Limites:** este trabalho entrega cadastro e proteção das carteiras, não conclui o ambiente financeiro multirrede. Não há mainnet, abastecimento, implantação de contratos, distribuição de ativos ou staking on-chain habilitados.
