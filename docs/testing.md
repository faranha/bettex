# Verificação e perfis de testes

## Produto atual

```sh
pnpm quality:current -- --report generated-artifacts/github-preparation/current.json
```

O perfil atual verifica lint, arquitetura, contratos HTTP gerados, TypeScript,
segredos, dependências, modelos puros, biblioteca EVM isolada, builds, demo visual,
bloqueio da API e SEO. Testes de referência que não exigem ativação operacional
também podem compor este perfil; isso não os torna regras econômicas vigentes.

## Referência operacional histórica

```sh
pnpm quality --continue --report generated-artifacts/github-preparation/reference.json
```

`quality` mantém a verificação completa anterior. Ela não ignora falhas.
O perfil atual informa explicitamente as verificações não selecionadas:

- `check:security`: isolamento/restauração HTTP histórico; espera rotas de conta hoje bloqueadas.
- `check:history-store`: integração HTTP histórica; espera rotas operacionais não montadas.
- `check:treasury-integration`: requer runtime local que está explicitamente desativado.

Essas verificações não devem ser “consertadas” liberando operações no app público.
Precisam de um harness operacional isolado e especificação compatível com as
regras atuais, com autorização própria. A ausência delas no perfil atual não é
um resultado aprovado, e o relatório mantém `excluded` e a razão.

## Comandos focados

```sh
pnpm lint
pnpm check:architecture
pnpm typecheck
pnpm --filter @workspace/bettex-site run check:demo-consistency
pnpm --filter @workspace/api-server run check:visual-api
pnpm --filter @workspace/bettex-site run check:seo
pnpm --filter @workspace/bettex-contracts test
```

`check:seo` exige o build do site, mas não regeneração das imagens.
A regeneração opcional das artes usa Chromium/Playwright, ImageMagick e acesso
às fontes; as imagens prontas ficam versionadas para não exigir essas ferramentas
na instalação básica.

## Segurança de execução

- Nunca apontar testes para produção ou carteira pública com fundos.
- Não executar scripts de funding/runtime público como dependência de build.
- Contratos locais exercitam ativos mock em cadeia isolada; não provam deploy público.
- CI deve usar serviços efêmeros, permissões mínimas e nenhuma chave de produção.
- Não publicar logs, dumps ou relatórios que contenham dados privados.
- Não substituir falha por “zero”, teste omitido por “passou” ou runtime bloqueado por ativação.

## Limite da revisão

Esta revisão de lógica e os testes automatizados não são auditoria externa de
contratos, pentest, certificação regulatória ou comprovação de lucro.
Resultados do demo são consistência de fixtures; operações reais exigem evidência independente.
