# Históricos BETTEX

## Fonte e escopo

O domínio audit mantém um único diário persistente, compartilhado pelas seis consultas. Accounts, wallets, execution, ledger e reconciliation mantêm suas responsabilidades. Portas injetadas na composição registram transições da execução na mesma transação PostgreSQL; conta e emulação também gravam efeito e diário atomicamente. Confirmações externas exigem recibos e blocos canônicos; o observador retoma a ingestão idempotente após falha.

Valores do diário são strings de unidades inteiras: USDC 6 casas, BETTEX 18 e ETH 18. Isso não converte o motor demonstrativo legado, que usa números JavaScript, em um ledger de produção. Seus fatos permanecem identificados como simulação, sem dinheiro real. Preços executados novos são capturados na solicitação e preservados, não recalculados na confirmação.

Compras locais têm um único fato financeiro do usuário. Aprovação, envio, principal da tesouraria e participação são etapas correlacionadas. Participação é baseada no saldo da carteira e quantidade × segundos, com cancelamento do peso anterior na saída conforme a regra vigente. Não existe transferência fictícia para staking.

As distribuições nativas ainda não existem; não são inventadas. O encerramento diário do motor demo registra cálculo e pagamentos emulados existentes. A prévia manual apenas apura uma estimativa na simulação: não credita saldo, não disponibiliza direitos e não confirma pagamento.

## Migração e operação

Aplicar o schema-base existente e executar `pnpm --filter @workspace/db migrate:history` no banco explicitamente selecionado. A migração é idempotente, não apaga dados e não concede permissões. Em desenvolvimento existe inicialização compatível com o padrão dos percursos nativos; produção não executa DDL automaticamente.

O diário tem unicidade determinística, índice por proprietário/data/ID, índice de correlação e proteção PostgreSQL contra UPDATE/DELETE. Correções são eventos vinculados. Paginação por cursor usa data e ID, snapshot de sequência e escopo/filtros vinculados: eventos inseridos entre páginas não mudam o conjunto em andamento.

O observador local captura os eventos das carteiras explicitamente associadas a 31337 a cada 15 segundos, mesmo com o navegador fechado. Test accounts e o observador não são habilitados em produção. A consulta apresenta os registros persistidos e um aviso explícito se a reconciliação não puder verificar o estado atual.

## Acesso e privacidade

A sessão determina o proprietário no servidor. A conta pessoal agora entra no próprio demo: perfil, segurança, carteiras, operações locais e histórico ficam em Minha conta. Sua sessão também determina a identidade do painel e dos saldos emulados. Contas Clerk/browser existentes são preservadas; não há fusão por e-mail nem apropriação de dados de outra conta. IDs de usuário enviados pelo navegador não escolhem o proprietário. Dados técnicos não aparecem no histórico comum.

O detalhamento administrativo exige a permissão persistida `treasury_history` em `test_account_permissions`, vinculada à conta existente. Nenhuma conta ganha esse acesso no cadastro, pelo navegador ou por variável de ambiente. A concessão depende de administração autorizada da base; não há tela de autoelevação. Dados públicos de contrato/tesouraria existentes continuam agregados e não recebem atividades privadas.

A migração captura concessões, revogações e alterações dessa permissão na mesma transação da administração da base. O alvo recebe o evento privado e a administração recebe sua projeção restrita, sem copiar nome, e-mail ou credenciais. O ator identifica a administração autorizada da base, não afirma conhecer a pessoa que executou o SQL.

Não se registram senha, segredo de carteira, frase-semente, cookie, sessão, ciphertext ou conteúdo de backup. Perfil registra somente o campo alterado, sem replicar nomes/e-mails. Falhas usam códigos limitados, não stack traces ou parâmetros SQL. Exportação registra autorização e execução reportada pelo cliente, nunca confirmação de que um arquivo foi salvo.

Não há exclusão automática dos fatos financeiros/auditoria. Enquanto as regras vigentes não definirem prazo adicional, não inventar um período de retenção nem apagar a trilha. Dados pessoais seguem nas fontes de identidade existentes; alterações de retenção/anonymização exigem política aprovada.

## Recuperação e lacunas

Eventos comprovados da EVM local são recuperados com hash, bloco, índice, origem e selo reconstruído quando anteriores ao início de captura. Histórico JSON demonstrativo recuperado/semeado é explicitamente não autoritativo. Atividades antigas não comprovadas não são fabricadas: login, consentimento, autorização e instante original de solicitação podem estar ausentes.

O diário informa seu início de captura. Isso não afirma completude para operações ainda inexistentes, redes não conectadas, ações Clerk fora da aplicação ou material descartado antes da migração. Para uma sessão pessoal, a consulta reúne apenas os registros nativos e emulados dessa mesma conta, com os ambientes identificados; identidades Clerk distintas não são fundidas. Saldos emulados não representam saldo na blockchain local nem em rede pública.

## Administração do demo

A concessão administrativa é feita fora do navegador e permanece no diário. O provisionamento de desenvolvimento usa o cadastro normal e gera o mesmo cofre criptografado de carteiras; recebe credenciais somente pela entrada padrão, sem gravá-las no código ou nos logs. O crédito inicial emulado e a participação são registrados na mesma transação dos saldos. Reexecutar o provisionamento não duplica o crédito nem substitui as carteiras.
