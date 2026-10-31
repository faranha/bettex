import { t } from '@/lib/i18n';
import { orderCopy, orderGroups, orderIllustrationLabels, orderStates, orderTypes, orderWhen } from '@/lib/documentation-order-standard';
import { OrderRecordIllustration } from './OrderRecordIllustration';
import './OrderStandard.css';

/** Documentation only: no operational mutation or implied live integration. */
export function OrderStandard() {
  const text = (key: keyof typeof orderCopy) => t(orderCopy[key][0]);
  return <div className="order-standard" data-documentation-order-standard="">
    <section aria-labelledby="documentacao-estrutura-ordem">
      <h3 id="documentacao-estrutura-ordem" className="whitepaper__subhead">{text('title')}</h3>
      <div className="whitepaper__prose">
        <p>{text('lead')}</p><p>{text('distinctions')}</p><p>{text('storage')}</p>
      </div>
      <OrderRecordIllustration
        labels={orderIllustrationLabels.map(label => t(label[0])) as [string, string, string, string, string, string]}
        caption={text('title')}
      />
      <div className="order-standard__scope"><p>{text('scope')}</p></div>
      <a className="order-standard__detail-link" href="#documentacao-contrato-ordem">{text('detailLink')} <span aria-hidden="true">↓</span></a>
    </section>
    <section aria-labelledby="documentacao-selecao-ordens">
      <h3 id="documentacao-selecao-ordens" className="whitepaper__subhead">{text('selectionTitle')}</h3>
      <div className="whitepaper__prose">
        <p>{text('selectionInitial')}</p>
        <p>{text('selectionEligibility')}</p>
        <p>{text('selectionRanking')}</p>
        <p>{text('selectionAbstain')}</p>
        <p>{text('selectionPhases')}</p>
        <p>{text('selectionDemo')}</p>
        <p>{text('selectionTrace')}</p>
      </div>
      <a className="order-standard__detail-link" href="#documentacao-contrato-ordem">{text('detailLink')} <span aria-hidden="true">↓</span></a>
    </section>
    <section aria-labelledby="documentacao-contrato-ordem">
      <h3 id="documentacao-contrato-ordem" className="whitepaper__subhead">{text('detailTitle')}</h3>
      <p className="order-standard__intro">{text('tableIntro')}</p>
      <h4>{text('primitivesTitle')}</h4>
      <dl className="order-standard__types">{orderTypes.map(type => <div key={type.name}>
        <dt><code data-i18n="raw">{type.name}</code></dt><dd>{t(type.copy[0])}</dd>
      </div>)}</dl>
      {orderGroups.map(group => <section className="order-standard__group" key={group.id}>
        <h4 id={`documentacao-ordem-${group.id}`}>{t(group.title[0])}</h4>
        <table aria-labelledby={`documentacao-ordem-${group.id}`}>
          <thead><tr><th scope="col">{text('field')}</th><th scope="col">{text('type')}</th><th scope="col">{text('requirement')}</th></tr></thead>
          <tbody>{group.fields.map(field => <tr key={field.path}>
            <th scope="row"><code data-i18n="raw">{field.path}</code></th>
            <td className="order-standard__type"><code data-i18n="raw">{field.type}</code></td>
            <td><span className="order-standard__when">{t(orderWhen[field.when][0])}</span><p>{t(field.copy[0])}</p></td>
          </tr>)}</tbody>
        </table>
      </section>)}
      <section className="order-standard__states">
        <h4 id="documentacao-ordem-estados">{text('lifecycleTitle')}</h4>
        <dl>{orderStates.map(state => <div key={state.code}><dt><code data-i18n="raw">{state.code}</code></dt><dd>{t(state.copy[0])}</dd></div>)}</dl>
      </section>
      <section>
        <h4 id="documentacao-ordem-retorno">{text('returnTitle')}</h4>
        <div className="whitepaper__prose"><p>{text('returnText')}</p><p>{text('formula')}</p><p>{text('example')}</p><p>{text('settlement')}</p></div>
      </section>
      <section>
        <h4 id="documentacao-ordem-validacao">{text('invariantsTitle')}</h4>
        <div className="whitepaper__prose"><p>{text('integrity')}</p><p>{text('atomicity')}</p><p>{text('audit')}</p><p>{text('privacy')}</p><p>{text('compatibility')}</p></div>
      </section>
    </section>
  </div>;
}
