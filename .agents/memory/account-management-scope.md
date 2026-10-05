---
name: Gestão de conta e demonstração financeira
description: Autenticação verdadeira convivendo com movimentações demonstrativas.
---

Todas as funcionalidades desenvolvidas devem estar no app demo existente. Controles de conta carregam na própria página Minha conta, não em páginas ou diretórios de produto separados para testes. A conta administrativa de demonstração deve ter acesso a todos os recursos desenvolvidos e suas carteiras devem ser geradas automaticamente.

**Why:** O criador corrigiu expressamente a entrega de uma página isolada de conta de testes e reiterou que o próprio app demo é o ambiente de teste.

**How to apply:** Integrar recursos novos à navegação e à identidade do demo. Preservar contas existentes sem vincular identidades apenas por e-mail; não entregar funcionalidades somente em relatórios, páginas externas ou ambientes paralelos.

A gestão de conta precisa oferecer controles reais, não formulários financeiros emulados. No novo cadastro solicitado, não há confirmação de e-mail, KYC ou recuperação de senha, inclusive pelo suporte; exige aviso e aceite desmarcado. A demonstração anônima continua sem senha. Vincular histórico demonstrativo não autoriza transferi-lo para outra pessoa no mesmo navegador.

**Why:** O criador substituiu o requisito de recuperação no novo cadastro pelos avisos explícitos de perda de acesso. Contas existentes não devem ser migradas ou descartadas silenciosamente.

**How to apply:** Não reintroduzir recuperação no novo fluxo. Preservar o acesso existente até autorização para migrá-lo. Separar identidade dos saldos emulados e manter isolamento entre usuários.

“Minha conta” deve ser um item com nome no menu e abrir um painel completo, não apenas um ícone ou janela lateral. O novo cadastro deve criar duas carteiras distintas, pessoais: Depósitos e BETTEX/recebimentos do staking. Não são tesouraria nem contas compartilhadas. As opções de exportação devem estar no painel.

**Why:** O criador pediu explicitamente o painel completo, a carteira atribuída ao cadastro, a rede Arbitrum e a exportação de chaves, reforçando que opções da conta estavam sendo ignoradas.

**How to apply:** Preservar perfil, senha e sessões, sem recuperação no novo cadastro. Consultar documentação oficial. Não apresentar endereço inventado ou saldo emulado como on-chain; gerar a carteira não autoriza operações financeiras reais.

Os detalhes da conta devem abrir na mesma área da página do app, não em overlay.

**Why:** O criador exigiu explicitamente “na mesma área, na página do app, não num overlay”.

**How to apply:** Manter perfil e segurança dentro de Minha conta, com o menu do app acessível. Preservar as funções reais do provedor e reconhecer os caminhos internos da conta ao navegar e recarregar.

O fluxo deve ser fácil e simples porque “as pessoas são leigas nesse assunto”. Segredos gerados automaticamente ficam ocultos. Ver, copiar, exportar ou baixar dados privados exige confirmação e explicação da responsabilidade do titular pelo uso, preservação e guarda, com avisos contra golpes.

**Why:** O criador reforçou explicitamente simplicidade, controle das carteiras pelo usuário e proteção na exportação.

**How to apply:** Usar linguagem direta, distinguir endereço público de segredo e explicar que backup de carteira não recupera automaticamente a conta do aplicativo. Não pedir segredos por suporte nem acrescentar passos técnicos desnecessários ao cadastro.