import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string };
const retryDelays = [500, 1500, 3000];

export function PreviewImage(props: Props) {
  return <RetryingImage key={props.src} {...props} />;
}

function RetryingImage({ src, onError, ...props }: Props) {
  const [attempt, setAttempt] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  const imageSrc = attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}image_retry=${attempt}`;

  return (
    <img {...props} src={imageSrc} onError={event => {
      if (attempt >= retryDelays.length) {
        console.error('Não foi possível carregar a imagem da prévia:', src);
        onError?.(event);
        return;
      }
      if (timer.current !== null) return;
      timer.current = setTimeout(() => {
        timer.current = null;
        setAttempt(previous => previous + 1);
      }, retryDelays[attempt]);
    }} />
  );
}