# BETTEX — revisão interna de segurança e organização

## Escopo e fontes

Revisão da implementação vigente, com correções na arquitetura existente. Homepage, economia, contas existentes, dinheiro real e runtime EVM do app não foram alterados por testes.

Referências oficiais consultadas:
- [OWASP ASVS 5.0.0](https://owasp.org/www-project-application-security-verification-standard/): autenticação/sessão, autorização, validação, proteção de dados, comunicação e configuração. Cobertura parcial orientada a riscos; não certificação por requisito.
- [OpenZeppelin 5.x: permissões](https://docs.openzeppelin.com/contracts/5.x/access-control), aplicado à versão instalada **5.6.1**.
- [Express: segurança de produção](https://expressjs.com/en/advanced/best-practice-security.html).
- Base oficial interna: inventário de versões e consulta Robinhood; exemplos publicados da [documentação oficial](https://docs.robinhood.com/crypto/trading/) não são credenciais operacionais BETTEX.

## Mapa e fronteiras verificadas

| Componente | Responsabilidade / fronteira |
|---|---|
| React/Vite e conta inline | Navegador não confiável; carteira descriptografada e assinada apenas localmente; não determina saldo/autorização |
| Express / OpenAPI-Zod | Autenticação, origem, schema, propriedade e tradução HTTP; composição dos adaptadores existentes |
| Accounts / Clerk | Sessão nativa opaca/hash/TTL/scrypt e identidade Clerk verificada; não mesclar usuários por e-mail |
| Wallets | Dois endereços/cofre cifrado/metadados; associação local explícita; nenhum private key no backend |
| PostgreSQL / audit | Transações, revisões, unicidade, nonces/idempotência e journal append-only; demonstrativo não vira ledger real |
| Execution / reconciliation | Operações pertencem à conta; assinatura vinculada ao draft; recibos/blocos/efeitos/epoch conferidos |
| Ledger atual | Participação × tempo com inteiros; ainda não é ledger patrimonial nem distribuição de lucros real |
| Agentes / Allora / risco | Inferência e propostas não autorizam assinatura; execução atual emulada, sem trading real |
| Contratos de teste | Supply fixa, vesting, venda em unidades exatas, comprador/destino autorizados, reentrância/replay/pausa/owner |
| Infraestrutura | Frontend público, API, EVM auxiliar local; Git/IAM/provedor/produção são fronteiras administrativas externas |

## Problemas e correções

| Gravidade | Componente/evidência | Impacto | Correção | Verificação |
|---|---|---|---|---|
| Alta | `app.ts`: CORS refletia qualquer origin com credentials; várias mutações dependiam só de Sec-Fetch-Site | Leitura indevida em cenários de cookie elegível/origem hostil; proteção HTTP desigual | Allowlist exata, reject de origem hostil/ausente nas escritas, JSON no app, authorizedParties Clerk; protocolo do proxy preservado | HTTP e testes negativos, origens falsas/HTTP/sufixo/porta/form/CSRF |
| Alta (scanner) | 5 alertas altos/3 moderados em dependências, inicialmente | DoS e outras falhas em pacotes diretos/transitivos | ethers 6.17.0, Orval 8.39.0 e overrides compatíveis tmp 0.2.7, fast-uri 3.1.8, brace-expansion 5.0.12; firewall/idade preservados | Audit contínuo e build/testes |
| Média | `demo.ts` registrava Error bruto; parser Express podia retornar detalhes | SQL/params/input/stack em falhas | Logs por código e handler JSON sanitizado; limite 64 KiB | Erros 400/413/500 sem conteúdo sensível |
| Média | Cofre/carteira sem FK ao proprietário no banco | Órfãos e perda de garantia de integridade fora do transporte | FKs e migração aditiva versionada; órfão falha, não é apagado | FK 23503 em fixture; validação no desenvolvimento |
| Média | Logout nativo podia conservar sessão Clerk simultânea | Retorno involuntário à outra identidade em dispositivo compartilhado | Encerrar Clerk antes da sessão nativa e bloquear material privado local | Regressão de sessão/HTTP; callback explícito no app |
| Média | Frontend sem CSP/headers e proteção explícita de arquivos internos | Defesa insuficiente contra injeção/exposição acidental de artefatos | CSP sem eval/event handlers, hash de inline aprovado, nosniff/referrer/permissions; negar dotfiles/backups/maps/symlinks externos | Servidor estático e regressão |
| Média | Sem pausa global nos broadcasts | Operações pendentes poderiam continuar a enviar após uma pausa de transporte | Pausa no HTTP financeiro e antes de ambos os broadcasts, mantendo conciliação | Testes de pausa e pontos de envio |
| Organização | Verificador falhava em fachada com infraestrutura e DTO de transporte | Fronteiras inconsistentes/documentação desatualizada | Composição no adaptador existente; DTO só no transporte; mapa/canônicos atualizados | `check:architecture` e regressões |

## Verificações permanentes e executadas

- Três scanners: dependências, SAST e privacidade/dataflow. Inicial: 5 altos/3 moderados de dependências, 1 médio SAST, 0 dataflow.
- Scan offline conservador de padrões de segredo: workspace, builds, todos os blobs textuais acessíveis no Git e logs locais; somente metadados, nunca valores. Não detecta toda PII/entropia. Um exemplo público de documentação foi classificado por hash exato, não permitido genericamente em código de execução.
- `pnpm quality`: lint, arquitetura, documentação oficial, codegen, tipos, testes de contas/cofres/execução/histórico, EVM descartável, backend/frontend, localização e bundles.
- HTTP real sobre schema vazio separado: dados próprios, history de outro owner não retornado, export de carteira alheia 403, admin 403, CSRF 403, senha incorreta 401 e sessão revogada.
- Backup/restauração real `pg_dump`/`pg_restore`: somente fixtures; cofres criptografados, hashes de sessão e journal preservados. Defaults seriais têm sequências próprias; FKs são reaplicadas, pois LIKE não copia foreign keys/triggers.
- Contratos: supply/vesting, owner/transferência em duas etapas/pausa, destinatário, limite/preço, rollback por falha, reentrância e replay por comprador; assinatura, nonce, idempotência, efeitos e reorganização nas regras de execução.
- Testes de cofre: senha/tamper, integridade dos mesmos endereços após troca de senha e ausência de plaintext nas estruturas persistidas.
- Regressão completa local: **148 testes automatizados** passaram, além das verificações HTTP e da restauração PostgreSQL. Endurecimento adicional do servidor estático verificado separadamente. CI preparada com PostgreSQL efêmero/client 16; runner GitHub não executado nesta sessão. Bootstrap SDK sintético em ambiente sem chaves cobre sessão nativa, não autenticação real Clerk.

## Riscos e limitações restantes

1. **Braces 3.0.3 / GHSA-vfj7-8cjw-p6xm (alto upstream, sem patch)**: fonte oficial confirma recursão sobre patterns profundamente aninhados. Proxy usa filtro-função, não glob; fast-glob/codegen recebem patterns do código/desenvolvedor, não de requisições. Exceção apenas desse advisory, expira **2026-11-05**. Proibido aceitar glob de usuário/IA. Reavaliar se mudar uso/dependências. O scanner continua mostrando esse alto; não foi “corrigido” nem ocultado.
2. SAST médio de fixation em cookie demonstrativo: cookie identifica experiência anônima, não sessão autenticada. Identidade verificada e bloqueio de browser já reivindicado impedem uso desse token como autorização. Sessão nativa é aleatória/hash/expira/revoga. Triagem interna, não prova de resistência a todas as formas de cookie tossing.
3. Limites de abuse de alguns percursos continuam em memória/IP de proxy; autenticação nativa usa limites persistidos. Não escalar/publicar recursos sensíveis sem limiter distribuído e validação da identidade de proxy.
4. JavaScript não garante zeroização de strings/clipboard. XSS/dispositivo comprometido podem expor material descriptografado; export intencional é responsabilidade do titular, com aviso e reautenticação.
5. IAM/branches/DB roles/backups de produção/revogação externa não foram alterados, por falta de acesso administrativo conectado. Runbook define ações.
6. Contas nativas/execução local seguem development-only. Sem password recovery/KYC conforme decisão da versão; legado Clerk preservado. Não habilitar isso em produção por mera troca de NODE_ENV.
7. Demonstração ainda tem números de ponto flutuante para saldos/cotações emulados; não migrar esses valores para dinheiro real. Contratos/execução/participação/histórico financeiro on-chain usam inteiros/strings exatos. Ledger patrimonial, staking financeiro/distribuição real, reorg profundo e disaster recovery público não estão entregues.
8. Contratos diretos, sem proxy/upgrades nem initializer externo; mint só construtor, vesting protegido. Revisão/testes internos não substituem auditoria independente, controle multisig público e validação de deployment/funding.
9. Encerramento de duas sessões reais simultâneas (Clerk+nativa) não exercitado no navegador nesta revisão; composição conferida e logout nativo verificado por HTTP.

## Condições para continuar

Desenvolvimento demonstrativo pode continuar se `pnpm quality` passar, não houver alto/crítico explorável pendente e a exceção expirada não estiver sendo ignorada. Alterar imports/globs, autenticação, cofre ou finanças exige regressão proporcional e atualização desses canônicos.

Antes de novos serviços financeiros/produção: limiter/IAM/backup externo testado, ledger exato, signer/mandatos isolados, redes/contratos/destinos aprovados, conciliação/recuperação verificadas e auditoria independente. CI verde não autoriza mainnet.
