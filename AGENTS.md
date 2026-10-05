# Instruções obrigatórias de desenvolvimento — BETTEX

## Antes de qualquer implementação

1. Ler este arquivo, `replit.md`, `docs/architecture.md` e as decisões relevantes em `docs/decisions/`.
2. Identificar o domínio responsável e procurar a implementação existente antes de criar outra.
3. Conferir dependências permitidas, propriedade dos dados, autorização e fontes de verdade.
4. Definir critérios de aceite e testes proporcionais, incluindo falhas.
5. Se a funcionalidade não couber no mapa, registrar e justificar a evolução em uma decisão antes de criar estrutura paralela.

`replit.md` conserva o contexto do produto e restrições de escopo. Este arquivo define a rotina do agente; `docs/architecture.md`, as fronteiras técnicas; `docs/decisions/`, as justificativas. Conflitos exigem resolução explícita, nunca exceção silenciosa.

## Estrutura e responsabilidade

- Organizar por domínio: usuários/contas, carteiras, contabilidade, agentes/estratégias, risco e execução; conciliação e auditoria são contextos de apoio.
- Separar regras de domínio, casos de uso, infraestrutura e transporte. Não criar pastas vazias para aparentar modularização.
- Cada regra e conjunto de dados têm um proprietário. Um módulo não acessa nem modifica tabelas internas de outro.
- Comunicação por API pública ou eventos versionados; não importar arquivos internos de outro módulo.
- Regras centrais não dependem de carteira, blockchain, corretora, modelo de IA ou hospedagem. Usar portas e adaptadores.
- Compartilhar apenas contratos ou componentes com finalidade definida. Não duplicar políticas nem concentrá-las em `utils`/`services`.
- Preservar o código adequado e migrar incrementalmente. O legado registrado não significa autorização para ampliar a arquitetura antiga.

## Fluxo obrigatório e segurança

**Agente propõe → motor de risco autoriza → executor realiza → conciliação confirma.**

- BTEX coordena/compara propostas; não pode substituir o motor de risco.
- Limites e permissões são código determinístico, fora do modelo de linguagem.
- IA não acessa chaves, assina transações ou contorna controles. Assinatura financeira exige isolamento.
- Validação obrigatória falhou ou está indisponível: bloquear novas operações financeiras.
- Cancelamento, recuperação e redução de exposição seguem procedimentos próprios e mandatos limitados; não são bypass de risco nem retry cego.
- Menor privilégio e separação entre desenvolvimento, simulação e produção. Credenciais fora do código, logs e contexto da IA.

## Integridade financeira

- Identificador único, estados explícitos, histórico durável e idempotência por operação.
- Duplicação de mensagens/webhooks e reinício não podem produzir segunda movimentação.
- Resultado externo incerto exige conciliação antes de reenvio.
- Precisão exata com ativo, rede e escala; distinguir disponível, reservado e confirmado.
- Blockchain/corretora confirmam operações externas; ledger é a fonte contábil interna, reconciliada com elas.
- Interface, cache e memória de agentes não são saldo oficial.
- Corrigir por lançamentos compensatórios, sem apagar o histórico.
- Registrar proposta, decisão de risco, tentativa e resultado com o mesmo `operationId` e IDs próprios de evento/tentativa.

## Conclusão de uma mudança

- Atualizar contratos, interface e documentação quando afetados; não editar clientes gerados manualmente.
- Executar `pnpm check:architecture` e a verificação proporcional. Para entrega abrangente, `pnpm quality`.
- Validar permissões, cálculos, idempotência, concorrência e recuperação quando o fluxo os afetar.
- Documentar limitações e decisões pendentes sem afirmar integrações/serviços inexistentes.
- Não alterar homepage/Pitch, economia aprovada ou cronograma fora do escopo solicitado.

Referências complementares: `CONTRIBUTING.md`, `SECURITY.md`, `threat_model.md`.