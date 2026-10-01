import type { ScreenId } from './presentationData';
import { TokenWallet } from './TokenWallet';
import { OperationsPreview } from './OperationsPreview';
import { PerformancePreview } from './PerformancePreview';

const Head = ({ k, t }: { k: string; t: string }) => <><small>{k}</small><h5>{t}</h5></>;
const unknownScreen = (id: ScreenId): never => { throw new Error(`Tela conceitual desconhecida: ${id}`); };

export function PhoneScreen({ id }: { id: ScreenId }) {
  switch (id) {
    case 'participacao': return <TokenWallet />;
    case 'bettex': return (<>
      <Head k="Operação BETTEX" t="BETTEX em operação" />
      <OperationsPreview />
    </>);
    case 'resultados': return <PerformancePreview mode="overview" />;
    case 'historico': return <PerformancePreview mode="history" />;
    default: return unknownScreen(id);
  }
}