/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';
import { trainingCopy as copy, trainingOrderPaths, trainingProfiles, type TrainingText } from '@/lib/documentation-training';

function useTrainingText() {
  const locale = useLocale();
  return (value: TrainingText) => value[locale === 'en' ? 1 : locale === 'es' ? 2 : 0];
}

/** A proposed documentary protocol, never a runtime or simulated execution engine. */
export function DocumentationTrainingProtocol() {
  const x = useTrainingText();
  return <div data-i18n="translated" data-testid="documentation-training-protocol" data-documentation-training-addition="">
    <h3 id="documentacao-protocolo-treino" className="whitepaper__subhead">{x(copy.protocolTitle)}</h3>
    <div className="whitepaper__prose">
      <p>{x(copy.scope)}</p><p>{x(copy.protocol)}</p><p>{x(copy.catalogue)}</p>
      <p>{x(copy.mapping)}</p>
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}><code>{trainingOrderPaths.join('\n')}</code></pre>
      <p>{x(copy.evaluation)}</p>
      <p><a href="#documentacao-contrato-ordem"><strong>{x(copy.orderLink)}</strong></a></p>
    </div>
  </div>;
}

export function DocumentationAgentTraining({ chapterId }: { chapterId: string }) {
  const x = useTrainingText();
  const specialist = chapterId.startsWith('documentacao-especialista-');
  const profile = trainingProfiles[specialist ? 'documentacao-subagente-cripto' : chapterId];
  if (!profile) return null;
  const crypto = chapterId === 'documentacao-subagente-cripto';
  const future = ['documentacao-subagente-esportes', 'documentacao-subagente-previsoes', 'documentacao-subagente-igaming'].includes(chapterId);
  return <div data-i18n="translated" data-testid="documentation-agent-training" data-training-owner={chapterId} data-documentation-training-addition="">
    <h3 id={`${chapterId}-estrategia-treino`} className="whitepaper__subhead">{x(copy.title)}</h3>
    <div className="whitepaper__prose">
      <p><code>{profile.strategy}</code>{specialist ? ` · ${chapterId.slice(-3).toUpperCase()}` : ''}</p>
      {future && <p>{x(copy.future)}</p>}
      {specialist && <p>{x(copy.specialist)}</p>}
      {(crypto || specialist) && <p>{x(copy.cryptoParameters)}</p>}
      <p><strong>{x(copy.inputs)}.</strong>{' '}{x(profile.input)}</p>
      <p><strong>{x(copy.rule)}.</strong>{' '}{x(profile.rule)}</p>
      {(crypto || specialist) && <p>{x(copy.cryptoExit)}</p>}
      {crypto && <><p>{x(copy.cryptoCalculation)}</p><p>{x(copy.cryptoRecord)}</p></>}
      <p><strong>{x(copy.output)}.</strong>{' '}{x(profile.output)}</p>
      <p><strong>{x(copy.technical)}.</strong>{' '}
        {specialist && <><a href="#documentacao-subagente-cripto-estrategia-treino">{x(copy.cryptoLink)}</a>{' · '}</>}
        {profile.references.map(([id, label]) => <span key={id}><a href={`#${id}`}>{x(label)}</a>{' · '}</span>)}
        <a href="#documentacao-protocolo-treino">{x(copy.protocolLink)}</a>{' · '}
        <a href="#documentacao-contrato-ordem">{x(copy.orderLink)}</a>
      </p>
    </div>
  </div>;
}
