import { ArrowDown } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n';
import './HeroBenefit.css';
import './HomeHeroContent.css';

export function HomeHeroContent({ measuring = false }: { measuring?: boolean }) {
  const Heading = measuring ? 'div' : 'h1';
  return <div className="hero-intro-content page-wrap relative grid items-center pb-2 pt-8 sm:pt-16 xl:min-h-[680px] xl:py-16">
    <div className="hero-intro-copy entrance relative z-10">
      <Heading className="hero-title max-w-[690px] text-[clamp(2.3rem,5.2vw,4.4rem)] font-extrabold">
        <span className="block">Chega de apostar.</span>{' '}
        <span className="block text-[#F2B632]">Comece a investir.</span>
      </Heading>
      <h2 className="mt-5 max-w-[550px] text-[clamp(1.3rem,2.3vw,1.7rem)] font-bold leading-[1.25] text-[#F4F1E8]">Com BETTEX, você é dono do token e da IA junto à comunidade.</h2>
      <p className="mt-4 max-w-[520px] text-[17px] font-bold leading-[1.5] text-[#F2B632] sm:text-lg">Ganhe até 1% por dia de lucro.</p>
      <a href="#participacao" data-testid="link-hero-projeto" className="tap mt-8 inline-flex min-h-[68px] w-full max-w-[320px] items-center justify-between gap-5 rounded-full border border-[#7390ff]/40 bg-[#2B59FF] py-3 pl-7 pr-3 text-lg font-bold text-white shadow-[0_10px_30px_rgba(43,89,255,0.25)] transition-colors hover:bg-[#1E44D6] focus-visible:outline-[#F2B632]">
        <span>Quero ser dono da IA</span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20" aria-hidden="true"><ArrowDown size={22} strokeWidth={2.2} /></span>
      </a>
    </div>
  </div>;
}

// Measure the actual localized Home layout, without loading its images or
// changing its visible height. ResizeObserver also catches font/viewport changes.
export function HomeHeroHeightReference({ onHeight }: { onHeight: (height: number) => void }) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => setMounted(true), []);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => onHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [mounted, locale, onHeight]);
  if (!mounted) return null;
  return <div ref={ref} className="home-page home-hero-height-reference" aria-hidden="true" inert>
    <div className="hero-intro-stage relative">
      <HomeHeroContent measuring />
      <div className="hero-benefit" />
    </div>
  </div>;
}
