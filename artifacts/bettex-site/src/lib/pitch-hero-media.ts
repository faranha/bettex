import media from './pitch-hero-media.generated.json';

const BASE = import.meta.env.BASE_URL;
type Source = { path: string; width: number };
type Media = { sources: Source[] };

/** Pitch-only responsive sources; existing Homepage assets stay untouched. */
export function pitchHeroSrcSet(original: string): string | undefined {
  const entry = (media as Record<string, Media>)[original];
  return entry?.sources
    .map(source => `${BASE}${source.path} ${source.width}w`)
    .join(', ');
}
