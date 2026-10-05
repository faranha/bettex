# Conta pessoal e carteiras de testes

## Acesso simples

No preview de desenvolvimento, abra **Minha conta → Conta e carteiras de testes**, ou `/testes/conta`.

1. Informe nome, e-mail, senha de pelo menos 12 caracteres e a confirmação.
2. Leia o aviso de que não existe recuperação e marque o aceite.
3. Clique em **Criar conta e carteiras de teste**.
4. Em **Minhas carteiras**, copie o endereço público da carteira desejada. Não confunda endereço com chave pública ou chave privada.
5. Para guardar um backup, escolha **Baixar backup criptografado (recomendado)**. Leia os avisos, informe a senha atual e marque a responsabilidade.

Os segredos não aparecem no cadastro. Revelar, copiar chave privada, baixar arquivo sem criptografia e baixar backup são ações separadas, cada uma com senha e confirmação nova. A chave revelada é ocultada ao sair da aba/página ou após 60 segundos. Sair da conta também a oculta. Ocultar a aba cancela operações privadas ainda em andamento.

Nunca compartilhe chaves, senhas ou backups com supostos atendentes. Não aceite acesso remoto nem compartilhe a tela ao mostrar segredos. Um arquivo sem criptografia ou conteúdo copiado pode ser lido por outras pessoas/aplicativos. Guarde a senha e uma cópia criptografada em local seguro: perdê-las pode impedir acesso. O suporte não pode redefinir a senha desse novo cadastro.

## Separação e verdade dos estados

Este fluxo possui contas de desenvolvimento próprias, sem migração automática de contas Clerk nem histórico financeiro demonstrativo. Não pede confirmação de e-mail, documentos ou selfie. O e-mail não é apresentado como verificado.

As duas carteiras são EVM reais, pessoais e distintas. Criar endereço não é uma transação e não exige gas. A associação inicial é **Arbitrum Sepolia, chain ID 421614**, não Ethereum Mainnet. Chaves e endereços permanecem iguais após mudança de perfil ou senha.

| Parte | Estado e limite |
| --- | --- |
| Cadastro e login | Implementados, PostgreSQL, sessão opaca de uma hora, sem recuperação |
| Duas carteiras | Geradas no navegador; metadados separados por finalidade e associações de rede |
| Proteção | Cofre AES-GCM/PBKDF2; hash scrypt separado; servidor não recebe as chaves em texto puro |
| Perfil, e-mail e senha | Implementados; e-mail/senha exigem senha atual; recriptografia e atualização atômicas |
| Exportação | Chave pública, chave privada e JSON Keystore V3 individual; segredo oculto por padrão |
| USDC de teste | Contrato oficial identificado, não representa depósito detectado nem saldo confirmado |
| Consulta de saldo e depósitos | Pendentes de adaptador RPC e conciliação; não são simulados como reais |
| BETTEX e staking | Destino pessoal identificado pela finalidade da carteira; contratos/recebimentos on-chain pendentes |
| Robinhood Chain e Allora | Não provisionadas por este fluxo; contas de agentes não são carteiras pessoais |
| Produção/mainnet | Novo cadastro bloqueado fora de desenvolvimento; nenhum envio financeiro habilitado |

USDC de teste: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`, conforme Circle. Não envie ativos reais. Um backup pode abrir a carteira em ferramenta externa compatível; não recupera a conta BETTEX nem garante acesso a posições específicas de contratos. Se a senha mudar, backups anteriormente exportados continuam protegidos pela senha usada na exportação; exporte novos backups se necessário e proteja/remova com segurança as cópias antigas.

Não há transações de abastecimento, venda ou staking para apresentar: nenhuma foi executada. Isso não é a entrega concluída do ambiente financeiro multirrede.

## Verificação

- `pnpm --filter @workspace/api-server check:accounts`
- `pnpm --filter @workspace/bettex-site check:wallets`
- `pnpm quality`

Os testes criptográficos comparam chaves somente em memória, sem incluí-las em logs. A validação de navegador usa apenas contas sintéticas e não registra imagens de segredos revelados. SQL/tokens/senhas/corpos de requisição não são incluídos nas mensagens de erro do novo fluxo.

Decisão e fontes: [carteiras pessoais](decisions/0006-personal-test-wallets.md).
