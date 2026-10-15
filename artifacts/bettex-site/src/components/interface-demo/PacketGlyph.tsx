/** @jsxImportSource react */
import { ArrowRight, ChartNoAxesCombined, Gavel, GitCompareArrows, Landmark, MessageCircleQuestion, MessageSquareText, ScrollText, ShieldAlert, Waypoints } from 'lucide-react';
import { REQUESTS } from './central-data';
import type { GraphPacket } from './central-packets';
import { useFmt } from '../alpha-trading/format';

/** Currency symbols stay upright, independently of the direction of travel. */
export function CurrencyGlyph({ asset }: { asset: string }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {asset === 'btc' ? <>
      <path d="m10 3-4 18m9-17-4 18M7 6l8 2c5 1 3 6-1 5l-8-2m1 0 8 2c5 1 3 7-2 6l-9-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </> : asset === 'eth' ? <>
      <path d="m12 2 7 10-7 4-7-4L12 2Zm-7 13 7 7 7-7-7 4-7-4Z" fill="currentColor" />
      <path d="M12 3v12" stroke="#07121C" strokeWidth="1" />
    </> : <>
      <path d="M7 4h14l-4 4H3l4-4Zm-4 6h14l4 4H7l-4-4Zm4 6h14l-4 4H3l4-4Z" fill="currentColor" />
    </>}
  </svg>;
}

const SUPPORT_ICONS = {
  governance: ScrollText,
  risk: ShieldAlert,
  treasury: Landmark,
  execution: Waypoints,
  reconciliation: GitCompareArrows,
};

export function packetSubject(packet: GraphPacket): string {
  return packet.exchange
    ? packet.source === 'bettex' ? packet.target : packet.source
    : REQUESTS.find(request => request.id === packet.requestId)?.asset ?? 'crypto';
}

export function PacketGlyph({ packet, direction = false }: { packet: GraphPacket; direction?: boolean }) {
  const subject = packetSubject(packet);
  const SubjectIcon = SUPPORT_ICONS[subject as keyof typeof SUPPORT_ICONS];
  const TypeIcon = packet.exchange === 'query' ? MessageCircleQuestion
    : packet.exchange === 'opinion' ? MessageSquareText
    : packet.kind === 'analysis' ? ChartNoAxesCombined : Gavel;
  return <>
    <span className="pk-subject">{SubjectIcon ? <SubjectIcon aria-hidden="true" /> : <CurrencyGlyph asset={subject} />}</span>
    <span className="pk-type"><TypeIcon aria-hidden="true" /></span>
    {direction && <span className="pk-direction"><ArrowRight aria-hidden="true" /></span>}
  </>;
}

export function PacketIconKey() {
  const { x } = useFmt();
  const entries = [
    { icon: MessageCircleQuestion, label: x('Consulta', 'Consultation', 'Consulta') },
    { icon: MessageSquareText, label: x('Parecer', 'Opinion', 'Dictamen') },
    { icon: ChartNoAxesCombined, label: x('Análise', 'Analysis', 'Análisis') },
    { icon: Gavel, label: x('Decisão', 'Decision', 'Decisión') },
    { icon: ScrollText, label: x('Governança', 'Governance', 'Gobernanza') },
    { icon: ShieldAlert, label: x('Risco', 'Risk', 'Riesgo') },
    { icon: Landmark, label: x('Tesouraria', 'Treasury', 'Tesorería') },
    { icon: Waypoints, label: x('Execução', 'Execution', 'Ejecución') },
    { icon: GitCompareArrows, label: x('Conciliação', 'Reconciliation', 'Conciliación') },
  ];
  return <details className="pk-icon-key" data-demo-local>
    <summary>{x('Ícones das comunicações', 'Communication icons', 'Iconos de las comunicaciones')}</summary>
    <p>{x('Símbolo principal: moeda ou assunto. Selo menor: tipo de mensagem. Seta: direção.', 'Main symbol: currency or subject. Small badge: message type. Arrow: direction.', 'Símbolo principal: moneda o tema. Insignia pequeña: tipo de mensaje. Flecha: dirección.')}</p>
    <div>{['btc', 'eth', 'sol'].map(asset => <span key={asset}><CurrencyGlyph asset={asset} />{asset.toUpperCase()}</span>)}
      {entries.map(({ icon: Icon, label }) => <span key={label}><Icon aria-hidden="true" />{label}</span>)}</div>
  </details>;
}
