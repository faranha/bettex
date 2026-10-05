# Segurança

## Escopo atual

BETTEX tem identidade real, contas nativas integradas ao app, carteiras EVM pessoais criptografadas no cliente e dados persistidos de uma experiência financeira emulada. Há assinatura pessoal e execução exclusivamente na EVM local 31337; não há signer de produção, ledger patrimonial completo ou distribuição financeira real. A associação inicial Arbitrum Sepolia não prova implantação nem compra pública. Contas nativas continuam bloqueadas fora de desenvolvimento.

Referência desta revisão interna: **OWASP ASVS 5.0.0**, versão estável confirmada na fonte oficial. OpenZeppelin **5.6.1**, Solidity **0.8.37**, ethers **6.17.0**. Não é certificação ASVS nem auditoria independente de contratos. Resultados e limites: [revisão interna](docs/security-review-2026-10-05.md).

## Regras obrigatórias desta versão

- Preservar ausência de recuperação de senha e KYC das contas nativas. Troca de senha requer senha anterior, revisionamento, recriptografia do mesmo cofre e revogação das sessões anteriores. Não trocar hash administrativamente: isso não recupera chaves.
- Toda identidade/propriedade/permissão vem do servidor. Administração atual concede leitura de tesouraria, não exportação de chaves alheias nem assinatura financeira irrestrita.
- Origens exatas, sem confiar em Host encaminhado; escritas do app exigem origem aprovada e JSON. Clerk conserva seu protocolo, com a mesma fronteira de origem.
- Identificadores financeiros, decimais e destinatários são validados contra o mandato/operação persistida; IA e navegador não autorizam fundos.
- Segredos fora do Git/frontend/logs; erros públicos não carregam SQL, stacks ou corpos. Exportação privada é ação explícita local, com reautenticação; preferir backup criptografado.
- Testes de segurança usam esquema PostgreSQL vazio isolado, sequências próprias, chaves/contas geradas para fixtures e EVM descartável. Nunca reiniciar o runtime EVM do app para executar testes.
- Migrações versionadas e aditivas; registros órfãos bloqueiam a migração, não são apagados. Histórico é append-only; correções contábeis exigem compensações.
- Não habilitar dinheiro real enquanto faltarem os gates financeiros e a revisão independente abaixo.

## Comunicação de vulnerabilidades

Usar o relato privado de vulnerabilidades do GitHub se habilitado. Se não estiver, solicitar um canal privado aos mantenedores antes de transmitir detalhes. Não publicar exploração, dados de terceiros ou credenciais em issues, logs ou no Telegram público.

A habilitação desse canal, proteção de branches e política de aprovação dependem da administração do repositório; não foram ativadas por esta mudança.

## Requisitos para desenvolvimento

- Verificação de identidade/propriedade no backend, não apenas na interface.
- Revisão de CORS, CSRF, sessão, autorização, limites de requisição e fronteira de proxy antes de produção.
- Limitação de custo e isolamento para processamento de contas/agentes; o limite em memória do processo não é controle distribuído.
- Redação de logs; segredos fora do código, frontend e histórico Git.
- `pnpm quality` bloqueia lint de segurança, tipos, build, fronteiras, segredos no workspace/bundles/histórico Git, dependências altas/críticas não aceitas e regressões de contas, carteiras, execução e contratos. A CI usa o mesmo comando, sem credenciais de Git persistidas.
- A exceção de `braces` é específica, documentada e expira em 2026-11-05; novas vulnerabilidades não são ignoradas. SAST e análise de privacidade foram executados nesta revisão, mas não são agendados automaticamente por essa CI.
- Preservar dados após falhas, restarts e retries; restaurar backups em teste.

## Gates adicionais para operações cripto reais

1. Escolha aprovada de custódia, exportação/recuperação e responsabilidade por chaves.
2. Assinatura isolada dos agentes, com lista de redes/contratos/destinos permitidos, limites e revogação.
3. Mandatos e política de risco versionados, aprovados pela liderança da Fundação.
4. Ledger de partidas dobradas, unidades inteiras, reserva atômica e trilha imutável.
5. Provedores e contratos confirmados; validação de rede, token, cotação, TTL, nonce, gas e slippage.
6. Testes de falha, concorrência, duplicidade, execução incerta e reorganização de blockchain.
7. Conciliação independente e interrupção segura quando a fonte externa diverge do ledger.
8. Revisão independente dos contratos e da infraestrutura antes de autorização explícita para mainnet.

## Operação e recuperação

Procedimentos, limites e restauração de teste: [runbook](docs/security-operations.md).

Consultar [modelo de ameaças](threat_model.md) e [arquitetura canônica](docs/architecture.md).