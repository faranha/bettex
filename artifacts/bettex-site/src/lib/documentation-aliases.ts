/** Published hashes from the previous 14-chapter documentation, resolved to current destinations. */
export const documentationAliases: Record<string, string> = {
  'documentacao-subagente-esportes': 'documentacao-subagente-cripto',
  'documentacao-subagente-previsoes': 'documentacao-subagente-cripto',
  'documentacao-subagente-igaming': 'documentacao-subagente-cripto',
  'documentacao-baseline-esportes': 'documentacao-subagente-cripto',
  'documentacao-baseline-previsoes': 'documentacao-subagente-cripto',
  'documentacao-baseline-igaming': 'documentacao-subagente-cripto',
  'documentacao-conexoes-esportes': 'documentacao-subagente-cripto',
  'documentacao-conexoes-previsoes': 'documentacao-subagente-cripto',
  'documentacao-conexoes-igaming': 'documentacao-subagente-cripto',
  'documentacao-tributos': 'documentacao-staking',
  'documentacao-recompras': 'documentacao-recompra-queima',
  'documentacao-responsabilidade-seguranca': 'documentacao-seguranca',
  'documentacao-entidade': 'documentacao-governanca',
  'documentacao-empresa': 'documentacao-governanca',
  'documentacao-fundador': 'documentacao-governanca',
  'documentacao-entidade-multisig': 'documentacao-governanca',
  'documentacao-politicas': 'documentacao-governanca',
  'documentacao-evolucao-bots': 'documentacao-governanca',
  'documentacao-versao-politica': 'documentacao-governanca',
  'documentacao-formalizacao': 'documentacao-governanca',
  'documentacao-patrimonio': 'documentacao-governanca',
  'documentacao-missao': 'documentacao-como-funciona',
  'documentacao-publico': 'documentacao-como-funciona',
  'documentacao-oportunidade': 'documentacao-como-funciona',
  'documentacao-financiamento-fundacao': 'documentacao-financiamento',
  'documentacao-plano-negocios': 'documentacao-financiamento',
  'documentacao-piloto': 'documentacao-financiamento',
  'documentacao-receita-piloto': 'documentacao-financiamento',
  'documentacao-aquisicao-retencao': 'documentacao-financiamento',
  'documentacao-fontes-financiamento': 'documentacao-financiamento',
};

export function resolveDocumentationId(id: string): string {
  return !document.getElementById(id) && documentationAliases[id] ? documentationAliases[id] : id;
}

/** Hashes that must keep opening the documentation from the home page. */
export const legacyDocumentationHashes = new Set<string>([
  'documentacao-como-funciona', 'documentacao-entidade', 'documentacao-adequacao-legal', 'documentacao-rede', 'documentacao-acesso',
  'documentacao-arquitetura', 'documentacao-agentes', 'documentacao-emissao', 'documentacao-servicos', 'documentacao-staking',
  'documentacao-controles', 'documentacao-implantacao', 'documentacao-riscos', 'documentacao-governanca', 'documentacao-roadmap',
  ...Object.keys(documentationAliases),
]);
