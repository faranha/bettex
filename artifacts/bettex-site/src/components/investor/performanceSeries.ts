import { historyForPeriod, simulatedDate, type AgentName, type HistoryPeriod } from './simulatedHistory';

export type PerformancePeriod = HistoryPeriod;
export type PerformanceSubject = AgentName | 'COLETIVO';
export type PerformancePoint = { label: string; resultCents: number };
const agentNames: AgentName[] = ['PREDIX', 'TRADEX', 'SPORTIX', 'BETTIX'];

const fourHourLabels = ['24–20h', '20–16h', '16–12h', '12–8h', '8–4h', '4–0h'];
const fiveDayLabels = ['29–25d', '24–20d', '19–15d', '14–10d', '9–5d', '4–0d'];

export function performanceSeries(agent: PerformanceSubject, period: PerformancePeriod): PerformancePoint[] {
  if (agent === 'COLETIVO') {
    const individual = agentNames.map((name) => performanceSeries(name, period));
    return individual[0].map((point, index) => ({
      label: point.label,
      resultCents: individual.reduce((sum, series) => sum + series[index].resultCents, 0),
    }));
  }

  const transactions = historyForPeriod(agent, period);
  if (period === '24 horas') {
    const values = Array(fourHourLabels.length).fill(0) as number[];
    transactions.forEach((entry) => {
      const bucket = Math.min(fourHourLabels.length - 1, Math.floor((24 - entry.hoursAgo) / 4));
      values[bucket] += entry.resultCents;
    });
    return fourHourLabels.map((label, index) => ({ label, resultCents: values[index] }));
  }

  if (period === '7 dias') {
    return Array.from({ length: 7 }, (_, index) => {
      const daysAgo = 6 - index;
      const resultCents = transactions
        .filter((entry) => entry.daysAgo === daysAgo)
        .reduce((sum, entry) => sum + entry.resultCents, 0);
      return { label: simulatedDate(daysAgo).label.slice(0, 5), resultCents };
    });
  }

  const values = Array(fiveDayLabels.length).fill(0) as number[];
  transactions.forEach((entry) => {
    const bucket = Math.min(fiveDayLabels.length - 1, Math.floor((29 - entry.daysAgo) / 5));
    values[bucket] += entry.resultCents;
  });
  return fiveDayLabels.map((label, index) => ({ label, resultCents: values[index] }));
}

export function performanceTotal(agent: PerformanceSubject, period: PerformancePeriod): number {
  return performanceSeries(agent, period).reduce((sum, point) => sum + point.resultCents, 0) / 100;
}