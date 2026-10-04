import thesis from '@/lib/new-economy-thesis.json';
import './NewEconomySection.css';

const points = [
  { n: '01', title: 'Entenda o que está mudando', text: 'IA e robôs estão transformando empregos e mercados. Na comunidade, discutimos como isso afeta a nossa vida.' },
  { n: '02', title: 'Troque ideias e participe', text: 'Depender só do salário pode deixar você de fora dessa mudança. Na comunidade, trocamos conhecimento e ideias.' },
  { n: '03', title: 'Conheça a BETTEX por dentro', text: 'Acompanhe como a IA faz as operações e como nosso token permite participar dos lucros do projeto.' },
];

export function NewEconomySection() {
  return (
    <section id="nova-economia" className="ne-section" aria-labelledby="ne-heading" data-testid="section-nova-economia">
      <div className="ne-bg" aria-hidden="true" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}new-economy-workplace.webp)` }} />
      <div className="ne-wrap">
        <p className="ne-bridge">Das apostas ao futuro do trabalho, a tecnologia já muda as regras. A comunidade BETTEX é onde essa conversa começa.</p>
        <h2 id="ne-heading">{thesis.statement} <em>Participe dessa mudança com a nossa comunidade.</em></h2>
        <ol className="ne-list">
          {points.map((p) => (
            <li key={p.n} className="ne-item">
              <span className="ne-num">{p.n}</span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
