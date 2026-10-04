import { Fragment } from 'react';
import { Instagram, Send, Smartphone, Wallet, ArrowRight, ArrowDown } from 'lucide-react';
import { getFormatLocale, t, useLocale } from '@/lib/i18n';
import './FounderLaunchFunnel.css';

const stages = [
  { n: '01', Icon: Instagram, title: 'Instagram', line: 'Atração', note: 'Conteúdo do fundador atrai o apostador brasileiro.' },
  { n: '02', Icon: Send, title: 'Telegram', line: 'Relacionamento', note: 'A comunidade esclarece dúvidas e conduz ao app.' },
  { n: '03', Icon: Smartphone, title: 'Aplicativo BETTEX', line: 'Primeiro uso', note: 'Primeiros compradores e usuários entram no produto.' },
] as const;

export function FounderLaunchFunnel() {
  useLocale();
  return <figure className="flf" data-testid="founder-launch-funnel">
    <figcaption className="flf__head">
      <span className="flf__kicker">{t('Lançamento orgânico financiado pelo fundador')}</span>
      <strong>{t('Primeiros 3 meses de operação')}</strong>
    </figcaption>
    <div className="flf__fund" data-testid="flf-founder-fund">
      <Wallet aria-hidden="true" size={22} />
      <div className="flf__fundtxt"><b>Fred Azevedo</b><span>{t('financia a aquisição com seu orçamento corrente')}</span></div>
    </div>
    <ol className="flf__stages">
      {stages.map((s, i) => <Fragment key={s.n}><li className="flf__stage">
        <span className="flf__n">{s.n}</span>
        <s.Icon aria-hidden="true" size={26} />
        <h3>{t(s.title)}</h3>
        <em>{t(s.line)}</em>
        <p>{t(s.note)}</p>
      </li>
      {i < 2 && <li className="flf__arrow" aria-hidden="true"><ArrowRight className="flf__ar" size={22} /><ArrowDown className="flf__ad" size={22} /></li>}
      </Fragment>)}
    </ol>
    <div className="flf__goal">
      <div><strong>{(1000).toLocaleString(getFormatLocale())}</strong><span>{t('primeiros usuários')}</span></div>
      <div className="flf__zero"><strong>{t('Zero')}</strong><span>{t('custo de aquisição para a empresa')}</span></div>
    </div>
    <p className="flf__note">{t('Compromisso planejado do fundador, não tração realizada. Não indica despesas operacionais zero nem promete retorno.')}</p>
  </figure>;
}

export default FounderLaunchFunnel;
