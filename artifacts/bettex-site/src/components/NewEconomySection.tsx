import { ArrowRight } from 'lucide-react';
import thesis from '@/lib/new-economy-thesis.json';
import './NewEconomySection.css';

const DOC_LINK = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/documentacao#documentacao-oportunidade`;

const points = [
  { n: '01', title: 'Substituição de trabalho humano', text: thesis.vision },
  { n: '02', title: 'O risco de ficar fora dos ganhos', text: thesis.exclusion },
  { n: '03', title: 'Participação na economia programável', text: thesis.purpose },
];

export function NewEconomySection() {
  return (
    <section id="nova-economia" className="ne-section" aria-labelledby="ne-heading" data-testid="section-nova-economia">
      <div className="ne-wrap">
        <div className="ne-topline">
          <span className="ne-kicker">A nova economia</span>
          <span className="ne-detail">Tecnologia, trabalho e participação</span>
        </div>
        <div className="ne-head">
          <h2 id="ne-heading">{thesis.statement} <em>{thesis.question}</em></h2>
          <figure className="ne-visual">
            <img src={`${import.meta.env.BASE_URL}new-economy-workplace.webp`} alt="Substituição de trabalho humano" width={1024} height={1024} loading="lazy" decoding="async" />
          </figure>
          <p>{thesis.purpose}</p>
        </div>
        <ol className="ne-list">
          {points.map((p) => (
            <li key={p.n} className="ne-item">
              <span className="ne-num">{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ol>
        <a href={DOC_LINK} className="ne-link tap" data-testid="link-nova-economia-documentacao">Ler a oportunidade na documentação <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
      </div>
    </section>
  );
}
