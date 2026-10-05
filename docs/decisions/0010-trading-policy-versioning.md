# Definições publicadas e composição de políticas

As definições estruturadas pertencem ao domínio de risco; a configuração editável fica no Git. O banco conserva cópias publicadas imutáveis, aprovações, ativações por ambiente e histórico append-only. Aplicações consomem exclusivamente composições publicadas para autorizar novas entradas.

**Por quê:** parâmetros duplicados em agentes e execução podem divergir; simples sobrescritas permitem remover limites superiores. A composição tem ordem parcial explícita por campo e produz identidade verificável, preservada com evidências e decisões.

O contrato de tipos `risk/domain/policy-model.ts` é compartilhável somente por imports TypeScript de tipo, para agentes e execução já autorizados a depender de risco. O verificador arquitetural permite apenas esse arquivo explicitamente registrado e somente imports apagados na compilação. Imports de valores continuam seguindo os índices públicos e as camadas existentes. Não se cria um pacote/serviço compartilhado nem dependência executável entre domínios para transportar metadados.

Clock e geração de IDs entram no serviço por portas; Git, hashing, SQL e autenticação ficam em adaptadores/composição. Definições JSON não contêm funções executáveis.

Ativação e execução paper compartilham o lock do subledger. Posições mantêm o plano histórico; controles emergenciais só restringem manutenção/saída. Rollback não reescreve o passado. O primeiro painel usa a governança de desenvolvimento existente e não habilita administração de produção.
