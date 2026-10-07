/** @jsxImportSource react */
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useX } from '@/components/demo/ui';
import { LanguageSelector } from '@/components/LanguageSelector';
import { startAppSession } from '@/lib/app-session';
import { AgentShowcase } from '@/components/demo/AgentShowcase';
import { BettexMark } from '@/components/BettexMark';
import './auth.css';

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return typeof window === 'undefined' ? <main className="demo-root min-h-96" /> : <ClientAuthPage mode={mode} />;
}
function ClientAuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const { x, loc } = useX();
  const [, navigate] = useLocation();
  const { isLoaded, isSignedIn } = useUser();
  const base = import.meta.env.BASE_URL;
  const prefix = loc === 'pt' ? '' : `/${loc}`;
  const home = `${base.replace(/\/$/, '')}${prefix}/`;
  const qc = useQueryClient();
  const enter = () => { qc.clear(); startAppSession(); navigate('/app'); };
  useEffect(() => { if (isLoaded && isSignedIn) navigate('/app', { replace: true }); }, [isLoaded, isSignedIn, navigate]);
  const name = x('BETTEX ALFA', 'BETTEX ALPHA', 'BETTEX ALFA');

  return <main className="auth-page demo-root" data-mode={mode}>
    <div className="auth-photo" style={{ backgroundImage: `url(${base}app-entry-sports.jpg)` }} aria-hidden="true" />
    <div className="auth-pattern" aria-hidden="true" />
    <header className="auth-header">
      <a href={home} className="auth-brand" aria-label={name}><BettexMark className="auth-mark" /><span>{name}</span></a>
      <div className="auth-actions">
        <a href={home} className="auth-back" data-testid="link-back-site"><ArrowLeft className="h-4 w-4" aria-hidden="true" /><span>{x('Voltar ao site', 'Back to site', 'Volver al sitio')}</span></a>
        <LanguageSelector className="auth-language" />
      </div>
    </header>
    <section className="auth-hero">
      <p className="auth-kicker">{x('Ambiente de testes', 'Test environment', 'Entorno de pruebas')}</p>
      <h1 className="auth-title">{x('Pare de apostar e comece a investir agora com a Bettex.', 'Stop betting and start investing now with Bettex.', 'Deja de apostar y empieza a invertir ahora con Bettex.')}</h1>
      <p className="auth-lead">{x('Demonstração com dados simulados', 'Demo with simulated data', 'Demostración con datos simulados')}</p>
      <button type="button" data-testid="button-demo-alex" className="auth-cta" onClick={enter}>
        <span>{x('Entrar no demo', 'Enter the demo', 'Entrar en la demo')}</span>
        <span className="auth-cta-icon"><ArrowRight className="h-5 w-5" aria-hidden="true" /></span>
      </button>
      <p className="auth-tag"><i aria-hidden="true" />{x('Demonstração · sem dinheiro real', 'Demo · no real money', 'Demostración · sin dinero real')}</p>
    </section>
    <div className="auth-agents"><AgentShowcase variant="dark" onEnter={() => { qc.clear(); startAppSession(); }} /></div>
  </main>;
}
export const SignInPage = () => <AuthPage mode="sign-in" />;
export const SignUpPage = () => <AuthPage mode="sign-up" />;
export default AuthPage;
