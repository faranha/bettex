export type ArchitectureFigureNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

type Brand = 'arbitrum' | 'allora' | 'robinhood';
interface IntegrationNote {
  brand: Brand;
  placement: string;
  description: string;
}

const brandNames: Record<Brand, string> = {
  arbitrum: 'Arbitrum One',
  allora: 'Allora',
  robinhood: 'Robinhood',
};

const notes: Record<ArchitectureFigureNumber, IntegrationNote[]> = {
  '1': [
    { brand: 'arbitrum', placement: 'Etapas 2 e 3 · Carteiras e compra', description: 'Rede de referência do token BETTEX e das transações da carteira. A criação da conta fica no aplicativo.' },
  ],
  '2': [
    { brand: 'arbitrum', placement: 'Venda pública · Compra e liquidação', description: 'Rede de referência para transferências de BETTEX e USDC compatível, com confirmação da compra da venda pública e conciliação do recebimento pela tesouraria. Revendas entre titulares têm o vendedor como destinatário do pagamento.' },
  ],
  '3': [
    { brand: 'arbitrum', placement: 'Etapa 1 · Saldo BETTEX da carteira', description: 'O backend acompanha os tokens confirmados na rede. A elegibilidade e a permanência no staking são verificadas pelo aplicativo.' },
  ],
  '4': [
    { brand: 'arbitrum', placement: 'Etapas 2 e 3 · Contrato e autorizações', description: 'Rede de referência para o smart contract BETTEX. O contrato do projeto aplica as regras de acesso ao capital; a análise da IA é uma camada separada.' },
  ],
  '5': [
    { brand: 'allora', placement: 'Etapa 2 · Análise da IA', description: 'Inferências opcionais ajudam a avaliar oportunidades. Allora não executa ordens nem decide o split.' },
    { brand: 'robinhood', placement: 'Etapa 2 · Operações de mercado', description: 'Possível conector de dados e ordens de cripto na conta operacional, após aprovação de risco. Não paga o staking.' },
    { brand: 'arbitrum', placement: 'Etapa 3 · Movimentações em USDC', description: 'Referências on-chain de transferências compatíveis. Se reserva ou liquidez falhar, a rodada não paga e o lucro fica na tesouraria, sem liberação futura. Cada pagamento pertence somente à sua própria rodada.' },
  ],
  '6': [
    { brand: 'arbitrum', placement: 'Recebimento e saque em USDC', description: 'O livro contábil registra o direito e a obrigação como distribuição pendente. A transferência on-chain confirmada e conciliada reconhece USDC recebido na carteira do titular e liquida a obrigação. O saque posterior movimenta esse saldo, sem novo pagamento da distribuição.' },
  ],
  '7': [
    { brand: 'allora', placement: 'Etapa 1 · Agentes de IA', description: 'Consulta opcional de inferências para a análise. Não controla a carteira nem executa ordens.' },
    { brand: 'robinhood', placement: 'Etapas 2 e 3 · Conexão e execução', description: 'Possível API de dados e trading de cripto. Ordens exigem permissões e aprovação independente de risco.' },
    { brand: 'arbitrum', placement: 'Base das carteiras e contratos', description: 'Infraestrutura de referência da BETTEX, separada das APIs de mercado. As ordens da Robinhood não são transações da Arbitrum.' },
  ],
  '8': [
    { brand: 'allora', placement: 'Etapas 1 e 2 · Coleta e comparação', description: 'Inferências opcionais entram como sinais na avaliação das oportunidades; a escolha continua com a IA BETTEX.' },
    { brand: 'robinhood', placement: 'Etapas 1 e 3 · Dados e investimento', description: 'Possível fonte de dados e execução de ordens de cripto para a oportunidade escolhida, após autorização.' },
    { brand: 'arbitrum', placement: 'Etapa 4 · Referências on-chain', description: 'Transações na rede têm referências verificáveis. Decisões e ordens externas também são registradas pela BETTEX, sem pressupor publicação on-chain.' },
  ],
};

export function ArchitectureIntegrations({ figure }: { figure: ArchitectureFigureNumber }) {
  return (
    <footer className="ba-integrations" data-testid={`figure-${figure}-integrations`} aria-label={`Onde entram as tecnologias no desenho ${figure}`}>
      <p className="ba-integrations__title">Onde entram neste desenho</p>
      <ul className="ba-integrations__list">
        {notes[figure].map(({ brand, placement, description }) => (
          <li key={brand} className={`ba-integrations__item ba-integrations__item--${brand}`}>
            <strong className="ba-integrations__name"><span aria-hidden="true" />{brandNames[brand]}</strong>
            <span className="ba-integrations__placement">{placement}</span>
            <p>{description}</p>
          </li>
        ))}
      </ul>
    </footer>
  );
}