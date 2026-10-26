/** @jsxImportSource react */
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useX } from '@/components/demo/ui';
import { LanguageSelector } from '@/components/LanguageSelector';
import { startAppSession } from '@/lib/app-session';
import { BettexMark } from '@/components/BettexMark';
import './auth.css';

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return <ClientAuthPage mode={mode} />;
}
function ClientAuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const { x, loc } = useX();
  const [, navigate] = useLocation();
  const base = import.meta.env.BASE_URL;
  const prefix = loc === 'pt' ? '' : `/${loc}`;
  const home = `${base.replace(/\/$/, '')}${prefix}/`;
  const qc = useQueryClient();
  const enter = () => { qc.clear(); startAppSession(); navigate('/app'); };
  const name = x('BETTEX ALFA', 'BETTEX ALPHA', 'BETTEX ALFA');

  return <main className="auth-page demo-root" data-mode={mode}>
    <div className="auth-pattern" aria-hidden="true" />
    <header className="auth-header">
      <a href={home} className="auth-brand" aria-label={name}><BettexMark className="auth-mark" /><span>{name}</span></a>
      <div className="auth-actions">
        <a href={home} className="auth-back" data-testid="link-back-site"><ArrowLeft className="h-4 w-4" aria-hidden="true" /><span>{x('Voltar ao site', 'Back to site', 'Volver al sitio')}</span></a>
        <LanguageSelector className="auth-language" />
      </div>
    </header>
    <div className="auth-stage">
    <section className="auth-hero">
      <p className="auth-kicker">{x('Ambiente de testes', 'Test environment', 'Entorno de pruebas')}</p>
      <h1 className="auth-title">{x('Seja o dono da IA, pare de apostar, comece a investir.', 'Own the AI. Stop betting, start investing.', 'Sé el dueño de la IA, deja de apostar, empieza a invertir.')}</h1>
      <p className="auth-lead">{x('A BETTEX é uma IA de trading cripto que pertence à comunidade. Você não aluga um sinal: participa como dono.', 'BETTEX is a crypto trading AI owned by its community. You do not rent a signal: you take part as an owner.', 'BETTEX es una IA de trading cripto que pertenece a la comunidad. No alquilas una señal: participas como dueño.')}</p>
      <button type="button" data-testid="button-demo-alex" className="auth-cta" onClick={enter}>
        <span>{x('Entrar no demo', 'Enter the demo', 'Entrar en la demo')}</span>
        <span className="auth-cta-icon"><ArrowRight className="h-5 w-5" aria-hidden="true" /></span>
      </button>
    </section>
    <div className="auth-figure" aria-hidden="true">
      <div className="auth-halo"><i className="auth-ring r1" /><i className="auth-ring r2" /></div>
      <img className="auth-phone" src={`${base}hero-duo-btx-silver.webp`} alt="" width={1024} height={1024} />
    </div>
    </div>
    <p className="auth-note">{x('Demo visual com dados simulados. Nenhum dinheiro real é usado e não há promessa de retorno.', 'Visual demo with simulated data. No real money is used and no returns are promised.', 'Demo visual con datos simulados. No se usa dinero real ni se promete rentabilidad.')}</p>
  </main>;
}
export const SignInPage = () => <AuthPage mode="sign-in" />;
export const SignUpPage = () => <AuthPage mode="sign-up" />;
export default AuthPage;
