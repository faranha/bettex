/** @jsxImportSource react */
import { useEffect, useRef, type ReactNode } from 'react';
import { ClerkProvider, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/shared/keys';
import { ptBR, enUS, esES } from '@clerk/localizations';
import { shadcn } from '@clerk/themes';
import { useLocation, Redirect } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { getGetDemoDashboardQueryKey } from '@workspace/api-client-react';
import { useLocale } from '@/lib/i18n';

function CacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const previous = useRef<string | null | undefined>(undefined);
  const revision = useRef<number | undefined>(undefined);
  useEffect(() => addListener(({ user }) => {
    const id = user?.id ?? null;
    if (previous.current !== undefined && previous.current !== id) {
      void queryClient.cancelQueries();
      queryClient.clear();
    } else if (previous.current !== undefined && user && revision.current !== user.updatedAt?.getTime()) {
      void queryClient.invalidateQueries({ queryKey: getGetDemoDashboardQueryKey() });
    }
    previous.current = id;
    revision.current = user?.updatedAt?.getTime();
  }), [addListener, queryClient]);
  return null;
}

function ProviderWithRoutes({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const language = useLocale();
  const basePath = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${language === 'pt' ? '' : `/${language}`}`;
  const clerkPubKey = publishableKeyFromHost(
    window.location.hostname,
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  );
  const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
  if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
  function stripBase(path: string): string {
    return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
  }
  const clerkAppearance = {
    theme: shadcn,
    cssLayerName: 'clerk',
    options: {
      logoPlacement: 'inside' as const,
      logoLinkUrl: basePath || '/',
      logoImageUrl: `${window.location.origin}${import.meta.env.BASE_URL}account-logo.svg`,
    },
    variables: {
      colorPrimary: '#0E7C6B',
      colorForeground: '#1B2A41',
      colorMutedForeground: '#5B6B85',
      colorDanger: '#B4421A',
      colorBackground: '#FFFCF6',
      colorInput: '#FFFFFF',
      colorInputForeground: '#1B2A41',
      colorNeutral: '#D8CFBB',
      fontFamily: 'Manrope, sans-serif',
      borderRadius: '0.75rem',
    },
    elements: {
      rootBox: 'w-full flex justify-center',
      cardBox: 'bg-[#FFFCF6] rounded-2xl w-[440px] max-w-full overflow-hidden',
      card: '!shadow-none !border-0 !bg-transparent !rounded-none',
      footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
      formFieldInput: 'min-h-11',
      formButtonPrimary: 'min-h-11 !text-white',
    },
  };
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    localization={language === 'pt' ? ptBR : language === 'es' ? esES : enUS}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    signInFallbackRedirectUrl={`${basePath}/app`}
    signUpFallbackRedirectUrl={`${basePath}/app`}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  ><CacheInvalidator />{children}</ClerkProvider>;
}

export function AccountAuthProvider({ children }: { children: ReactNode }) {
  // Public prerendering has no browser session or Clerk provider.
  return children;
}

export function AuthenticatedHome({ children }: { children: ReactNode }) {
  return children;
}