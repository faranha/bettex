import g from '@/lib/growth-strategy.json';
import './growth.css';
import './FounderProfilePitch.css';
import './FounderProfileAnonymous.css';

const f = g.founder;

export function FounderProfile({ dark = false, id, doc = false, thirdPerson = false }: { dark?: boolean; id?: string; portrait?: boolean; noDashes?: boolean; doc?: boolean; thirdPerson?: boolean }) {
  return <figure id={id} className={`fp fp--anonymous${dark ? ' fp--dark' : ''}${doc ? ' fp--doc' : ''}${thirdPerson && !doc ? ' fp--pitch' : ''}`} aria-label="Apresentação do fundador">
    <span className="mono text-[10px] font-bold uppercase tracking-[.14em]" style={{ color: dark ? '#F2B632' : '#2B59FF' }}>Experiência de mercado e audiência própria</span>
    <p className="fp__quote">{f.biography}</p>
    <figcaption className="fp__who"><strong>Fundador da BETTEX · identidade reservada</strong></figcaption>
    <ul className="fp__grid">
      <li><strong>Experiência</strong><small>Trajetória no mercado e no desenvolvimento de operações.</small></li>
      <li><strong>Audiência</strong><small>Comunidade própria e canais de relacionamento com o público.</small></li>
      <li><strong>Estratégia</strong><small>Coordenação do projeto, com IA e serviços especializados.</small></li>
    </ul>
    <p className="fp__cap">A identidade do fundador permanece reservada nesta fase do projeto.</p>
  </figure>;
}
