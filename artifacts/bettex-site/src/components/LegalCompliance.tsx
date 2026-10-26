import materials from '@/lib/documentation-materials.json';
import { DocumentationCryptoScope } from './DocumentationCryptoScope';

const policy = materials.sections.find(section => section.title === 'Adequação legal e jurídica');
if (!policy || policy.paragraphs.length !== 8) {
  throw new Error('Legal compliance documentation is missing or incomplete.');
}
const paragraphs = policy.paragraphs;

export function LegalCompliance() {
  return <>
    <div className="whitepaper__prose"><p>{paragraphs[0]}</p></div>
    <section id="documentacao-investigacao-tecnico-legal">
      <h3 className="whitepaper__subhead">Investigação técnico-legal e critérios de liberação</h3>
      <div className="whitepaper__prose">
        {paragraphs.slice(1, 4).map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </section>
    <section id="documentacao-disponibilidade-territorial">
      <h3 className="whitepaper__subhead">Disponibilidade por mercado e território</h3>
      <div className="whitepaper__prose">
        <DocumentationCryptoScope part="legal" />
        <p>{paragraphs[5]}</p>
      </div>
    </section>
    <section id="documentacao-revisao-juridica">
      <h3 className="whitepaper__subhead">Revisão contínua e controles de acesso</h3>
      <div className="whitepaper__prose">
        {paragraphs.slice(6).map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </section>
  </>;
}
