/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';
import { trainingCopy as copy, trainingOrderPaths, trainingProfiles, type TrainingText } from '@/lib/documentation-training';
import { businessIntelligence, businessRules } from '@/lib/documentation-business';

function useTrainingText() {
  const locale = useLocale();
  return (value: TrainingText) => value[locale === 'en' ? 1 : locale === 'es' ? 2 : 0];
}

/** Development guidance, not a mandatory trading recipe or runtime engine. */
export function DocumentationTrainingProtocol() {
  const x = useTrainingText();
  return <div data-i18n="translated" data-testid="documentation-training-protocol" data-documentation-training-addition="">
    <h3 id="documentacao-protocolo-treino" className="whitepaper__subhead">{x(copy.protocolTitle)}</h3>
    <div className="whitepaper__prose">
      <p>{x(businessRules.training)}</p>
      <p>{x(businessRules.evaluation)}</p>
      <p>{x(businessIntelligence.visaoEstado)}</p>
      <details className="whitepaper__reference" data-documentation-reference>
        <summary>{x(['Referência técnica do registro de propostas', 'Technical proposal-record reference', 'Referencia técnica del registro de propuestas'])}</summary>
        <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}><code>{trainingOrderPaths.join('\n')}</code></pre>
      </details>
      <p><a href="#documentacao-contrato-ordem"><strong>{x(copy.orderLink)}</strong></a></p>
    </div>
  </div>;
}

export function DocumentationAgentTraining({ chapterId }: { chapterId: string }) {
  const x = useTrainingText();
  const specialist = chapterId.startsWith('documentacao-especialista-');
  const profile = trainingProfiles[specialist ? 'documentacao-subagente-cripto' : chapterId];
  if (!profile) return null;
  const retired = ['documentacao-subagente-esportes', 'documentacao-subagente-previsoes', 'documentacao-subagente-igaming'].includes(chapterId);
  return <div data-i18n="translated" data-testid="documentation-agent-training" data-training-owner={chapterId} data-documentation-training-addition="">
    <h3 id={`${chapterId}-estrategia-treino`} className="whitepaper__subhead">{x(copy.title)}</h3>
    <div className="whitepaper__prose">
      {retired ? <p>{x(businessRules.retired)}</p> : <>
        {specialist && <p>{x(businessRules.specialist)}</p>}
        {chapterId === 'documentacao-subagente-cripto' && <p>{x(businessIntelligence.agP1)}</p>}
        <p>{x(businessRules.training)}</p>
        <p>{x(businessRules.evaluation)}</p>
      </>}
      <p><a href="#documentacao-protocolo-treino">{x(copy.protocolLink)}</a>{' · '}
        <a href="#documentacao-contrato-ordem">{x(copy.orderLink)}</a>
        {specialist && <>{' · '}<a href="#documentacao-baseline-cripto">{x(['Referência técnica de Cripto', 'Crypto technical reference', 'Referencia técnica de Cripto'])}</a></>}
      </p>
    </div>
  </div>;
}
