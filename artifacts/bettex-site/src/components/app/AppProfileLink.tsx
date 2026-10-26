/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronDown, Loader2, LogOut, UserRound } from 'lucide-react';
import { useGetDemoDashboard, getGetDemoDashboardQueryKey } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { demoPath } from '@/components/demo/demo-navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { endAppSession } from '@/lib/app-session';
import { useQueryClient } from '@tanstack/react-query';
import { visualDashboard } from '@/components/interface-demo/runtime';

export function AppProfileLink() {
  const { x, loc } = useX();
  const [path, navigate] = useLocation();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const logout = () => { endAppSession(); cache.clear(); navigate('/sign-in'); };
  const busy = false, failed = false;
  useEffect(() => { setOpen(false); }, [path, loc]);
  const data = visualDashboard();
  const name = data?.profile.nickname?.trim() || data?.profile.name;
  const options = [
    { tab: 'profile', icon: UserRound, label: x('Perfil', 'Profile', 'Perfil') },
  ];
  return <DropdownMenu open={open} onOpenChange={setOpen}>
    <DropdownMenuTrigger asChild><button type="button" data-testid="link-account-full"
      aria-label={x('Abrir menu da minha conta', 'Open my account menu', 'Abrir menú de mi cuenta')}
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]">
      <span className="sr-only" data-testid="text-header-profile-name">{name || x('Minha conta', 'My account', 'Mi cuenta')}</span>
      <UserRound className="h-5 w-5 shrink-0" aria-hidden="true" />
      <ChevronDown className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
    </button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-24px)] border-[#E4DCCB] bg-[#FFFCF6] text-[#1B2A41]" data-testid="account-dropdown">
      <DropdownMenuLabel>{x('Minha conta', 'My account', 'Mi cuenta')}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {options.map(({ tab, icon: Icon, label }) => <DropdownMenuItem key={tab} asChild>
        <Link href={demoPath('account', loc)} data-testid={`account-menu-${tab}`} className="min-h-11 gap-2">
          <Icon className="h-4 w-4" aria-hidden="true" />{label}
        </Link>
      </DropdownMenuItem>)}
      <DropdownMenuSeparator />
      <DropdownMenuItem data-demo-local disabled={busy} data-testid="account-menu-logout" onSelect={event => { event.preventDefault(); void logout(); }} className="min-h-11 gap-2 text-[#B4421A]">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
        {busy ? x('Saindo…', 'Logging out…', 'Saliendo…') : x('Sair do demo', 'Leave demo', 'Salir del demo')}
      </DropdownMenuItem>
      {failed && <p role="alert" className="px-2 py-1 text-xs text-[#B4421A]">{x('Não foi possível sair. Tente novamente.', 'Could not log out. Please try again.', 'No se pudo cerrar sesión. Inténtalo de nuevo.')}</p>}
    </DropdownMenuContent>
  </DropdownMenu>;
}
