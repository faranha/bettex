/** @jsxImportSource react */
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useX } from '@/components/demo/ui';
import { TELEGRAM_COMMUNITY_URL } from '@/lib/community';

export function DemoActionNotice({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { x } = useX();
  const btn = 'inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="interface-demo-notice" className="max-w-[min(92vw,26rem)] rounded-2xl border-[#E4DCCB] bg-[#FBF6E9] text-[#12372A]">
        <DialogTitle>{x('Demonstração visual', 'Visual demo', 'Demostración visual')}</DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-[#12372A]">
          {x(
            'Esse é um demo para a interface. É só uma demonstração visual, o software ainda está em desenvolvimento, nos acompanhe pela comunidade',
            'This is an interface demo. It is only a visual demonstration; the software is still in development. Follow us through the community.',
            'Esto es una demo de la interfaz. Es solo una demostración visual; el software aún está en desarrollo. Síguenos en la comunidad.',
          )}
        </DialogDescription>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a data-testid="interface-demo-community" href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#12372A] text-[#F2C14E] hover:bg-[#0C2A1F]`}>{x('Ir para a comunidade', 'Join the community', 'Ir a la comunidad')}</a>
          <button type="button" data-testid="interface-demo-close" onClick={() => onOpenChange(false)} className={`${btn} border border-[#12372A]/30 hover:bg-[#12372A]/10`}>{x('Fechar', 'Close', 'Cerrar')}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default DemoActionNotice;
