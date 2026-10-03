import { ArrowLeft, ArrowRight } from 'lucide-react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function DemoPage() {
  return <main className="hero-bg relative flex min-h-[calc(100dvh-var(--site-header-h))] items-center overflow-hidden text-[#F4F1E8]">
    <div className="pitch-grid absolute inset-0" aria-hidden="true" />
    <div className="page-wrap relative py-16">
      <span className="mono text-[11px] font-bold uppercase tracking-[.2em] text-[#F2B632]">Demo</span>
      <h1 className="display mt-5 text-[clamp(3rem,10vw,7rem)] font-extrabold leading-[.95] tracking-[-.07em]">Em breve.</h1>
      <p className="mt-6 max-w-[520px] text-lg leading-8 text-[#c5d2f1]">A demonstração ainda está em preparação. Por enquanto, leia o pitch e a documentação do projeto.</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <a href={`${BASE}/pitch`} className="tap inline-flex min-h-12 items-center gap-2 rounded-full bg-[#2B59FF] px-6 py-3 text-sm font-bold text-white hover:bg-[#1E44D6]"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Voltar ao pitch</a>
        <a href={`${BASE}/documentacao`} className="tap inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-[#F4F1E8]/70 px-6 py-3 text-sm font-bold hover:bg-[#F4F1E8] hover:text-[#070B1F]">Ler a documentação<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
        <a href={`${BASE}/`} className="tap inline-flex min-h-12 items-center px-4 py-3 text-sm font-semibold text-[#c5d2f1] underline underline-offset-4">Página principal</a>
      </div>
    </div>
  </main>;
}
export default DemoPage;
