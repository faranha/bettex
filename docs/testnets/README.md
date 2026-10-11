# Testnets, EVM local e código de referência

## Classificação correta

| Ambiente | Função | Evidência aceitável | Situação no app atual |
| --- | --- | --- | --- |
| EVM local isolada | Testar contratos e efeitos com ativos mock | Recibos e asserts da cadeia local criada pelo teste | Não faz parte do demo público |
| Arbitrum Sepolia pública | Referência EVM de desenvolvimento | RPC público correto, bytecode/links, funding e recibos públicos separados | Não ativada por visita ao demo |
| Starknet de teste | Alternativa técnica em avaliação | Contratos Cairo e evidência própria da rede | Não há equivalência automática com Solidity/EVM |
| Mainnet | Eventual operação futura autorizada | Segurança, auditoria, adequação e autorização específicas | Fora desta preparação |

Uma EVM local pode anunciar o chain ID de Sepolia. Isso não a transforma em
testnet pública. Configuração, endereço de carteira, ABI e artefato compilado
também não comprovam deploy, funding ou compra pública.

## Código preservado

`lib/bettex-contracts/` reúne compilação, fontes, artefatos e testes.
`artifacts/api-server/src/modules/` preserva execução, carteiras,
reconciliação, risco e observação pública.
Os roteadores antigos em `src/routes/` não são montados pela API visual atual.
Scripts de runtime que estão desativados devem permanecer desativados.

Os documentos [especificação histórica](../contracts/bettex-testnet-spec.md),
[percurso nativo](../contracts/native-test-journey.md) e
[contas de teste](../personal-test-accounts.md) registram implementações anteriores.
Não são instruções para ativar operações sem revisar compatibilidade.

## Incompatibilidades conhecidas

Há percursos preservados de compra/saque que calculam tarifas USDC e fixtures
baseadas em economia antiga. Não estão compatíveis, por simples preservação,
com a regra atual de ausência de tarifa de serviço. Testes antigos que passam
demonstram apenas as premissas que efetivamente exercitam.

Alguns testes HTTP históricos esperam endpoints hoje bloqueados. Integrações
dependentes do runtime local desativado também não podem ser tratadas como
verificação atual. Seus resultados e pré-requisitos ficam explícitos em
[testes](../testing.md) e no [relatório de preparação](../github-readiness-report.md).

## Invariantes que devem ser preservados

1. Consulta pública não associa carteira nem autoriza movimento.
2. Nunca fabricar saldo zero para substituir erro de RPC.
3. Verificar identidade da cadeia, contratos e relacionamentos imutáveis; chain ID sozinho é insuficiente.
4. Aprovação não encerra a compra: manter a mesma operação até compra confirmada.
5. Envio incerto/pending exige reconciliação, não repetição automática de assinatura.
6. Cancelamento de direitos por saída deve ser atômico e comprovado na versão efetivamente usada.
7. Não reiniciar cadeia para instalar um contrato novo; isso pode destruir saldos e evidências.
8. Chaves e permissões de assinatura permanecem separadas de leitura, UI e documentação.
9. Conta, histórico, paginação e exportação precisam manter isolamento por titular.

## Procedimento futuro

Primeiro alinhar a especificação e o ambiente isolado; depois revisar contratos,
funding, autorização, limites, recuperação e compatibilidade econômica.
Somente então executar uma validação pública separada, com consentimento explícito.
Não executar `public:prepare`, `public:runtime` ou comandos de funding como etapa de clone ou CI.
