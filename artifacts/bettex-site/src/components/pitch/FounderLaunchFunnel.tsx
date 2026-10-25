import { Fragment } from 'react';
import { Search, MessageSquare, Smartphone, Wallet } from 'lucide-react';
import { getFormatLocale, t, useLocale } from '@/lib/i18n';
import './FounderLaunchFunnel.css';

const stages = [
  { n: '01', Icon: Search, title: 'Interesse no produto', line: 'Demanda', note: 'Medir o interesse pela proposta da BETTEX.' },
  { n: '02', Icon: Smartphone, title: 'Demo BETTEX', line: 'Experimentação', note: 'Testar o uso do aplicativo em um ambiente demonstrativo.' },
  { n: '03', Icon: MessageSquare, title: 'Feedback e validação', line: 'Aprendizado', note: 'Avaliar compreensão, utilidade e intenção de uso.' },
] as const;

export function FounderLaunchFunnel() {
  useLocale();
  return <figure className="flf" data-testid="founder-launch-funnel">
    <figcaption className="flf__head">
      <span className="flf__kicker">{t('Plano inicial de validação da demanda')}</span>
      <strong>{t('Primeiros 3 meses de operação')}</strong>
    </figcaption>
    <div className="flf__fund" data-testid="flf-founder-fund">
      <Wallet aria-hidden="true" size={22} />
      <div className="flf__fundtxt"><b>{t('O fundador')}</b><span>{t('financia a aquisição com seu orçamento corrente')}</span></div>
    </div>
    <ol className="flf__stages">
      {stages.map((s, i) => <Fragment key={s.n}><li className="flf__stage">
        <span className="flf__n">{s.n}</span>
        <s.Icon aria-hidden="true" size={26} />
        <h3>{t(s.title)}</h3>
        <em>{t(s.line)}</em>
        <p>{t(s.note)}</p>
      </li>
      {i < 2 && <li className="flf__arrow" aria-hidden="true" />}
      </Fragment>)}
    </ol>
    <div className="flf__goal">
      <div><strong>{(1000).toLocaleString(getFormatLocale())}</strong><span>{t('primeiros usuários')}</span></div>
      <div className="flf__zero"><strong>{t('Zero')}</strong><span>{t('custo de aquisição para o projeto')}</span></div>
    </div>
    <p className="flf__note">{t('Meta de planejamento, não tração comprovada. Custo de aquisição zero para o projeto não significa despesas operacionais zero.')}</p>
  </figure>;
}

export default FounderLaunchFunnel;
