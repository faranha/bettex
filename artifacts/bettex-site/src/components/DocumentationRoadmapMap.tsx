import { roadmapStops } from './RoadmapSection';
import { DemoAppLink } from './DemoAppLink';
import { t } from '@/lib/i18n';
import './DocumentationRoadmapMap.css';

export function DocumentationRoadmapMap() {
  const last = roadmapStops.length - 1;
  return (
    <div id="documentacao-roadmap-mapa" className="docmap" data-testid="documentation-roadmap-milestones">
      <svg className="docmap__terrain" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse key={`a${i}`} cx="170" cy="130" rx={40 + i * 34} ry={22 + i * 20} />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={`b${i}`} cx="650" cy="430" rx={36 + i * 38} ry={26 + i * 22} />
          ))}
          <path d="M0 330h120v-40h90M800 90h-110v60h-70M300 600v-70h80v-50M520 0v60h-60v50" />
          <circle cx="120" cy="330" r="3" /><circle cx="620" cy="150" r="3" /><circle cx="380" cy="480" r="3" /><circle cx="460" cy="110" r="3" />
        </g>
      </svg>
      <ol className="docmap__list">
        {roadmapStops.map((stop, i) => {
          const demo = i === 0;
          const featured = Boolean((stop as { readonly featured?: boolean }).featured);
          return (
            <li key={stop.title} className={`docmap__stop${i % 2 ? ' docmap__stop--r' : ''}${featured ? ' docmap__stop--key' : ''}${demo ? ' docmap__stop--demo' : ''}`}>
              {i < last && (
                <svg className="docmap__trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <path className="docmap__trail-d" d={i % 2 ? 'M52 0C52 55 48 45 48 100' : 'M48 0C48 55 52 45 52 100'} />
                  <path className="docmap__trail-m" d="M0 0C0 55 0 45 0 100" />
                </svg>
              )}
              <span className="docmap__pin" aria-hidden="true"><i /></span>
              <div className="docmap__card">
                <span className="docmap__tag">{String(i + 1).padStart(2, '0')} / {stop.tag}</span>
                <strong className="docmap__title" role="heading" aria-level={3}>{stop.title}</strong>
                <p>{stop.date}. {stop.description}</p>
                {demo && <DemoAppLink className="docmap__demo">{t('Abrir o demo')}</DemoAppLink>}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="docmap__goal" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false"><circle cx="24" cy="24" r="20" /><circle cx="24" cy="24" r="11" /><path d="M24 2v10M24 36v10M2 24h10M36 24h10M17 17l14 14M31 17L17 31" /></svg>
      </div>
    </div>
  );
}

export default DocumentationRoadmapMap;
