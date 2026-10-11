# Integração final no GitHub

## Antes de enviar

- Ler [estado atual](project-status.md), [testnets](testnets/README.md) e [relatório](github-readiness-report.md).
- Conferir diff e arquivos novos; não sobrescrever mudanças de outras pessoas.
- Manter `.env`, chaves, dumps, backups, estado de runtime, screenshots e relatórios gerados fora do Git.
- Não incluir dados reais de usuários ou exportações de carteiras.
- Não inserir tokens em URLs de remote, scripts, issues ou instruções.
- Conferir direitos de uso de imagens, marcas e referências importadas.
- Confirmar a licença de distribuição: o `package.json` declara MIT, mas essa declaração
  não substitui a confirmação do titular nem um arquivo de licença aprovado.
- Verificar que o material atual não afirma parceria, grant aprovado, deploy ou operação não comprovados.

## Verificação local

Os comandos de [testing.md](testing.md) diferenciam produto atual e referência
operacional histórica. Um resultado verde em um perfil não certifica o outro.
Relatórios detalhados são locais e ignorados pelo Git; o resumo público deve
informar perfil, data, pré-requisitos, limitações e falhas pendentes.

## Sincronização e revisão

A preparação não envia commits nem publica o produto. Durante a revisão, manter
o watcher pausado com `pnpm sync:pause`. Para a integração final, o responsável
deve revisar a configuração e autenticação de Git seguindo [github-sync.md](github-sync.md).
Não executar `sync:resume` ou `sync:once` antes dessa revisão: esses comandos
podem criar commit e enviar a branch autorizada.

O fluxo recomendado é uma branch de revisão e um pull request, com CI e revisão
humana. Não alterar visibilidade do repositório, branch de destino ou permissões
durante uma reorganização documental.

## Depois da integração

Verificar o clone limpo, instalar com lockfile congelado, executar o perfil atual
e inspecionar o site/demo. Testnet pública e publicação do site são liberações
separadas. A integração no GitHub não muda acesso público, banco ou contratos.
