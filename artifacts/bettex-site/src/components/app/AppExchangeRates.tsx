/** @jsxImportSource react */
import { useGetDemoDashboard, getGetDemoDashboardQueryKey } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { exchangeRates } from './exchange-rates';
import { visualDashboard } from '@/components/interface-demo/runtime';

export function AppExchangeRates({ className = '' }: { className?: string }) {
  const { x, n } = useX();
  const query = { isPending: false };
  const rates = exchangeRates(visualDashboard().balances);
  const brl = (value: number) => value.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: 4, maximumFractionDigits: 4,
  });
  const label = x('Cotações simuladas', 'Simulated rates', 'Cotizaciones simuladas');
  return <div className={`min-w-0 text-[#44546E] ${className}`} data-testid="app-exchange-rates" aria-label={label}>
    {rates ? <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold leading-5 tabular-nums">
      <span className="whitespace-nowrap" data-testid="rate-usd-brl">{x('1 USD =', '1 USD =', '1 USD =')} <strong className="text-[#1B2A41]">{brl(rates.usdBrl)}</strong></span>
      <span className="whitespace-nowrap" data-testid="rate-bettex">{x('1 BETTEX =', '1 BETTEX =', '1 BETTEX =')} <strong className="text-[#1B2A41]">{`US$ ${n(rates.bettexUsd, 4)}`}</strong>{' · '}<strong className="text-[#1B2A41]">{brl(rates.bettexBrl)}</strong></span>
    </div> : <p className="text-[11px] leading-5" role="status">
      {query.isPending ? x('Carregando cotações…', 'Loading rates…', 'Cargando cotizaciones…') : x('Cotações indisponíveis', 'Rates unavailable', 'Cotizaciones no disponibles')}
    </p>}
  </div>;
}
