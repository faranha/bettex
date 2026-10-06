/** @jsxImportSource react */
import { Link } from 'wouter';
import { UserRound } from 'lucide-react';
import { useGetDemoDashboard, getGetDemoDashboardQueryKey } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { demoPath } from '@/components/demo/demo-navigation';

export function AppProfileLink() {
  const { x, loc } = useX();
  const { data } = useGetDemoDashboard({ query: {
    queryKey: getGetDemoDashboardQueryKey(),
    enabled: typeof window !== 'undefined',
    refetchInterval: 4000,
    refetchIntervalInBackground: false,
    retry: 1,
  } });
  const name = data?.profile.nickname?.trim() || data?.profile.name;
  return <Link href={`${demoPath('account', loc)}?tab=profile`} data-testid="link-account-full"
    aria-label={x('Abrir detalhes do meu perfil', 'Open my profile details', 'Abrir detalles de mi perfil')}
    title={name || x('Perfil', 'Profile', 'Perfil')}
    className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]">
    {name && <span className="max-w-16 truncate sm:max-w-24" data-testid="text-header-profile-name">{name}</span>}
    <UserRound className="h-5 w-5 shrink-0" aria-hidden="true" />
  </Link>;
}
