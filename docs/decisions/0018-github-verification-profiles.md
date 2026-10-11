# Decisão: preparação GitHub, perfis e dívida técnica explícita

**Estado:** adotada para a preparação de engenharia.

## Contexto

O conjunto anterior mistura modelos puros, apresentação atual e integrações
históricas que esperam APIs/runtime hoje desativados. Um clone não deve ativar
operações para conseguir um resultado verde. A arquitetura também possui
adaptadores antigos em `src/lib/` que precisam de responsabilidade identificada.

## Decisão

Manter a verificação completa disponível e falhando explicitamente quando seus
pré-requisitos não existem. Criar um perfil atual que descreve as exclusões,
verifica o isolamento do demo e não certifica a referência operacional.
Usar esse perfil no CI da experiência atual.

Registrar arquivos legados individualmente, com dono e razão, sem permitir novas
pastas genéricas ou mover a cadeia financeira em uma preparação documental.
Separar o adaptador de geração/encriptação de carteiras do domínio puro sem alterar
derivação, AAD, envelope, permissões ou dados.

O armazenamento compartilhado da tabela de carteiras de tesouraria é uma exceção
pontual identificada até uma migração deliberada; não permite importar tabelas
de outros contextos livremente.

## Alternativas rejeitadas

- Reativar rotas ou runtime para acomodar testes históricos.
- Apagar os testes que falham.
- Apresentar testes omitidos como aprovados.
- Reorganizar banco/assinatura e todos os serviços de uma vez.

## Consequências

O CI atual pode avaliar o que de fato é entregue. A integração operacional futura
continua bloqueada por economia antiga, harness de testes e autorização separados.
Responsabilidade documentada não equivale à extração efetiva de microserviços.
