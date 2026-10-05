# Segurança

## Escopo atual

BETTEX tem identidade real e dados persistidos de uma experiência financeira emulada. Não há carteira Arbitrum, serviço de assinatura ou integração financeira real implementados. A revisão arquitetural não foi uma auditoria de segurança, dependências ou contratos.

## Comunicação de vulnerabilidades

Usar o relato privado de vulnerabilidades do GitHub se habilitado. Se não estiver, solicitar um canal privado aos mantenedores antes de transmitir detalhes. Não publicar exploração, dados de terceiros ou credenciais em issues, logs ou no Telegram público.

A habilitação desse canal, proteção de branches e política de aprovação dependem da administração do repositório; não foram ativadas por esta mudança.

## Requisitos para desenvolvimento

- Verificação de identidade/propriedade no backend, não apenas na interface.
- Revisão de CORS, CSRF, sessão, autorização, limites de requisição e fronteira de proxy antes de produção.
- Limitação de custo e isolamento para processamento de contas/agentes; o limite em memória do processo não é controle distribuído.
- Redação de logs; segredos fora do código, frontend e histórico Git.
- Revisão de dependências e varredura de segredos antes de tornar o repositório público. A CI atual não executa scanners de segurança.
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

Consultar [modelo de ameaças](threat_model.md) e [arquitetura](docs/architecture/README.md).