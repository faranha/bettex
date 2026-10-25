import type { ComponentProps } from 'react';
import {LanguageSelector} from './LanguageSelector';
import './_group.css';
const BASE_PATH=''; const HOME_PATH='/'; const DOCUMENTATION_PATH='/documentacao'; const TELEGRAM_COMMUNITY_URL='https://t.me/bettexbrasil'; const X_COMMUNITY_URL='https://x.com/bettexai';
const t=(s:string)=>s;const homeAnchor=(id:string)=>'/#'+id;const usePageLinkProps=()=>({});
function DemoAppLink(props:ComponentProps<'a'>){return <a {...props} href='/app'/>;}
function BettexMark({ className, slate = false }: { className?: string; slate?: boolean }) {
  return <img src={slate ? `${"/__mockup/footer-redesign-assets/"}bettex-mark-slate.svg` : `${"/__mockup/footer-redesign-assets/"}bettex-mark-gamblefi.svg`} className={className} width={26} height={26} alt="" aria-hidden="true" />;
}
function TelegramIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>;
}

type Props = { source: string; label?: string; note?: string; tone?: 'dark' | 'light'; className?: string };


function Logo() {
  const linkProps = usePageLinkProps();
  return <div className="inline-flex items-center gap-2.5 max-[359px]:gap-1.5">
    <a {...linkProps} href={homeAnchor('inicio')} className="inline-flex items-center gap-2.5 max-[359px]:gap-1.5 rounded-xl text-[#F4F1E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#AAC3EE]" aria-label="BETTEX, voltar ao início">
    <span className="grid h-9 w-9 max-[359px]:h-7 max-[359px]:w-7 shrink-0 place-items-center rounded-lg border border-[#768BB5]/30 bg-[#0D1530] shadow-[0_3px_10px_rgba(0,9,33,.12)]">
      <BettexMark slate className="block h-[26px] w-[26px] max-[359px]:h-[22px] max-[359px]:w-[22px]" />
    </span>
    <span className="display text-[22px] max-[359px]:text-[18px] font-extrabold leading-none tracking-[-.075em]">BETTEX</span>
    </a>
    <DemoAppLink data-i18n="raw" data-testid="brand-alpha-badge" aria-label={t('Abrir aplicativo')} className="inline-flex min-h-11 shrink-0 items-center text-[#F2B632]"><span className="mono rounded border border-[#F2B632]/60 bg-[#F2B632]/10 px-1.5 py-1 text-[9px] font-bold leading-none tracking-[.12em]">ALFA</span></DemoAppLink>
  </div>;
}

export function Current() {
  const linkProps = usePageLinkProps();
  return <footer id="rodape" className="site-footer relative overflow-hidden bg-[#070B1F] text-[#e1e7f4]">
    <div className="page-wrap relative sf-top">
      <div className="sf-nav">
        <div className="sf-brand">
          <Logo />
          <p className="sf-tag mono">PROJETO DEFI DE TRADING COM IA</p>
          <div className="sf-actions">
            <LanguageSelector className="sf-lang" showLabel />
            <a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="sf-community" data-community-source="footer" data-testid="link-community-footer-nav"><TelegramIcon className="sf-community__icon" /><span>Entre na comunidade</span></a>
          </div>
          <a href={X_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" data-testid="link-community-x-footer" className="inline-flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-[#e1e7f4] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4F1E8]">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="sf-community__icon" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.153h7.594l5.243 6.932 6.064-6.932ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" /></svg>
            <span>Siga a Bettex no X</span>
          </a>
        </div>
        <nav aria-label="Links do projeto" className="sf-group sf-pages" data-testid="footer-page-navigation">
          <h3 className="mono">Explore</h3>
          <ul>
            <li><a {...linkProps} href={HOME_PATH}>Página inicial</a></li>
            <li><a {...linkProps} href={`${BASE_PATH}/pitch`}>Pitch</a></li>
            <li><a {...linkProps} href={DOCUMENTATION_PATH}>Documentação</a></li>
            <li><a {...linkProps} href={`${BASE_PATH}/app`}>Demo</a></li>
          </ul>
        </nav>
      </div>
    </div>
    <div className="site-footer__cta site-footer__cta--home relative overflow-hidden">
      <div aria-hidden="true" className="site-footer__sports">
        <img
          src={`${"/__mockup/footer-redesign-assets/"}footer-rio-scene-hd.webp`}
          srcSet={`${"/__mockup/footer-redesign-assets/"}footer-rio-scene-sharp.webp 1024w, ${"/__mockup/footer-redesign-assets/"}footer-rio-scene-hd.webp 2048w`}
          sizes="(max-width: 1023px) 100vw, 1000px"
          width={2048}
          height={2048}
          alt=""
          loading="lazy"
          decoding="async"
          className="site-footer__sports-photo"
        />
      </div>
      <div className="page-wrap relative">
        <div className="grid items-end gap-6 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)] lg:gap-10">
          <div className="pb-2 lg:pb-20">
            <span className="mono text-[10px] font-bold uppercase tracking-[.2em] text-[#F4F1E8]">BETTEX</span>
            <h2 className="display mt-5 max-w-[760px] text-[clamp(2.25rem,4.3vw,4rem)] font-extrabold leading-[1.04] tracking-[-.065em] text-[#F4F1E8]"><span className="block">{t('Comece a ganhar.')}</span><span className="block text-[#F2B632]">{t('Invista com inteligência.')}</span></h2>
            <p className="mt-6 max-w-[420px] text-base font-medium leading-7 text-[#F4F1E8]">{t('O agente IA da BETTEX opera em cripto. Você recebe em reais, sem precisar saber operar.')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a {...linkProps} href={DOCUMENTATION_PATH} className="tap inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-[#F4F1E8]/70 px-6 py-3.5 text-sm font-bold text-[#F4F1E8] hover:bg-[#F4F1E8] hover:text-[#070B1F] focus-visible:outline-[#F2B632]">Ler a documentação</a>
              <a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" data-community-source="footer" data-testid="link-community-footer" className="tap inline-flex min-h-12 items-center gap-2 rounded-full bg-[#F4F1E8] px-6 py-3.5 text-sm font-bold text-[#070B1F] hover:bg-white focus-visible:outline-[#F2B632]"><TelegramIcon className="h-5 w-5" />Vem pra comunidade</a>
            </div>
          </div>
          <div className="relative z-10 mx-auto w-full max-w-[400px] self-end lg:max-w-[540px] lg:justify-self-end">
            <div className="h-[260px] lg:h-[420px]" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="page-wrap relative sf-final"><p className="sf-copy">© {new Date().getFullYear()} BETTEX.</p></div>
    </div>
  </footer>;
}

