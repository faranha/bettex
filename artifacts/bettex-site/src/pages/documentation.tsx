import { useEffect } from 'react';
import { WhitepaperSection } from '@/components/WhitepaperSection';

const TITLE = 'Documentação técnica | BETTEX';
const DESC = 'Arquitetura técnica BETTEX: Arbitrum One, carteira exportável, autocustódia, acesso sem KYC, staking no aplicativo e possíveis integrações com Robinhood e Allora.';

export function DocumentationPage() {
  useEffect(() => {
    const sel = ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]'];
    const vals = [DESC, TITLE, DESC, TITLE, DESC];
    const prevTitle = document.title;
    const prev = sel.map((s) => document.head.querySelector(s)?.getAttribute('content') ?? null);
    document.title = TITLE;
    sel.forEach((s, i) => document.head.querySelector(s)?.setAttribute('content', vals[i]));
    return () => {
      document.title = prevTitle;
      sel.forEach((s, i) => { const v = prev[i]; if (v !== null) document.head.querySelector(s)?.setAttribute('content', v); });
    };
  }, []);
  return <main><WhitepaperSection /></main>;
}

export default DocumentationPage;
