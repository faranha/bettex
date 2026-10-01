import { DocFigure, FlowLane, Link2, type FlowNode } from './DocFlow';

const decide: FlowNode[] = [
  { tag: '01', title: 'Dados e preços', text: 'Consulta de preços de compra e venda e estimativas de cotação de criptoativos. Somente leitura.', tone: 'blue' },
  { tag: '02', title: 'Análise BETTEX', text: 'O agente cruza preços, liquidez e exposição e propõe uma ordem.', tone: 'ink' },
  { tag: '03', title: 'Autorização de risco', text: 'O núcleo central de risco aprova ou recusa antes de qualquer envio.', tone: 'gold' },
  { tag: '04', title: 'Conector autorizado', text: 'Só ordens aprovadas chegam ao conector, com credenciais restritas à operação.', tone: 'teal' },
];

const execute: FlowNode[] = [
  { tag: '05', title: 'Robinhood · criptoativos', text: 'Envio ou cancelamento de ordens de criptoativos na conta operacional do projeto.', tone: 'teal' },
  { tag: '06', title: 'Estado e posições', text: 'Leitura do estado das ordens e das posições mantidas na conta.', tone: 'blue' },
  { tag: '07', title: 'Conciliação BETTEX', text: 'Os registros do projeto são conferidos com o estado informado pela plataforma.', tone: 'gold' },
];

export function RobinhoodFlowDiagram() {
  return (
    <DocFigure
      id="documentacao-diagrama-robinhood"
      label="Fluxo do conector de criptoativos"
      title="Leitura, decisão e execução em etapas separadas"
      caption={<>Referência: <a href="https://docs.robinhood.com/crypto/trading/" target="_blank" rel="noopener noreferrer">documentação da Robinhood Crypto Trading API</a>.</>}
    >
      <FlowLane label="Leitura e decisão" nodes={decide} />
      <Link2 label="Somente após a autorização, a execução começa" />
      <FlowLane label="Execução e retorno" nodes={execute} />
    </DocFigure>
  );
}
