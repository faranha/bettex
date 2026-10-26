import { ArrowUpRight, Instagram } from 'lucide-react';
import { TelegramIcon } from '@/components/CommunityCTA';
import { INSTAGRAM_URL, TELEGRAM_COMMUNITY_URL, X_COMMUNITY_URL } from '@/lib/community';
import { useX } from './pitchCopy';
import './PitchFinalCommunity.css';

export function PitchFinalCommunity() {
  const x = useX();
  return <section id="pitch-comunidade" aria-labelledby="pitch-comunidade-t" className="pfc">
    <div className="page-wrap pfc__in">
      <div className="pfc__copy">
      <h2 id="pitch-comunidade-t" className="hero-title pfc__h">{x('Entre na comunidade.', 'Join the community.', 'Únete a la comunidad.')} <span>{x('Construa a BETTEX.', 'Build BETTEX.', 'Construye BETTEX.')}</span></h2>
      <p className="pfc__p">{x('Um projeto comunitário de DeFi e IA. Contribua com ideias, acompanhe as decisões e ajude a construir a tecnologia: com BETTEX, a IA também é sua.', 'A community DeFi and AI project. Contribute ideas, follow decisions and help build the technology: with BETTEX, the AI is yours too.', 'Un proyecto comunitario de DeFi e IA. Aporta ideas, sigue las decisiones y ayuda a construir la tecnología: con BETTEX, la IA también es tuya.')}</p>
      <ul className="pfc__soc">
        <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="tap" data-testid="link-pitch-final-instagram" aria-label={x('BETTEX no Instagram (@bettex.ai)', 'BETTEX on Instagram (@bettex.ai)', 'BETTEX en Instagram (@bettex.ai)')}><span className="pfc__brand pfc__brand--instagram" aria-hidden="true"><Instagram size={28} /></span><span>{x('Instagram', 'Instagram', 'Instagram')}<b data-i18n="raw">@bettex.ai</b></span><ArrowUpRight className="pfc__social-arrow" size={18} aria-hidden="true" /></a></li>
        <li><a href={X_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="tap" data-testid="link-pitch-final-x" aria-label={x('BETTEX no X (@bettexai)', 'BETTEX on X (@bettexai)', 'BETTEX en X (@bettexai)')}><span className="pfc__brand pfc__brand--x" aria-hidden="true"><svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.153h7.594l5.243 6.932 6.064-6.932ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" /></svg></span><span>{x('X', 'X', 'X')}<b data-i18n="raw">@bettexai</b></span><ArrowUpRight className="pfc__social-arrow" size={18} aria-hidden="true" /></a></li>
      </ul>
      <a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="pfc__tg tap" data-testid="link-pitch-final-telegram" data-community-source="pitch-final">
        <TelegramIcon className="pfc__tgi" />
        <span className="pfc__tgt"><small>{x('Comunidade oficial', 'Official community', 'Comunidad oficial')}</small><strong>{x('Entrar no Telegram', 'Join on Telegram', 'Entrar en Telegram')}</strong></span>
        <ArrowUpRight className="pfc__tga" aria-hidden="true" />
      </a>
      </div>
      <figure className="pfc__art" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}footer-community.webp`} alt="" width={900} height={858} loading="lazy" decoding="async" />
      </figure>
    </div>
  </section>;
}
