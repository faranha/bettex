# Runbook de segurança — BETTEX

Aplicável à stack existente. Não autoriza produção nem custódia.

## Backup e restauração

- Backup de produção: administrador do banco deve configurar retenção, criptografia, acesso restrito e cópia externa à aplicação. Nenhum bucket/backup de produção foi provisionado nesta revisão.
- Usar `pg_dump`/`pg_restore` com credenciais pelo ambiente protegido, nunca argumentos, Git ou logs. Arquivos fora do diretório público/repositório, permissões 0600, armazenamento criptografado; sem disponibilização por HTTP.
- Cobrir contas, vínculos, cofres cifrados, permissões, histórico, operações/etapas/nonces, metadados e schema. Cofre cifrado não recupera senha perdida.
- Restaurar primeiro em banco/ambiente separado. Conferir quantidades, integridade referencial, unicidade/idempotência, cofres, auditoria append-only e operações incertas antes de liberar escritas.
- Revogar sessões restauradas antes de reabrir autenticação. Tokens antigos podem ter sido comprometidos; preservar a auditoria de revogação.
- `pnpm --filter @workspace/api-server check:security` cria schema vazio e sequências próprias, gera fixtures e verifica HTTP, `pg_dump` e `pg_restore`. Não copia linhas de clientes. Destrói somente seu schema e arquivo temporário.
- Esse teste prova a restauração de fixtures PostgreSQL, não um plano de desastre de produção nem restauração da blockchain. Reiniciar a EVM local cria novo epoch; nunca tratar o saldo anterior como confirmado.

## Revogação de sessões e credenciais

- Logout nativo revoga seu hash de sessão; troca de senha revoga todas as sessões da conta e preserva carteiras pela recriptografia no cliente. Se Clerk também estiver conectado, logout no app encerra ambos.
- Incidente nativo: administrador autorizado revoga `test_account_sessions` apenas do titular afetado e registra o incidente. Não zerar carteira, mudar proprietário ou redefinir password_hash para “recuperar” o cofre.
- Incidente Clerk: revogar sessões no provedor/tenant correto; usar Auth/Clerk da Replit para tenant gerenciado, sem migrar identidades.
- Credencial exposta: identificar dono/provedor e usos, revogar/rotacionar no provedor, atualizar o segredo no ambiente correto e verificar invalidação da anterior. Remover a exposição do workspace, bundles e logs; apagar Git não revoga uma chave.
- Não reescrever histórico Git nem invalidar chaves de usuários sem coordenação. Comprometimento de chave pessoal exige ação do titular, pois o servidor não a possui.
- Registrar IDs do incidente e etapas, nunca valores de credenciais. Novo segredo não vai para chat, arguments ou arquivos de configuração versionados.

## Pausa

- `BETTEX_EXECUTION_PAUSED=true`, aplicado pelo fluxo de variáveis protegidas e restart apenas do servidor API, bloqueia novas mutações financeiras demonstrativas/locais e os dois pontos de broadcast.
- Manter leitura/conciliação, login e logout. Operações enviadas podem confirmar durante pausa; não reenviar nem assumir cancelamento. Retomar pelo mesmo operationId após verificar estado/nonce/epoch.
- Contrato de venda: `pause()` somente pelo owner atual; `unpause()` somente após diagnóstico. A pausa da API não pausa a blockchain, e pausa do contrato não revoga allowances de carteiras.
- Não reiniciar o nó local como mecanismo de pausa. Agentes não aprovam sua própria retomada.

## Acessos externos a verificar pelo administrador

- Repositório privado quando apropriado, mínimo de colaboradores, aprovação/proteção de branches, varredura de secrets e relato privado de vulnerabilidades.
- CI apenas leitura, sem publicação automática ou segredos de produção em PRs. Lockfile fixado, firewall e mínimo de idade de pacotes preservados.
- Papel da aplicação no banco sem administração/IAM e separado da identidade de migração/backup. Restringir rede e acesso às cópias.
- Separar ambientes, tenant Clerk, banco, redes e credenciais. `NODE_ENV` é barreira de configuração, não substituto de IAM.
- Esta revisão não alterou permissões do GitHub, infraestrutura, backups ou ambientes publicados: exigem acesso administrativo externo. Não há conexão GitHub anexada nesta sessão.
