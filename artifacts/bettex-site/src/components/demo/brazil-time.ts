/** Display timestamps in São Paulo; UTC instants and countdown arithmetic stay unchanged. */
export const BRAZIL_TIME_ZONE = 'America/Sao_Paulo';

export function formatBrazilDateTime(
  value: string | number,
  locale = 'pt-BR',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' },
) {
  return new Date(value).toLocaleString(locale, { ...options, timeZone: BRAZIL_TIME_ZONE, hourCycle: 'h23' });
}

export function formatBrazilTime(value: string | number, locale = 'pt-BR') {
  return formatBrazilDateTime(value, locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}