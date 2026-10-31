import { DocTerms } from '../DocImage';
import { type FlowNode } from './DocFlow';

const terms = (n: FlowNode[]): [string, string][] => n.map((x) => [x.title, x.text]);

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
    <div id="documentacao-diagrama-arbitrum" data-testid="documentacao-diagrama-arbitrum">
      <DocTerms label="Fluxo de uma transação: da assinatura à verificação" items={terms(main)} />
      <DocTerms label="Observação separada: leitura de eventos já confirmados" items={terms(branch)} />
      <div className="whitepaper__prose"><p>Referência: <a href="https://docs.arbitrum.io/how-arbitrum-works/deep-dives/sequencer-transaction-flow" target="_blank" rel="noopener noreferrer">fluxo de transações na documentação oficial da Arbitrum</a>.</p></div>
    </div>
  );
}
