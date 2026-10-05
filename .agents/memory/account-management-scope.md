---
name: Gestão de conta e demonstração financeira
description: Autenticação verdadeira convivendo com movimentações demonstrativas.
---

A gestão de conta precisa oferecer mudança e recuperação de senha reais; não tratar esses controles como formulários financeiros emulados. A demonstração anônima continua sem senha. Vincular o histórico demonstrativo ao primeiro cadastro não autoriza transferir esse histórico para outra pessoa que usar o mesmo navegador.

**Why:** O criador pediu gestão de conta com alteração e recuperação de senha enquanto o produto continua sendo um protótipo sem dinheiro real. Preservar o percurso anterior evita descartar as movimentações que a pessoa já explorou.

**How to apply:** Usar o provedor de autenticação como autoridade de identidade e segurança. Separar essa identidade dos saldos emulados e manter isolamento ao entrar, sair ou alternar usuários.

“Minha conta” deve ser um item com nome no menu e abrir um painel completo, não apenas um ícone ou janela lateral. Ao criar uma conta, o produto deve gerar e atribuir uma carteira compatível com ERC-20 na Arbitrum àquela identidade, com os saldos dos tokens separados. As opções da carteira, incluindo exportar as chaves, devem estar no painel da conta.

**Why:** O criador pediu explicitamente o painel completo, a carteira atribuída ao cadastro, a rede Arbitrum e a exportação de chaves, reforçando que opções da conta estavam sendo ignoradas.

**How to apply:** Preservar perfil, senha, recuperação e sessões ao expandir a conta. Consultar a documentação oficial da Arbitrum. Não apresentar endereço inventado ou saldo emulado como carteira on-chain. Definir a proteção e recuperação das chaves antes de implementar sua guarda; gerar a carteira não autoriza ativar operações financeiras reais.

Os detalhes da conta devem abrir na mesma área da página do app, não em overlay.

**Why:** O criador exigiu explicitamente “na mesma área, na página do app, não num overlay”.

**How to apply:** Manter perfil e segurança dentro de Minha conta, com o menu do app acessível. Preservar as funções reais do provedor e reconhecer os caminhos internos da conta ao navegar e recarregar.