import { DocFigure, FlowLane, Link2, type FlowNode } from './DocFlow';

const main: FlowNode[] = [
  { tag: '01', title: 'Carteira do titular', text: 'A carteira assina a transação com o token BETTEX. A chave privada permanece com o titular.', tone: 'ink' },
  { tag: '02', title: 'Acesso à rede', text: 'A transação assinada chega à Arbitrum por um ponto de acesso (RPC).', tone: 'blue' },
  { tag: '03', title: 'Ordenação e execução', text: 'A Arbitrum define a ordem das transações e as executa na segunda camada.', tone: 'blue' },
  { tag: '04', title: 'Lote comprimido', text: 'Muitas transações são agrupadas e comprimidas em um único lote.', tone: 'gold' },
  { tag: '05', title: 'Publicação no Ethereum', text: 'O Ethereum recebe os dados do lote; validadores verificam a sequência publicada.', tone: 'teal' },
];

const branch: FlowNode[] = [
  { tag: 'A', title: 'Eventos confirmados', text: 'Movimentações de BETTEX e USDC identificadas por ativo e confirmadas na rede.', tone: 'blue' },
  { tag: 'B', title: 'Leitura pelo backend', text: 'O backend apenas lê eventos públicos confirmados. Não recebe chaves privadas.', tone: 'ink' },
  { tag: 'C', title: 'Conciliação contábil', text: 'Os eventos são comparados com os registros separados de BETTEX e USDC. A conversão de fiat na entrada cabe ao on-ramp externo.', tone: 'gold' },
];

export function ArbitrumFlowDiagram() {
  return (
    <DocFigure
      id="documentacao-diagrama-arbitrum"
      label="Fluxo de uma transação"
      title="Da assinatura à verificação"
      caption={<>Referência: <a href="https://docs.arbitrum.io/how-arbitrum-works/deep-dives/sequencer-transaction-flow" target="_blank" rel="noopener noreferrer">fluxo de transações na documentação oficial da Arbitrum</a>.</>}
    >
      <FlowLane label="Caminho da transação" nodes={main} />
      <Link2 label="Observação separada: leitura de eventos já confirmados" />
      <FlowLane label="Ramo de observação do backend" nodes={branch} dashed />
    </DocFigure>
  );
}
