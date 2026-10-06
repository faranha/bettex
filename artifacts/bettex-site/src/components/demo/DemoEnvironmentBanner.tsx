/** @jsxImportSource react */
import { useX } from './ui';
import { useGetDemoTestnet } from '@workspace/api-client-react';

/** LIVE requires verified public bytecode, operator binding and a recent confirmed checkpoint. */
export function DemoEnvironmentBanner() {
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
  return <section data-testid="banner-demo" aria-label={x('Ambiente de demonstração', 'Demo environment', 'Entorno de demostración')} className="border-b border-[#34445B] bg-[#1B2A41] px-3 py-3 text-center text-[#F5F1E8]">
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] font-extrabold tracking-wide sm:text-xs">
      <span data-testid="testnet-live-status" role="status" className={`inline-flex items-center gap-2 ${live ? 'text-[#83ECC2]' : 'text-[#FFD38B]'}`}>
        <span aria-hidden="true" className="relative inline-flex h-2.5 w-2.5 shrink-0">
          <span className={`absolute inset-0 rounded-full opacity-50 motion-safe:animate-ping ${live ? 'bg-[#83ECC2]' : 'bg-[#F4BB58]'}`} />
          <span className={`relative h-2.5 w-2.5 rounded-full ${live ? 'bg-[#83ECC2]' : 'bg-[#F4BB58]'}`} />
        </span>
        {label}
      </span>
      <span className="rounded-full border border-[#F5F1E8]/20 px-2.5 py-1">
        {x('ALFA · SEM DINHEIRO REAL', 'ALPHA · NO REAL MONEY', 'ALFA · SIN DINERO REAL')}
      </span>
    </div>
    <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-[#D6DEEB]">
      {live ? x('Arbitrum Sepolia · Registro de atividade na blockchain. Saldos e operações financeiras do demo são simulados.', 'Arbitrum Sepolia · Blockchain activity records. Demo balances and financial operations are simulated.', 'Arbitrum Sepolia · Registro de actividad en la blockchain. Los saldos y las operaciones financieras del demo son simulados.')
        : x('Teste o app com saldos e operações simulados. Não há movimentação de dinheiro real.', 'Try the app with simulated balances and operations. No real money is moved.', 'Prueba la app con saldos y operaciones simulados. No se mueve dinero real.')}
      {live && data?.explorerUrl && <a href={data.explorerUrl} target="_blank" rel="noopener noreferrer" data-testid="link-testnet-contract" className="ml-2 inline-block rounded font-bold text-[#83ECC2] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        {x('Ver contrato público', 'View public contract', 'Ver contrato público')}
      </a>}
    </p>
  </section>;
}
