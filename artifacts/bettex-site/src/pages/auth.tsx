/** @jsxImportSource react */
import { SignIn, SignUp, useUser } from '@clerk/react';
import { useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useX } from '@/components/demo/ui';
import '@/components/demo/demo.css';

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const { x, loc } = useX();
  const { isLoaded, isSignedIn } = useUser();
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const home = `${base}${loc === 'pt' ? '' : `/${loc}`}`;
  const demo = `${home}/demo`;
  const up = mode === 'sign-up';
  useEffect(() => {
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previous = robots?.content;
    if (robots) robots.content = 'noindex,nofollow';
    return () => { if (robots && previous !== undefined) robots.content = previous; };
  }, []);
  return <main className="demo-root grid min-h-[calc(100dvh-var(--site-header-h))] items-start gap-6 px-4 py-8 md:grid-cols-[minmax(0,26rem)_auto] md:justify-center md:gap-12 md:py-14">
    <section className="max-w-md self-center">
      <p className="mono text-[11px] font-bold uppercase tracking-widest text-[#0A6657]">{x('Protótipo tecnológico', 'Technology prototype', 'Prototipo tecnológico')}</p>
      <h1 className="display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" data-testid="text-auth-title">{up ? x('Crie sua conta BETTEX', 'Create your BETTEX account', 'Crea tu cuenta BETTEX') : x('Entre na sua conta', 'Sign in to your account', 'Entra en tu cuenta')}</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#5B6B85]">{up ? x('Ao se cadastrar, os saldos e o histórico da demonstração anônima atual ficam vinculados à nova conta no primeiro registro. Todo o dinheiro é emulado.', 'When you register, the balances and history of your current anonymous demo are linked to the new account on first registration. All money is emulated.', 'Al registrarte, los saldos y el historial de tu demostración anónima actual quedan vinculados a la nueva cuenta en el primer registro. Todo el dinero es emulado.') : x('Acesse seu painel demonstrativo. Se esqueceu a senha, use o link de recuperação no próprio formulário.', 'Access your demo dashboard. If you forgot your password, use the recovery link inside the form.', 'Accede a tu panel demostrativo. Si olvidaste la contraseña, usa el enlace de recuperación del propio formulario.')}</p>
      <div className="mt-4 flex gap-3 rounded-2xl bg-[#EFF6F2] p-3 text-xs leading-relaxed text-[#1B2A41]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0E7C6B]" aria-hidden="true" /><p>{x('Nada aqui é um fundo nem move dinheiro real. Nenhuma senha é guardada por nós: o provedor de autenticação cuida disso.', 'Nothing here is a fund or moves real money. We store no passwords: the authentication provider handles that.', 'Nada aquí es un fondo ni mueve dinero real. No guardamos contraseñas: el proveedor de autenticación se encarga.')}</p></div>
    </section>
    <section className="flex min-w-0 justify-center">
      {!isLoaded ? <div className="flex h-64 w-full max-w-md items-center justify-center rounded-3xl bg-[#F0E9DA]" aria-busy="true"><Loader2 className="h-5 w-5 animate-spin text-[#0E7C6B]" aria-hidden="true" /></div>
      : isSignedIn ? <div className="dcard grid w-full max-w-md gap-3 p-6"><p className="font-bold">{x('Você já está conectado.', 'You are already signed in.', 'Ya estás conectado.')}</p><a data-testid="link-go-demo" href={demo} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white hover:bg-[#0A6657]">{x('Ir para o painel e minha conta', 'Go to dashboard and my account', 'Ir al panel y a mi cuenta')}</a></div>
      : up ? <SignUp routing="path" path={`${home}/sign-up`} signInUrl={`${home}/sign-in`} forceRedirectUrl={demo} fallbackRedirectUrl={demo} />
      : <SignIn routing="path" path={`${home}/sign-in`} signUpUrl={`${home}/sign-up`} forceRedirectUrl={demo} fallbackRedirectUrl={demo} />}
    </section>
  </main>;
}
export const SignInPage = () => <AuthPage mode="sign-in" />;
export const SignUpPage = () => <AuthPage mode="sign-up" />;
export default AuthPage;
