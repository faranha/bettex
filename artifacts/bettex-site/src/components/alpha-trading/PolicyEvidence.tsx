/** @jsxImportSource react */
import type {TradingPolicyReference} from '@workspace/api-client-react';
import {useFmt} from './format';
export function PolicyEvidence({reference}: {reference?:TradingPolicyReference}) {
  const {x}=useFmt();
  return <details className="mt-2 rounded-lg border border-[#E4DCCB] p-2 text-xs">
    <summary className="cursor-pointer font-bold">{x('Política preservada na análise', 'Policy preserved at analysis', 'Política conservada en el análisis')}</summary>
    {!reference ? <p className="mt-2">{x('Sem política publicada vinculada. Este registro não autoriza alocação.', 'No published policy attached. This record does not authorize allocation.', 'Sin política publicada vinculada. Este registro no autoriza asignación.')}</p> :
      <dl className="mt-2 grid gap-2 break-all">
        <dt>{x('Composição', 'Composition', 'Composición')}</dt><dd className="font-mono">{reference.effectiveId}</dd>
        {(['treasury','strategy','specialist'] as const).map((key,i)=><div key={key}>
          <dt className="font-bold">{[x('Tesouraria','Treasury','Tesorería'),x('Estratégia','Strategy','Estrategia'),x('Especialista','Specialist','Especialista')][i]}</dt>
          <dd className="font-mono">{reference.versions[key]}<br/>{reference.hashes[key]}<br/>{reference.implementations[key]}</dd>
        </div>)}
        <dt>{x('Revisão registrada', 'Recorded revision', 'Revisión registrada')}</dt><dd>{reference.revision}</dd>
      </dl>}
  </details>;
}
