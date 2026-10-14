/** Navigation groups are responsibilities, not disconnected technical appendices. */
export const documentationChapters = [
  { id: 'documentacao-como-funciona', title: 'Visão do projeto', subtitle: 'O sistema, seus conceitos e o percurso da demonstração.', group: 0 },
  { id: 'documentacao-agentes', title: 'Agente BETTEX', subtitle: 'Inteligência central, orquestração, aprendizado e ponto de partida.', group: 1 },
  { id: 'documentacao-subagente-risco', title: 'Subagente de Risco', subtitle: 'Análise de exposição e baseline de autorização, limites e continuidade.', group: 2 },
  { id: 'documentacao-subagente-tesouraria', title: 'Subagente de Tesouraria', subtitle: 'Recursos, reservas, liquidez e análise de alocação.', group: 2 },
  { id: 'documentacao-subagente-governanca', title: 'Subagente de Governança', subtitle: 'Políticas, propostas, mandatos e supervisão.', group: 2 },
  { id: 'documentacao-subagente-cripto', title: 'Subagente Cripto', subtitle: 'Mercados, inferências, conectores e especializações por ativo.', group: 2 },
  { id: 'documentacao-especialista-btc', title: 'Cripto · BTC', subtitle: 'Especialização interna do subagente Cripto.', group: 2 },
  { id: 'documentacao-especialista-eth', title: 'Cripto · ETH', subtitle: 'Especialização interna do subagente Cripto.', group: 2 },
  { id: 'documentacao-especialista-sol', title: 'Cripto · SOL', subtitle: 'Especialização interna do subagente Cripto.', group: 2 },
  { id: 'documentacao-subagente-esportes', title: 'Subagente de Esportes', subtitle: 'Análise esportiva, oportunidades e condições de execução.', group: 2 },
  { id: 'documentacao-subagente-previsoes', title: 'Subagente de Previsões', subtitle: 'Probabilidades, mercados de eventos e fontes de execução.', group: 2 },
  { id: 'documentacao-subagente-igaming', title: 'Subagente de iGaming', subtitle: 'Análise de condições, bônus e riscos nos mercados de iGaming.', group: 2 },
  { id: 'documentacao-features', title: 'Features', subtitle: 'Funcionalidades do aplicativo que executam regras, não inteligências.', group: 3 },
  { id: 'documentacao-carteira-bettex', title: 'Carteira BETTEX', subtitle: 'Titularidade, participação e portabilidade da carteira.', group: 3 },
  { id: 'documentacao-carteira-usdc', title: 'Carteira USDC', subtitle: 'Saldo financeiro, on-ramp externo e saques em cripto.', group: 3 },
  { id: 'documentacao-acesso', title: 'Conta, acesso e exportação', subtitle: 'Autenticação, sessão, autorização e dados exportáveis.', group: 3 },
  { id: 'documentacao-historico', title: 'Histórico e conciliação', subtitle: 'Registros, estados e conferência dos movimentos financeiros.', group: 3 },
  { id: 'documentacao-staking', title: 'Staking e distribuição', subtitle: 'Elegibilidade, rodadas, cálculo, liquidação e correções.', group: 3 },
  { id: 'documentacao-emissao', title: 'Token e regras econômicas', subtitle: 'Emissão, venda, vesting, direitos e destinação dos resultados.', group: 3 },
  { id: 'documentacao-feature-recompra', title: 'Recompra e queima', subtitle: 'Execução do mecanismo e separação da análise da tesouraria.', group: 3 },
  { id: 'documentacao-jogos', title: 'Burn Lottery e Double 2X', subtitle: 'Jogos internos determinísticos, separados do agente de iGaming.', group: 3 },
  { id: 'documentacao-riscos', title: 'Base técnica e segurança', subtitle: 'Redes, controles comuns, custódia e condições territoriais.', group: 4 },
  { id: 'documentacao-roadmap', title: 'Roadmap', subtitle: 'Etapas existentes e evolução após a avaliação da POC.', group: 5 },
] as const;

export const documentationGroups = [
  'Começar aqui', 'Inteligência central', 'Subagentes', 'Features', 'Base compartilhada', 'Evolução',
] as const;

const cryptoSpecialists = [
  'documentacao-especialista-btc', 'documentacao-especialista-eth', 'documentacao-especialista-sol',
] as const;

export function documentationParentId(id: string): string | undefined {
  return cryptoSpecialists.some(specialist => specialist === id) ? 'documentacao-subagente-cripto' : undefined;
}

export function documentationChapterNumber(index: number): string {
  const chapter = documentationChapters[index];
  if (chapter.id === 'documentacao-features') return '';
  const parent = documentationParentId(chapter.id);
  if (parent) {
    const parentIndex = documentationChapters.findIndex(item => item.id === parent);
    const childIndex = cryptoSpecialists.findIndex(id => id === chapter.id);
    return `${documentationChapterNumber(parentIndex)}.${childIndex + 1}`;
  }
  return String(documentationChapters.slice(0, index + 1).filter(item => item.id !== 'documentacao-features' && !documentationParentId(item.id)).length);
}
