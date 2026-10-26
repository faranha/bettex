/** @jsxImportSource react */
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useX } from '@/components/demo/ui';
import { LanguageSelector } from '@/components/LanguageSelector';
import { startAppSession } from '@/lib/app-session';
import { AgentShowcase } from '@/components/demo/AgentShowcase';
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
      <h1 className="auth-title">{x('Participe da cripto com IA, com visão e sem achismo.', 'Take part in crypto with AI, with clarity instead of guesswork.', 'Participa en cripto con IA, con claridad y sin suposiciones.')}</h1>
      <p className="auth-lead">{x('Analise padrões de manipulação e possíveis oportunidades de entrada e saída. A inteligência está em desenvolvimento; esta é uma demo visual com dados simulados.', 'Analyze manipulation patterns and possible entry and exit opportunities. The intelligence is under development; this is a visual demo with simulated data.', 'Analiza patrones de manipulación y posibles oportunidades de entrada y salida. La inteligencia está en desarrollo; esta es una demo visual con datos simulados.')}</p>
      <button type="button" data-testid="button-demo-alex" className="auth-cta" onClick={enter}>
        <span>{x('Entrar no demo', 'Enter the demo', 'Entrar en la demo')}</span>
        <span className="auth-cta-icon"><ArrowRight className="h-5 w-5" aria-hidden="true" /></span>
      </button>
    </section>
    <div className="auth-figure"><img className="auth-phone" src={`${base}hero-person-centered.webp`} alt="" aria-hidden="true" width={514} height={968} /></div>
    </div>
    <div className="auth-agents"><AgentShowcase variant="dark" showDisclaimer={false} onEnter={() => { qc.clear(); startAppSession(); }} /></div>
  </main>;
}
export const SignInPage = () => <AuthPage mode="sign-in" />;
export const SignUpPage = () => <AuthPage mode="sign-up" />;
export default AuthPage;
