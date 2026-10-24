# Versionamento BETTEX

## Versão em desenvolvimento: BETTEX 1.5

A partir de 25/10/2026, os novos trabalhos pertencem à **BETTEX 1.5**.
O registro desta versão não significa que ela foi implementada, validada ou publicada.

- [Plano e escopo da BETTEX 1.5](BETTEX-1.5.md).
- [Registro legível por ferramentas](current-version.json).

## Referência congelada: BETTEX 1.0

A **BETTEX 1.0** permanece como referência canônica de restauração:

- [Documento e procedimento](BETTEX-1.0.md).
- [Identificador exato do destino de rollback](bettex-1.0-record.json).

“VOLTE PARA versão 1.0” continua apontando ao destino fixado nesses documentos,
nunca à versão em desenvolvimento nem a um checkpoint posterior.

## Regras de organização

1. Registrar planos, decisões e mudanças futuras sob a versão 1.5.
2. Distinguir proposta, decisão aprovada, implementação e publicação.
3. Não sobrescrever backups, hashes ou o destino de rollback da 1.0.
4. O número de versão de produto não altera automaticamente a versão dos
   pacotes do monorepo, a versão da API ou rótulos públicos.
5. Registrar o identificador exato de um futuro checkpoint da 1.5 quando ele
   for designado. Nunca usar “último checkpoint” como referência permanente.
6. Uma versão em desenvolvimento não autoriza mudanças adicionais no produto,
   execução financeira ou publicação.
