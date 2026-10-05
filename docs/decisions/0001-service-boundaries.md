# Contextos modulares e extração gradual de serviços

**Status:** adotada como regra de desenvolvimento; migração estrutural pendente.

## Contexto

A API existente é monolítica e o estado financeiro é demonstrativo. Distribuir processos sem precisão, autorização e recuperação apenas amplia o risco.

## Decisão

Adotar os contextos e dependências de [architecture.md](../architecture.md), com interfaces públicas, propriedade de dados e migração incremental. Preservar artifacts, banco e rotas durante a evolução.

Isolar assinatura antes de qualquer transação real. Extrair outros serviços por segurança, carga ou disponibilidade comprovadas, com outbox, idempotência e observabilidade.

## Alternativas e consequências

Rejeitada decomposição total imediata: exigiria operação distribuída antes de existir núcleo financeiro confiável. Módulos não autorizam chaves junto dos agentes. Extrações futuras precisam de implantação e verificação próprias.