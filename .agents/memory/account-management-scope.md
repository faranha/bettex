---
name: Gestão de conta e demonstração financeira
description: Autenticação verdadeira convivendo com movimentações demonstrativas.
---

All accounts must receive a generated nickname, shown after login and editable through Edit profile. The field must state that nicknames are private now but will be publicly visible in the future.

**Why:** The creator explicitly required generated nicknames for all accounts, replacement with the user's own nickname, and notice of the future public visibility.

**How to apply:** Keep nicknames separate from legal/display names and email addresses; do not regenerate a saved nickname on login or expose profiles publicly before that future feature is introduced.

“EDIT PROFILE must be the single source of truth and place for editing the profile.”

**Why:** The creator identified a conflict between the inline nickname/picture editor and the separate profile dialog.

**How to apply:** Keep the profile overview read-only. All name, email, nickname and picture editing must be entered through Edit profile; do not reintroduce parallel editing locations.

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

Exportar deve mostrar o endereço, a chave pública e a chave privada da carteira já usada pela conta, sem criar outra carteira, exigir senha de carteira separada ou acrescentar um painel de “chaves e backups”.

**Why:** O criador corrigiu explicitamente: “private and public key thats all”, “if I click on export I should see it all” e rejeitou a senha e o painel adicionais.

**How to apply:** Vincular a exportação às mesmas carteiras que detêm os saldos on-chain. Manter proteção pela identidade autorizada, segredo oculto antes da ação e ocultação automática, sem passos extras não pedidos. Preservar quaisquer cofres existentes; dados já criptografados não podem ser descartados nem substituídos para contornar a senha.

A rede escolhida para saldos e movimentações da conta é Arbitrum Sepolia, não a EVM local nem Arbitrum One.

**Why:** O criador selecionou expressamente Arbitrum Sepolia ao esclarecer a origem das carteiras e dos saldos.

**How to apply:** Não confundir um registro público de atividade ou execução local com operações financeiras nessa rede. Preservar carteiras existentes; a escolha da rede não autoriza substituí-las nem operar na mainnet.

O perfil em Minha conta deve oferecer apelido e foto, com o mascote BETTEX como imagem inicial e opção de restaurá-lo. O apelido é de apresentação e não substitui a identidade da conta ou da carteira.

**Why:** O criador pediu um lugar para nickname e picture, e um mascote BETTEX como imagem inicial, mantendo os requisitos anteriores de identidade real.

**How to apply:** Disponibilizar esses controles no Perfil, preservar nome e e-mail existentes e não alterar carteiras ou chaves ao personalizar a aparência. Manter os perfis de demonstração e contas autenticadas isolados.

As chaves pública e privada de todas as carteiras devem começar mascaradas, com revelação por botão de olho e cópia disponível após a revelação.

**Why:** O criador pediu “put it hashed unless the eye button is clicked to see, and then copy” para ambas as chaves, em todas as carteiras.

**How to apply:** “Hashed” nessa interface significa ocultar visualmente, não substituir as chaves por hashes criptográficos. Não revelar uma chave só por abrir o painel; não remover a senha de carteiras criptografadas existentes.

A exportação nos cartões das carteiras deve ser um ícone discreto de chave no topo, não um botão largo em destaque.

**Why:** O criador pediu “export wallet pode ser um icone de chave em cima, nao precisa ter esse destaque todo”.

**How to apply:** Preservar a função e as proteções de exportação, com nome acessível e identificação ao passar o mouse; reduzir apenas o destaque visual.