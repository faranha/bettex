# BETTEX 1.0 — referência canônica e procedimento de restauração

## Identidade e autorização

O criador pediu preservar integralmente o estado atual antes de qualquer
implementação da nova direção de produto. O nome dessa referência é **BETTEX 1.0**.
“Restaure a versão 1.0” significa esta referência, não uma reconstrução aproximada
com base em conversas. Nunca atualizar os backups dessa versão para refletir
mudanças posteriores.

A proposta de foco em um ativo, expansão futura, narrativa para apostadores,
pesquisa de manipulação e retirada da marca Arbitrum é **planejamento** e não
faz parte das alterações de produto desta preservação.

## Camadas e garantias

1. **Projeto:** código atual, monorepo, contratos e testes presentes, configurações
   de artefatos, lockfile, traduções, imagens, downloads, documentos, materiais
   enviados, corpus de pesquisa e build local da web.
2. **Banco de desenvolvimento:** dump PostgreSQL consistente, incluindo estrutura,
   registros e sequências. A validação decodifica todos os blocos; não substitui
   um ensaio completo de restauração em ambiente isolado.
3. **App Storage:** cópia privada dos objetos acessíveis nos buckets configurados,
   preservando conteúdo, metadados originais e referências de geração no recibo.
   O snapshot de objetos é sequencial, não uma transação global com o PostgreSQL.
4. **Visual:** capturas de referência da homepage, Pitch, documentação e entrada
   do aplicativo. O build preservado ajuda a reproduzir o HTML/CSS/JS; fontes
   remotas, mercado ao vivo, navegador e serviços externos podem mudar.
5. **Configuração:** valores não sigilosos presentes nos arquivos são preservados.
   Segredos não são exportados. Mantê-los no gerenciador de Secrets.

## Arquivos e integridade

- Registro público do projeto: `docs/releases/bettex-1.0-record.json`.
- Documento canônico: este arquivo.
- Payload privado local: `generated-artifacts/releases/bettex-1.0/`.
- `workspace.tar.gz`: arquivos efetivamente capturados, com inventário interno
  `BETTEX-1.0-FILES.json` e SHA-256 individual.
- `development.dump`: banco de desenvolvimento, formato custom do PostgreSQL.
- `payload-manifest.json`: hashes dos arquivos e escopo da captura.
- `storage-receipt.json`: localização privada, gerações, integridade das cópias
  e metadados originais dos objetos. Não disponibilizar esse recibo em rota pública.

O diretório local de payload está ignorado por Git e publicação. Não colocar
dumps em `public/`, não enviar ao GitHub e não apresentar link público para eles.
Os arquivos privados devem ser recuperados do App Storage se a cópia local faltar.

## Pendências que impedem dizer “tudo restaurável”

- **Produção:** é um banco separado. O dump de desenvolvimento não o substitui.
  Preservar um backup independente no painel Database → produção → Settings
  e registrar sua identificação antes de mudanças produtivas. A recuperação
  pontual depende da janela de retenção; não é uma cópia permanente da 1.0.
- **Clerk:** contas, configuração do tenant e estado de sessões são externos;
  não estão exportados neste pacote.
- **Segredos:** não são versionados e não voltam automaticamente com rollback.
- **Publicação:** o estado publicado pode não coincidir com o workspace atual.
  Restaurar código não republica o projeto nem restaura produção.
- **Serviços externos:** respostas de mercado, estado on-chain, provedores e
  credenciais não podem ser desfeitos pelo arquivo do projeto.

Não afirmar que o snapshot é completo enquanto essas pendências existirem.

## Quando o criador pedir “restaure a versão 1.0”

1. Ler este documento e `bettex-1.0-record.json`; verificar os recibos privados
   e hashes. Se faltar qualquer parte, informar antes de alterar dados.
2. Fazer backup do estado então atual. Explicar quais dados posteriores seriam
   perdidos; obter confirmação antes de substituir bancos ou objetos.
3. Preferir o checkpoint correspondente no Replit para código e, quando
   selecionado, banco de desenvolvimento. O checkpoint não substitui as outras
   camadas acima.
4. Recuperar o payload privado, verificar SHA-256 e inventário. Extrair primeiro
   em diretório vazio, sem sobrescrever o projeto em execução. Conferir caminhos
   e conteúdo antes da substituição. O arquivo contém dados privados.
5. Reconstruir dependências com as versões do lockfile e do runtime registrados.
   Não executar atualizações de pacotes ou geradores editoriais desnecessários.
6. Restaurar `development.dump` somente no destino confirmado e autorizado.
   Não usar esse arquivo como migração ou substituição automática de produção.
7. Restaurar App Storage pelos mapeamentos do recibo, recuperando os metadados
   originais somente nos objetos originais, nunca tornando os backups públicos.
8. Conferir Secrets e configuração externa do Clerk. Recuperar produção apenas
   pelo procedimento e backup próprios, com autorização específica.
9. Reiniciar os workflows existentes; verificar homepage, Pitch, documentação
   e aplicativo em PT/EN/ES e comparar com as referências visuais. Respeitar as
   limitações documentadas para dados dinâmicos e sessões.
10. Executar a validação de produção. Só publicar depois de autorização do criador.

## Checkpoint

O criador pretende criar o checkpoint **depois** desta preservação, com o nome
**BETTEX 1.0**. Não afirmar que esse checkpoint já foi criado por este trabalho.
Quando ele existir, associar sua identificação ao registro, sem modificar os
payloads já preservados.
