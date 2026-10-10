import thesis from '@/lib/new-economy-thesis.json';
import { CommunityCTA } from './CommunityCTA';
import './NewEconomySection.css';

const points = [
  { n: '01', title: 'Entenda o que está mudando', text: 'IA e robôs estão transformando empregos e mercados. Na comunidade, discutimos como isso afeta a nossa vida.' },
  { n: '02', title: 'Conheça a BETTEX por dentro', text: 'Acompanhe como o agente de IA opera e como o token conecta você à participação nos resultados, quando houver lucro elegível.' },
];

export function NewEconomySection() {
  return (
    <section id="nova-economia" className="ne-section" aria-labelledby="ne-heading" data-testid="section-nova-economia">
      <div className="ne-bg" aria-hidden="true" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}new-economy-workplace.webp)` }} />
      <div className="ne-hero">
        <div className="ne-wrap">
          <h2 id="ne-heading">{thesis.statement} <em>Faça parte dessa conversa. Proteja-se da mudança. Proteja a sua família.</em></h2>
        </div>
      </div>
      <div className="ne-wrap">
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
        <CommunityCTA source="nova-economia" label="Entre na comunidade" note="A conversa continua no Telegram." />
      </div>
    </section>
  );
}
