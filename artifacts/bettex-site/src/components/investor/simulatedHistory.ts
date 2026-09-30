export type AgentName = 'PREDIX' | 'TRADEX' | 'SPORTIX' | 'BETTIX';
export type HistoryPeriod = '24 horas' | '7 dias' | '30 dias';

export type SimulatedTransaction = {
  id: string;
  daysAgo: number;
  hoursAgo: number;
  movement: string;
  resultCents: number;
};

// Illustrative entries only: no orders were placed and no platform supplied these results.
// The same fictional transactions feed the history, chart series, and period totals.
export const simulatedHistory: Record<AgentName, SimulatedTransaction[]> = {
  PREDIX: [
    { id: 'today-close', daysAgo: 0, hoursAgo: 22, movement: 'Cenário encerrado', resultCents: 14500 },
    { id: 'today-adjustment', daysAgo: 0, hoursAgo: 2, movement: 'Ajuste de previsão', resultCents: 9500 },
    { id: 'week-adjustment', daysAgo: 1, hoursAgo: 8, movement: 'Ajuste de previsão', resultCents: 13380 },
    { id: 'week-close', daysAgo: 3, hoursAgo: 15, movement: 'Cenário encerrado', resultCents: 31050 },
    { id: 'month-27', daysAgo: 27, hoursAgo: 11, movement: 'Posição encerrada', resultCents: 22000 },
    { id: 'month-22', daysAgo: 22, hoursAgo: 7, movement: 'Ajuste de previsão', resultCents: 18500 },
    { id: 'month-18', daysAgo: 18, hoursAgo: 12, movement: 'Cenário encerrado', resultCents: 31000 },
    { id: 'month-14', daysAgo: 14, hoursAgo: 9, movement: 'Posição encerrada', resultCents: 27510 },
    { id: 'month-10', daysAgo: 10, hoursAgo: 4, movement: 'Ajuste de previsão', resultCents: 24000 },
    { id: 'month-8', daysAgo: 8, hoursAgo: 16, movement: 'Cenário encerrado', resultCents: 30000 },
  ],
  TRADEX: [
    { id: 'today-close', daysAgo: 0, hoursAgo: 21, movement: 'Posição encerrada', resultCents: 8200 },
    { id: 'today-adjustment', daysAgo: 0, hoursAgo: 3, movement: 'Ajuste de cripto', resultCents: 6300 },
    { id: 'week-adjustment', daysAgo: 1, hoursAgo: 10, movement: 'Ajuste de cripto', resultCents: 28010 },
    { id: 'week-close', daysAgo: 3, hoursAgo: 17, movement: 'Ajuste de posição', resultCents: -4560 },
    { id: 'month-27', daysAgo: 27, hoursAgo: 11, movement: 'Posição encerrada', resultCents: 15000 },
    { id: 'month-22', daysAgo: 22, hoursAgo: 7, movement: 'Ajuste de cripto', resultCents: 12000 },
    { id: 'month-18', daysAgo: 18, hoursAgo: 12, movement: 'Posição encerrada', resultCents: 18000 },
    { id: 'month-14', daysAgo: 14, hoursAgo: 9, movement: 'Ajuste de posição', resultCents: 15460 },
    { id: 'month-10', daysAgo: 10, hoursAgo: 4, movement: 'Posição encerrada', resultCents: 14000 },
    { id: 'month-8', daysAgo: 8, hoursAgo: 16, movement: 'Ajuste de cripto', resultCents: 16000 },
  ],
  SPORTIX: [
    { id: 'today-close', daysAgo: 0, hoursAgo: 22, movement: 'Evento esportivo', resultCents: -7000 },
    { id: 'today-adjustment', daysAgo: 0, hoursAgo: 2, movement: 'Ajuste de posição', resultCents: -5000 },
    { id: 'week-adjustment', daysAgo: 1, hoursAgo: 8, movement: 'Evento esportivo', resultCents: 9950 },
    { id: 'week-close', daysAgo: 3, hoursAgo: 15, movement: 'Ajuste de posição', resultCents: -9230 },
    { id: 'month-27', daysAgo: 27, hoursAgo: 11, movement: 'Evento esportivo', resultCents: 4500 },
    { id: 'month-22', daysAgo: 22, hoursAgo: 7, movement: 'Ajuste de posição', resultCents: 3200 },
    { id: 'month-18', daysAgo: 18, hoursAgo: 12, movement: 'Evento esportivo', resultCents: 2800 },
    { id: 'month-14', daysAgo: 14, hoursAgo: 9, movement: 'Ajuste de posição', resultCents: 4240 },
    { id: 'month-10', daysAgo: 10, hoursAgo: 4, movement: 'Evento esportivo', resultCents: 2000 },
    { id: 'month-8', daysAgo: 8, hoursAgo: 16, movement: 'Evento esportivo', resultCents: 3000 },
  ],
  BETTIX: [
    { id: 'today-close', daysAgo: 0, hoursAgo: 21, movement: 'Sessão encerrada', resultCents: 7500 },
    { id: 'today-adjustment', daysAgo: 0, hoursAgo: 3, movement: 'Ajuste de sessão', resultCents: 5040 },
    { id: 'week-adjustment', daysAgo: 1, hoursAgo: 10, movement: 'Sessão encerrada', resultCents: 2720 },
    { id: 'week-close', daysAgo: 3, hoursAgo: 17, movement: 'Ajuste de sessão', resultCents: 8800 },
    { id: 'month-27', daysAgo: 27, hoursAgo: 11, movement: 'Sessão encerrada', resultCents: -6000 },
    { id: 'month-22', daysAgo: 22, hoursAgo: 7, movement: 'Ajuste de sessão', resultCents: -5200 },
    { id: 'month-18', daysAgo: 18, hoursAgo: 12, movement: 'Sessão encerrada', resultCents: -7400 },
    { id: 'month-14', daysAgo: 14, hoursAgo: 9, movement: 'Ajuste de sessão', resultCents: -6100 },
    { id: 'month-10', daysAgo: 10, hoursAgo: 4, movement: 'Sessão encerrada', resultCents: -5000 },
    { id: 'month-8', daysAgo: 8, hoursAgo: 16, movement: 'Sessão encerrada', resultCents: -7000 },
  ],
};

export const historyForPeriod = (agent: AgentName, period: HistoryPeriod) => {
  const days = period === '24 horas' ? 1 : period === '7 dias' ? 7 : 30;
  return simulatedHistory[agent].filter((entry) => entry.daysAgo >= 0 && entry.daysAgo < days);
};

export const sevenDayHistory = (agent: AgentName) => historyForPeriod(agent, '7 dias');

export const sevenDayResult = (agent: AgentName) =>
  sevenDayHistory(agent).reduce((total, entry) => total + entry.resultCents, 0) / 100;

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function simulatedDate(daysAgo: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);

  return {
    label: dateFormatter.format(date),
    dateTime: [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-'),
  };
}