import thesis from '@/lib/new-economy-thesis.json';
import './NewEconomySection.css';

const points = [
  { n: '01', title: 'O trabalho está mudando', text: 'IA e robôs vão substituir empregos e transferir a geração de valor para sistemas automatizados.' },
  { n: '02', title: 'Não fique fora dessa mudança', text: 'Quem depende só do salário pode ficar de fora dos ganhos gerados pela IA.' },
  { n: '03', title: 'A IA também pode trabalhar para você', text: 'BETTEX conecta você aos lucros elegíveis de estratégias com IA.' },
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
          <p>A BETTEX chegou para te ajudar a atravessar grandes períodos de incerteza.</p>
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
      </div>
    </section>
  );
}
