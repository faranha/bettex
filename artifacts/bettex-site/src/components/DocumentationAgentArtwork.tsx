import { t } from '@/lib/i18n';
import './DocumentationAgentArtwork.css';

const artwork: Record<string, { file: string; width: number; height: number; asset?: string }> = {
  'documentacao-subagente-risco': { file: 'documentation-risk.webp', width: 314, height: 640 },
  'documentacao-subagente-tesouraria': { file: 'documentation-treasury.webp', width: 461, height: 640 },
  'documentacao-subagente-governanca': { file: 'documentation-governance.webp', width: 407, height: 640 },
  'documentacao-subagente-cripto': { file: 'documentation-tradix.webp', width: 276, height: 640 },
  'documentacao-subagente-esportes': { file: 'documentation-sportix.webp', width: 312, height: 640 },
  'documentacao-subagente-previsoes': { file: 'documentation-predix.webp', width: 325, height: 640 },
  'documentacao-subagente-igaming': { file: 'documentation-bettix.webp', width: 368, height: 640 },
  'documentacao-especialista-btc': { file: 'documentation-tradix.webp', width: 276, height: 640, asset: 'BTC' },
  'documentacao-especialista-eth': { file: 'documentation-tradix.webp', width: 276, height: 640, asset: 'ETH' },
  'documentacao-especialista-sol': { file: 'documentation-tradix.webp', width: 276, height: 640, asset: 'SOL' },
};

export const hasDocumentationAgentArtwork = (chapterId: string) => Boolean(artwork[chapterId]);

/** Visual identification only: artwork does not imply availability or authorization. */
export function DocumentationAgentArtwork({ chapterId, title }: { chapterId: string; title: string }) {
  const art = artwork[chapterId];
  if (!art) return null;
  return <figure className="documentation-agent-art" data-documentation-agent-art={chapterId}>
    <img src={`${import.meta.env.BASE_URL}agents/${art.file}`} width={art.width} height={art.height}
      alt={`${t('Ilustração conceitual')}: ${t(title)}`} data-i18n="translated" loading="lazy" decoding="async" />
    {art.asset && <span className={`documentation-agent-art__asset documentation-agent-art__asset--${art.asset.toLowerCase()}`}
      aria-hidden="true" data-i18n="translated">{art.asset}</span>}
  </figure>;
}
