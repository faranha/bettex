---
name: Isolamento de testes de segurança
description: Por que um schema de fixture não basta se defaults e conexões alcançam o schema do app.
---

Testes de integração de segurança e restauração não podem usar dados, sessões ou contadores do aplicativo. Uma cópia vazia de tabelas não garante isolamento: defaults seriais podem continuar referindo sequências originais, e foreign keys/triggers não são copiados integralmente.

**Why:** A revisão exigiu testar backups e autorização sem alterar contas ou o runtime EVM existentes; uma sequência compartilhada já rompe esse requisito mesmo sem inserir linhas no schema original.

**How to apply:** Verificar o schema efetivo da conexão, impedir fallback ao schema do app, dar propriedade independente aos recursos dependentes e reaplicar invariantes necessárias antes dos testes. Não usar restauração de PostgreSQL como evidência de recuperação da blockchain.

Para provar retomada depois de trocar o backend, preservar a mesma cadeia e o mesmo schema de fixture. Recriar ambos é outro experimento, não evidência de persistência.

**Why:** Um novo funding/pagamento em outra cadeia pode dar falso positivo de recuperação, mesmo quando o saldo final coincide.

**How to apply:** Comparar hashes e saldos já existentes antes/depois da troca do backend; limpar a fixture só após capturar e conferir seus recibos.

Uma fixture nova precisa das migrações reais que estabelecem auditoria de permissões e outros invariantes, não apenas dos inicializadores de tabelas do runtime.

**Why:** Inicializadores de tabelas podem bastar para consultas comuns, mas omitir triggers instalados por migrações; isso gera falsos negativos de auditoria em um schema recém-criado.

**How to apply:** Aplicar as migrações pertinentes exclusivamente na conexão isolada e criar os próprios registros para cada asserção HTTP; não depender de histórico previamente existente no aplicativo.
