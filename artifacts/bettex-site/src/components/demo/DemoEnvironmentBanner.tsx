/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { useX } from './ui';
import { useGetDemoTestnet } from '@workspace/api-client-react';
import { ExternalLink } from 'lucide-react';

/** LIVE requires verified public bytecode, operator binding and a recent confirmed checkpoint. */
function OperationalTestnetBanner({ actions }: { actions?: ReactNode } = {}) {
  const { x } = useX();
  const query = useGetDemoTestnet({ query: { refetchInterval: 30_000, staleTime: 10_000, retry: 1 } });
  const data = query.data;
  const live = !query.isError && data?.status === 'live';
  const label = live
    ? x('LIVE · TESTNET PÚBLICA', 'LIVE · PUBLIC TESTNET', 'LIVE · TESTNET PÚBLICA')
    : query.isLoading
      ? x('CONECTANDO À TESTNET', 'CONNECTING TO TESTNET', 'CONECTANDO A LA TESTNET')
      : data?.status === 'preparing'
        ? x('TESTNET EM PREPARAÇÃO', 'TESTNET IN PREPARATION', 'TESTNET EN PREPARACIÓN')
        : data?.status === 'validating'
          ? x('VALIDANDO A TESTNET', 'VERIFYING TESTNET', 'VERIFICANDO LA TESTNET')
          : x('CONEXÃO COM TESTNET INDISPONÍVEL', 'TESTNET CONNECTION UNAVAILABLE', 'CONEXIÓN CON TESTNET NO DISPONIBLE');
  return <section data-testid="banner-demo" aria-label={x('Ambiente de demonstração', 'Demo environment', 'Entorno de demostración')} className="border-b border-[#34445B] bg-[#1B2A41] px-3 py-1 text-[#F5F1E8]">
    <div className="mx-auto flex w-full min-w-0 max-w-5xl items-center gap-2 whitespace-nowrap text-[11px]">
      <span data-testid="testnet-live-status" role="status" title={label} className={`inline-flex min-w-0 items-center gap-1.5 text-[10px] font-extrabold ${live ? 'text-[#83ECC2]' : 'text-[#FFD38B]'}`}>
        <span aria-hidden="true" className="relative inline-flex h-2.5 w-2.5 shrink-0">
          <span className={`absolute inset-0 rounded-full opacity-50 motion-safe:animate-ping ${live ? 'bg-[#83ECC2]' : 'bg-[#F4BB58]'}`} />
          <span className={`relative h-2.5 w-2.5 rounded-full ${live ? 'bg-[#83ECC2]' : 'bg-[#F4BB58]'}`} />
        </span>
        <span className="hidden truncate sm:inline">{label}</span>
        <span className="truncate sm:hidden">{live ? x('LIVE · TESTNET', 'LIVE · TESTNET', 'LIVE · TESTNET') : x('TESTNET · OFFLINE', 'TESTNET · OFFLINE', 'TESTNET · OFFLINE')}</span>
      </span>
      <span className="shrink-0 rounded-full border border-[#F5F1E8]/20 px-2 py-1 text-[10px] font-extrabold">
        <span className="hidden sm:inline">{x('ALFA · SEM DINHEIRO REAL', 'ALPHA · NO REAL MONEY', 'ALFA · SIN DINERO REAL')}</span>
        <span className="sm:hidden">{x('SEM DINHEIRO REAL', 'NO REAL MONEY', 'SIN DINERO REAL')}</span>
      </span>
    <p className="sr-only lg:not-sr-only lg:min-w-0 lg:flex-1 lg:truncate lg:text-[#D6DEEB]" title={x('Arbitrum Sepolia · Saldos e operações simulados.', 'Arbitrum Sepolia · Simulated balances and operations.', 'Arbitrum Sepolia · Saldos y operaciones simulados.')}>
      {live && 'Arbitrum Sepolia · '}{x('Saldos e operações simulados.', 'Simulated balances and operations.', 'Saldos y operaciones simulados.')}
    </p>
      {live && data?.explorerUrl && <a href={data.explorerUrl} target="_blank" rel="noopener noreferrer" data-testid="link-testnet-contract" title={x('Ver contrato público', 'View public contract', 'Ver contrato público')} className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded font-bold text-[#83ECC2] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        <span className="sr-only sm:not-sr-only">{x('Ver contrato público', 'View public contract', 'Ver contrato público')}</span><ExternalLink className="h-4 w-4 sm:hidden" aria-hidden="true" />
      </a>}
    {actions && <div className="ml-auto shrink-0">{actions}</div>}
    </div>
  </section>;
}
export function DemoEnvironmentBanner({ actions }: { actions?: ReactNode } = {}) {
  const { x } = useX();
  return <section data-testid="banner-demo" className="border-b border-[#34445B] bg-[#1B2A41] px-3 py-2 text-[#F5F1E8]">
    <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 text-[11px]">
      <span className="font-extrabold text-[#83ECC2]">{x('DEMO · INTERFACE VISUAL', 'DEMO · VISUAL INTERFACE', 'DEMO · INTERFAZ VISUAL')}</span>
      <span className="rounded-full border border-white/20 px-2 py-1 font-bold">{x('SEM DINHEIRO REAL', 'NO REAL MONEY', 'SIN DINERO REAL')}</span>
      <p className="text-[#D6DEEB]">{x('Comunidade aberta · Token comunitário · Sem salários ou taxas de serviço.', 'Open community · Community token · No salaries or service fees.', 'Comunidad abierta · Token comunitario · Sin salarios ni comisiones de servicio.')}</p>
      <p className="text-[#D6DEEB]">{x('Dados ilustrativos · Software em desenvolvimento.', 'Illustrative data · Software in development.', 'Datos ilustrativos · Software en desarrollo.')}</p>{actions}
    </div>
  </section>;
}
