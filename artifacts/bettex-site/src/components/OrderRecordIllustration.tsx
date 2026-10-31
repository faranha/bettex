import './OrderRecordIllustration.css';

type Labels = [string, string, string, string, string, string];

export function OrderRecordIllustration({ labels, caption }: { labels: Labels; caption: string }) {
  return (
    <figure className="ori">
      <div className="ori__body" data-i18n="translated" role="img" aria-label={`${caption}: ${labels.join(' → ')}`}>
        <svg className="ori__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line className="ori__spine" x1="50" y1="0" x2="50" y2="100" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="ori__list" aria-hidden="true">
          {labels.map((label, i) => (
            <li key={i} className="ori__item">
              <span className="ori__node">{i + 1}</span>
              <span className="ori__tick" />
              <span className="ori__label">{label}</span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="ori__caption">{caption}</figcaption>
    </figure>
  );
}

export default OrderRecordIllustration;
