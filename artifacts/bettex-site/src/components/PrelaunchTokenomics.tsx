import { formatTokenCount, tokenomics } from '@/lib/tokenomics';

const allocations = [
  { label: 'Público · pré-lançamento', count: tokenomics.publicPrelaunchAllocation },
  { label: 'Investidores', count: tokenomics.investorAllocation },
  { label: 'Dono / criador', count: tokenomics.creatorAllocation },
] as const;

export function PrelaunchTokenomics() {
  return (
    <div className="rounded-[30px] bg-[#123a3b] p-6 text-[#f7f4e9] sm:p-9" aria-labelledby="prelaunch-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="mono text-[10px] font-bold uppercase tracking-[.16em] text-[#a4eacb]">Tokenomics · Pré-lançamento BETTEX</p>
        <span className="rounded-full border border-[#a4eacb]/40 px-4 py-2 text-xs font-bold text-[#a4eacb]">Compra sujeita à disponibilidade</span>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        <div>
          <strong className="display block text-[clamp(3.2rem,7vw,5.7rem)] font-extrabold leading-none tracking-[-.07em] text-[#a4eacb]">{formatTokenCount(tokenomics.publicPrelaunchAllocation)}</strong>
          <h2 id="prelaunch-title" className="display mt-4 max-w-[530px] text-3xl font-extrabold leading-tight tracking-[-.04em] sm:text-4xl">tokens destinados à compra no pré-lançamento.</h2>
          <p className="mt-5 max-w-[520px] text-sm leading-6 text-[#d0e5d9]">É a parcela de 50% destinada ao público, dentro da emissão total de {formatTokenCount(tokenomics.totalSupply)} tokens BETTEX. A compra depende de disponibilidade; este número não é um saldo atualizado em tempo real.</p>
        </div>
        <div className="rounded-[22px] border border-[#a4eacb]/20 bg-white/5 p-5 sm:p-6">
          <p className="mono text-[10px] font-bold uppercase tracking-[.13em] text-[#a4eacb]">Emissão total</p>
          <p className="display mt-2 text-3xl font-extrabold tracking-[-.05em]">{formatTokenCount(tokenomics.totalSupply)} <span className="text-base font-semibold tracking-normal text-[#c1dbce]">tokens BETTEX</span></p>
          <dl className="mt-5 divide-y divide-[#a4eacb]/20 border-t border-[#a4eacb]/20">
            {allocations.map(({ label, count }) => (
              <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-3 text-sm">
                <dt className="text-[#c1dbce]"><strong className="text-[#f7f4e9]">{count / tokenomics.totalSupply * 100}%</strong> · {label}</dt>
                <dd className="font-bold tabular-nums">{formatTokenCount(count)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-[#c1dbce]">Preço por token: <strong className="text-[#f7f4e9]">R$ {tokenomics.priceBRL}</strong></p>
          <p className="mt-2 text-xs leading-5 text-[#c1dbce]">Essa divisão é dos tokens entre titulares, não do investimento entre os quatro agentes BETTEX.</p>
        </div>
      </div>

      <div className="mt-9 border-t border-[#a4eacb]/25 pt-7">
        <h3 className="display text-xl font-extrabold tracking-[-.03em] sm:text-2xl">Do pré-lançamento à negociação</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] bg-white/5 p-5"><span className="mono text-xs text-[#a4eacb]">01 / COMPRA</span><h4 className="display mt-3 text-lg font-extrabold">Nesta fase</h4><p className="mt-2 text-xs leading-5 text-[#c1dbce]">A parcela pública é destinada à compra no pré-lançamento, enquanto houver disponibilidade.</p></div>
          <div className="rounded-[20px] bg-white/5 p-5"><span className="mono text-xs text-[#a4eacb]">02 / TITULARIDADE</span><h4 className="display mt-3 text-lg font-extrabold">O token é seu</h4><p className="mt-2 text-xs leading-5 text-[#c1dbce]">Quem adquire o token perpétuo é seu titular e decide se prefere mantê-lo ou vendê-lo.</p></div>
          <div className="rounded-[20px] bg-white/5 p-5"><span className="mono text-xs text-[#a4eacb]">03 / VENDA FUTURA</span><h4 className="display mt-3 text-lg font-extrabold">Corretoras parceiras</h4><p className="mt-2 text-xs leading-5 text-[#c1dbce]">Quando a negociação estiver disponível nas corretoras parceiras, o titular poderá vender se desejar. Preço e liquidez dependerão do mercado.</p></div>
        </div>
        <p className="mt-5 text-xs leading-5 text-[#c1dbce]">O teste abaixo não compra tokens nem envia ordens de venda a corretoras.</p>
      </div>
    </div>
  );
}