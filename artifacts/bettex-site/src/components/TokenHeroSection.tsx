import { ArrowDown } from 'lucide-react';
import { formatTokenCount, tokenomics } from '@/lib/tokenomics';

const agents = [
  { name: 'PREDIX', role: 'ANALISA PREVISÕES', position: 'left-[3%] top-[8%] sm:left-[2%] sm:top-[10%]' },
  { name: 'TRADEX', role: 'AÇÕES E CRIPTO', position: 'right-[1%] top-[20%] sm:right-[0%] sm:top-[19%]' },
  { name: 'SPORTIX', role: 'ANALISA ESPORTES', position: 'left-[0%] bottom-[20%] sm:left-[0%] sm:bottom-[19%]' },
  { name: 'BETTIX', role: 'ATUA EM CASSINOS', position: 'right-[2%] bottom-[6%] sm:right-[2%] sm:bottom-[9%]' },
] as const;

/**
 * A separate opening chapter for the token story, intentionally placed
 * between the investor narrative and the detailed offer / local simulator.
 */
export function TokenHeroSection() {
  return (
    <section
      id="token"
      aria-labelledby="token-hero-title"
      className="relative isolate scroll-mt-[72px] overflow-hidden border-t-[16px] border-[#f7f4e9] bg-[#1b504a] text-[#f7f4e9]"
    >
      {/* Architectural lines rather than a second card-like panel. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 78% 42%, rgba(145,232,197,.13), transparent 33%), linear-gradient(115deg, transparent 0%, transparent 52%, rgba(166,237,204,.06) 52.08%, transparent 52.16%)',
        }}
      />
      <div className="pointer-events-none absolute -left-[18vw] bottom-[-29vw] h-[62vw] w-[62vw] rounded-full border border-[#a4eacb]/[.08]" aria-hidden="true" />

      <div className="page-wrap relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-[#b6e6d0]/25 py-6 sm:py-8">
          <p className="mono flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.17em] text-[#a4eacb]">
            <span className="inline-block h-2 w-2 rotate-45 border border-[#a4eacb] bg-[#a4eacb]/30" aria-hidden="true" />
            Um novo capítulo
          </p>
          <p className="mono text-[10px] uppercase tracking-[.13em] text-[#c3ddcf]">BETTEX / O TOKEN</p>
        </div>

        <div className="grid items-center gap-10 pb-14 pt-16 sm:pb-20 sm:pt-20 lg:min-h-[690px] lg:grid-cols-[1.12fr_.88fr] lg:gap-3 lg:pb-20 lg:pt-16">
          <div className="relative z-20">
            <p className="mono mb-7 text-[11px] font-bold uppercase tracking-[.2em] text-[#a4eacb] sm:mb-9">
              Quatro agentes. Uma BETTEX. <span className="ml-2 text-[#b9dccb]/60">01 / 04</span>
            </p>
            <h2
              id="token-hero-title"
              className="display max-w-[790px] text-[clamp(3.5rem,6vw,6.5rem)] font-extrabold leading-[.96] tracking-[-.075em]"
            >
              Uma IA.<br />
              Quatro frentes.<br />
              <span className="text-[#a4eacb]">Um token.</span>
            </h2>
            <p className="mt-8 max-w-[560px] text-base leading-[1.75] text-[#d1e5d9] sm:mt-10 sm:text-lg">
              O token BETTEX representa sua participação no projeto que reúne os quatro agentes de IA. <strong className="font-semibold text-[#f7f4e9]">Quatro frentes de atuação, uma tecnologia central.</strong>
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
              <a
                href="#comprar"
                data-testid="link-token-simulator"
                className="tap inline-flex min-h-14 items-center justify-center gap-4 rounded-full bg-[#a4eacb] px-7 py-3.5 text-sm font-bold text-[#103739] hover:bg-[#c8f5dd]"
              >
                Explorar a simulação <ArrowDown className="h-[18px] w-[18px]" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="relative mx-auto h-[360px] w-full max-w-[510px] sm:h-[480px] lg:h-[540px]" aria-label="Diagrama do token BETTEX conectado aos quatro agentes de IA" role="img">
            <div className="absolute inset-[5%] rounded-full border border-[#a4eacb]/20" aria-hidden="true" />
            <div className="absolute inset-[14%] rounded-full border border-dashed border-[#a4eacb]/30" aria-hidden="true" />
            <div className="absolute inset-[25%] rounded-full border border-[#a4eacb]/20" aria-hidden="true" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 500" fill="none" aria-hidden="true">
              <path d="M250 250 100 75M250 250 405 135M250 250 94 377M250 250 403 425" stroke="#A4EACB" strokeOpacity=".32" strokeWidth="1.5" />
              <circle cx="250" cy="250" r="184" stroke="#A4EACB" strokeOpacity=".13" strokeWidth="24" />
              <path d="M98 146A184 184 0 0 1 177 81" stroke="#A4EACB" strokeWidth="4" strokeLinecap="round" />
              <path d="M333 86A184 184 0 0 1 401 146" stroke="#A4EACB" strokeWidth="4" strokeLinecap="round" />
              <path d="M99 353A184 184 0 0 0 166 411" stroke="#EBC59B" strokeOpacity=".75" strokeWidth="4" strokeLinecap="round" />
              <path d="M332 415A184 184 0 0 0 402 354" stroke="#EBC59B" strokeOpacity=".75" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div className="absolute left-1/2 top-1/2 grid h-[43%] aspect-square -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#d5f7e5] bg-[#a4eacb] p-3 text-[#103739] shadow-[0_24px_70px_rgba(3,25,24,.28)] sm:h-[41%]">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-[#103739]/30">
                <span className="mono text-[7px] font-bold uppercase tracking-[.15em] sm:text-[9px]">Token</span>
                <span className="display mt-1 text-[clamp(1.2rem,3.7vw,2.4rem)] font-extrabold tracking-[-.075em]">BETTEX<span className="text-[#168367]">.</span></span>
                <span className="mt-1 h-px w-8 bg-[#103739]/35 sm:w-12" />
                <span className="mono mt-2 text-[7px] uppercase tracking-[.08em] sm:text-[9px]">1 projeto</span>
              </div>
            </div>
            {agents.map((agent) => (
              <div
                key={agent.name}
                className={`absolute ${agent.position} min-w-[104px] rounded-xl border border-[#b8efd3]/50 bg-[#1c544d] px-3 py-2.5 text-[#f7f4e9] shadow-[0_12px_28px_rgba(2,27,25,.18)] sm:min-w-[134px] sm:rounded-2xl sm:px-4 sm:py-3`}
                aria-hidden="true"
              >
                <span className="display block text-sm font-extrabold tracking-[-.045em] sm:text-lg">{agent.name}</span>
                <span className="mono mt-1 block text-[7px] font-bold tracking-[.015em] text-[#a4eacb] sm:text-[8px]">{agent.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-7 border-t border-[#b6e6d0]/25 py-8 sm:grid-cols-[1fr_1fr] sm:gap-12 sm:py-10">
          <div className="flex gap-4">
            <span className="mono pt-0.5 text-[11px] font-bold text-[#a4eacb]">01</span>
            <p className="max-w-[490px] text-sm leading-6 text-[#d1e5d9]">
              <strong className="text-[#f7f4e9]">Pré-lançamento.</strong> {formatTokenCount(tokenomics.publicPrelaunchAllocation)} dos {formatTokenCount(tokenomics.totalSupply)} tokens são destinados ao público, a R$ {tokenomics.priceBRL} por token, sujeitos à disponibilidade. Esta é a alocação, não um saldo em tempo real.
            </p>
          </div>
          <div className="flex gap-4">
            <span className="mono pt-0.5 text-[11px] font-bold text-[#a4eacb]">02</span>
            <p className="max-w-[490px] text-sm leading-6 text-[#d1e5d9]">
              <strong className="text-[#f7f4e9]">Resultado, não promessa.</strong> Tokens ativados participam da distribuição diária somente quando as operações geram lucro. O projeto envolve alto risco; ganhos não são garantidos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}