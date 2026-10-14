import { BettexFlow } from './architecture/BettexArchitecture';
import { DocTerms } from './DocImage';
import './agent-documentation.css';
import { intelligenceCopy } from '@/lib/documentation-intelligence';

const agents: { id: string; name: string; input: string; analysis?: string; result: string }[] = [
  { id: 'orquestradora', name: 'IA BETTEX · orquestradora', input: 'Oportunidades, prioridades e respostas dos agentes.', analysis: intelligenceCopy.coordination, result: 'Prioridade e proposta fundamentadas; retorno aos agentes e histórico.' },
  { id: 'tesouraria', name: 'Agente da tesouraria', input: 'Patrimônio, reservas, posições, compromissos e obrigações conciliados.', analysis: intelligenceCopy.treasury, result: 'Capital autorizado ou bloqueio; sugestões de política para aprovação humana.' },
  { id: 'risco', name: 'Agente de risco', input: 'Exposição, perdas, liquidez, limites e propostas.', analysis: intelligenceCopy.risk, result: 'Parecer e alertas; execução sujeita a controles e mandatos aprovados.' },
  { id: 'previsoes', name: 'Agente de previsões', input: 'Gamma: mercado e regras; CLOB: preço e liquidez.', result: 'Proposta aprovada ou descartada; ordens assinadas exigem acesso autorizado.' },
  { id: 'acoes-cripto', name: 'Agente de ações e cripto', input: 'Preços, sinais, volatilidade e profundidade; Allora como inferência opcional.', analysis: 'Cruza sinais com liquidez e exposição; Robinhood é possível canal cripto, não acesso presumido a ações.', result: 'Ordem autorizada e conciliação, ou rejeição fundamentada.' },
  { id: 'esportes', name: 'Agente de esportes', input: 'Odds, limites, regras e respostas de cada casa autorizada.', result: 'Execução e liquidação por parte; exposição incompleta conciliada.' },
  { id: 'cassinos', name: 'Agente de iGaming', input: 'Bônus, elegibilidade, jogos, rollover, prazo e limite de saque.', result: 'Oferta aceita ou rejeitada com memória de cálculo; não inferir lucro pelo bônus nominal.' },
  { id: 'recompra-queima', name: 'Agente de recompra e queima', input: 'USDC segregado dos 25% do resultado elegível e condições de mercado.', analysis: 'Propõe quantidade, preço, liquidez, custos e mecanismo de burn.', result: 'Compra e queima rastreáveis; recursos incertos bloqueiam repetição.' },
  { id: 'governanca', name: 'Agente de governança', input: 'Versões, mandatos, limites, desvios e trilha de operações.', analysis: intelligenceCopy.governance, result: 'Histórico de políticas, alerta, pausa ou versão aprovada em vigor.' },
];

/** `only` filters by agent id (e.g. 'tesouraria'); `cycle` toggles the shared cycle block; `intro` the lead and links. Defaults render everything. */
export function InvestmentAgents({ only, cycle = true, intro = true, embedded = false, compact = false }: { only?: string[]; cycle?: boolean; intro?: boolean; embedded?: boolean; compact?: boolean } = {}) {
  return <>
    {intro && <>
    <div className="whitepaper__lead"><span>ORQUESTRAÇÃO · ANÁLISE · CONTROLE</span><p>{intelligenceCopy.baseline}</p></div>
    <p className="doc-terms__note">BETTEX ↔ agente: proposta, pedido de análise e resposta</p>
    </>}
    {agents.filter(agent => !only || only.includes(agent.id)).map(agent => <section key={agent.id} id={`documentacao-agente-${agent.id}`} className={`doc-agent${compact ? ' doc-agent--compact' : ''}`}>
      {!embedded && <h3 className="whitepaper__subhead">{agent.name}</h3>}
      {agent.analysis && <div className="whitepaper__prose"><p>{agent.analysis}</p></div>}
      {compact ? <div className="doc-agent__reference-context">
        <DocTerms items={[['Entradas', agent.input], ['Resultado', agent.result]]} />
      </div> : <DocTerms items={[['Entradas', agent.input], ['Resultado', agent.result]]} />}
    </section>)}
    {cycle && <>
    <h3 className="whitepaper__subhead" id="documentacao-ciclo-agentes">Conectores, decisão e evidência</h3>
    <div className="whitepaper__prose"><p>Entrada → consulta/resposta → análise bidirecional → proposta → validação independente → execução autorizada → conciliação. Cada operação registra dados, horário, versão, capital, custos, motivo e estado. <a href="#documentacao-demonstracoes">Demonstrações públicas e pré-requisitos</a> distinguem consulta de dados, simulação e ordens privadas.</p><p>Compromissos simultâneos são registrados indivisivelmente antes do envio; repetição não cria outra ordem. Conciliação devolve estados e resultados aos agentes e à tesouraria. Mudanças de política seguem <a href="#documentacao-evolucao-bots">Governança</a>, sem ampliar unilateralmente permissões.</p></div>
    <BettexFlow figure="7" />
    <BettexFlow figure="8" />
    </>}
  </>;
}