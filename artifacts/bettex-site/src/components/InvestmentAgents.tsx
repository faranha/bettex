import { BettexFlow } from './architecture/BettexArchitecture';
import { AgentPortrait, DocTerms } from './DocImage';
import './agent-documentation.css';

const portraits: Record<string, string> = { orquestradora: 'bettex-intelligence-brain.webp', previsoes: 'predix-serious.webp', 'acoes-cripto': 'tradix-serious.webp', esportes: 'sportix-serious.webp', cassinos: 'bettix-serious.webp' };

const agents: { id: string; name: string; input: string; analysis?: string; result: string }[] = [
  { id: 'orquestradora', name: 'IA BETTEX · orquestradora', input: 'Oportunidades, prioridades e respostas dos agentes.', analysis: 'Compara propostas e solicita análises; os agentes também propõem e refinam decisões.', result: 'Prioridade e proposta fundamentadas; retorno aos agentes e histórico.' },
  { id: 'tesouraria', name: 'Agente da tesouraria', input: 'Patrimônio, reservas, posições, compromissos e obrigações conciliados.', analysis: 'Avalia capital disponível, cobertura defensiva e liquidez antes e após os desembolsos.', result: 'Capital autorizado ou bloqueio; sugestões de política para aprovação humana.' },
  { id: 'risco', name: 'Agente de risco', input: 'Exposição, perdas, liquidez, limites e propostas.', analysis: 'Analisa risco independentemente do trading; propõe limites, sem ampliar permissões.', result: 'Parecer e alertas; execução sujeita a controles e mandatos aprovados.' },
  { id: 'previsoes', name: 'Agente de previsões', input: 'Gamma: mercado e regras; CLOB: preço e liquidez.', result: 'Proposta aprovada ou descartada; ordens assinadas exigem acesso autorizado.' },
  { id: 'acoes-cripto', name: 'Agente de ações e cripto', input: 'Preços, sinais, volatilidade e profundidade; Allora como inferência opcional.', analysis: 'Cruza sinais com liquidez e exposição; Robinhood é possível canal cripto, não acesso presumido a ações.', result: 'Ordem autorizada e conciliação, ou rejeição fundamentada.' },
  { id: 'esportes', name: 'Agente de esportes', input: 'Odds, limites, regras e respostas de cada casa autorizada.', result: 'Execução e liquidação por parte; exposição incompleta conciliada.' },
  { id: 'cassinos', name: 'Agente de iGaming', input: 'Bônus, elegibilidade, jogos, rollover, prazo e limite de saque.', result: 'Oferta aceita ou rejeitada com memória de cálculo; não inferir lucro pelo bônus nominal.' },
  { id: 'recompra-queima', name: 'Agente de recompra e queima', input: 'USDC segregado dos 25% do resultado elegível e condições de mercado.', analysis: 'Propõe quantidade, preço, liquidez, custos e mecanismo de burn.', result: 'Compra e queima rastreáveis; recursos incertos bloqueiam repetição.' },
  { id: 'governanca', name: 'Agente de governança', input: 'Versões, mandatos, limites, desvios e trilha de operações.', analysis: 'Confere cumprimento, registra conflitos e organiza propostas de alteração.', result: 'Histórico de políticas, alerta, pausa ou versão aprovada em vigor.' },
];

export function InvestmentAgents() {
  return <>
    <div className="whitepaper__lead"><span>ORQUESTRAÇÃO · ANÁLISE · CONTROLE</span><p>A IA BETTEX orquestra agentes com responsabilidades distintas. A comunicação é bidirecional: BETTEX define prioridades e pede análises; agentes propõem oportunidades, respondem e refinam. Tesouraria e governança acompanham os mesmos dados conciliados e a mesma versão de política.</p></div>
    <p className="doc-terms__note">BETTEX ↔ agente: proposta, pedido de análise e resposta</p>
    <div className="whitepaper__prose"><p><a href="#documentacao-controles">Controles de risco</a></p></div>
    {agents.map(agent => <section key={agent.id} id={`documentacao-agente-${agent.id}`} className="doc-agent">
      <h3 className="whitepaper__subhead doc-agent__head">{portraits[agent.id] ? <AgentPortrait file={portraits[agent.id]} /> : <span className="doc-agent__robot" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 4v4M11 4h10M7 12h18v14H7zM3 16h4m18 0h4M11 21h10" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="16" r="2" fill="currentColor" /><circle cx="20" cy="16" r="2" fill="currentColor" /></svg></span>}<span>{agent.name}</span></h3>
      {agent.analysis && <div className="whitepaper__prose"><p>{agent.analysis}</p></div>}
      <DocTerms items={[['Entradas', agent.input], ['Resultado', agent.result]]} />
    </section>)}
    <h3 className="whitepaper__subhead" id="documentacao-ciclo-agentes">Conectores, decisão e evidência</h3>
    <div className="whitepaper__prose"><p>Entrada → consulta/resposta → análise bidirecional → proposta → validação independente → execução autorizada → conciliação. Cada operação registra dados, horário, versão, capital, custos, motivo e estado. <a href="#documentacao-demonstracoes">Demonstrações públicas e pré-requisitos</a> distinguem consulta de dados, simulação e ordens privadas.</p><p>Compromissos simultâneos são registrados indivisivelmente antes do envio; repetição não cria outra ordem. Conciliação devolve estados e resultados aos agentes e à tesouraria. Mudanças de política seguem <a href="#documentacao-evolucao-bots">Governança</a>, sem ampliar unilateralmente permissões.</p></div>
    <BettexFlow figure="7" />
    <BettexFlow figure="8" />
  </>;
}