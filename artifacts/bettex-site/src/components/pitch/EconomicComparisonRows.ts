import type { EconomicComparisonRow } from './EconomicComparison';

export const economicComparisonRows: EconomicComparisonRow[] = [
  {
    criterion: 'Fonte do resultado',
    bet: 'Resultado de cada aposta escolhida pelo usuário.',
    priceToken: 'Variação do preço do token e possibilidade de revenda.',
    bettex: 'Lucro elegível das estratégias da tesouraria; o token também pode ser revendido.',
  },
  {
    criterion: 'Papel do usuário',
    bet: 'Escolher e acompanhar cada aposta.',
    priceToken: 'Decidir quando comprar, manter ou vender o token.',
    bettex: 'Participar pelo staking e acompanhar a operação, sem escolher cada estratégia.',
  },
  {
    criterion: 'Direito econômico',
    bet: 'Pagamento condicionado ao resultado da aposta, conforme as regras da plataforma.',
    priceToken: 'Ganho ou perda na revenda; participação em lucro não é pressuposta nesse modelo.',
    bettex: 'Parcela do pool global de stakers, rateada pelo peso elegível da rodada. Exige lucro elegível, reserva e liquidez; não é retorno fixo.',
  },
  {
    criterion: 'Saída e elegibilidade',
    bet: 'Resultado e liquidação seguem as regras da aposta.',
    priceToken: 'Venda depende de comprador e liquidez do mercado.',
    bettex: 'Qualquer saída de BETTEX, mesmo parcial, cancela créditos ainda não pagos e zera todo o peso anterior da rodada. Rodadas encerradas não acumulam direitos.',
  },
  {
    criterion: 'Custos',
    bet: 'Custos podem estar nas odds e em tarifas da plataforma.',
    priceToken: 'Custos de negociação, spread e rede, conforme mercado e plataforma.',
    bettex: 'Tarifa fixa de serviço informada antes da operação, em USDC, sem taxa de performance.',
  },
  {
    criterion: 'Controle e registros',
    bet: 'Histórico e regras disponíveis na plataforma escolhida.',
    priceToken: 'Regras e registros dependem do token, do mercado e da plataforma.',
    bettex: 'Tesouraria separada do caixa operacional, direitos e créditos em contas distintas, registros conciliáveis e condições antes de usar dinheiro real.',
  },
  {
    criterion: 'Riscos',
    bet: 'Perda do valor apostado.',
    priceToken: 'Perda de valor e falta de liquidez para revenda.',
    bettex: 'Perda de capital, risco de preço e liquidez. Sem lucro elegível ou condições de pagamento, não há distribuição.',
  },
];