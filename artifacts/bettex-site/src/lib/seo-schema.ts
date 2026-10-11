/** Shared contract for initial HTML and client-side route transitions. */
export function pageSchema(input: {
  title: string; description: string; url: string; homeUrl: string;
  image: string; imageAlt: string; language: string;
}) {
  const { title, description, url, homeUrl, image, imageAlt, language } = input;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: title,
    description,
    url,
    inLanguage: language === 'pt' ? 'pt-BR' : language,
    primaryImageOfPage: {
      '@type': 'ImageObject', url: image, contentUrl: image,
      width: 1200, height: 630, caption: imageAlt,
    },
    isPartOf: {
      '@type': 'WebSite', '@id': `${homeUrl}#website`,
      name: 'BETTEX', url: homeUrl,
      inLanguage: language === 'pt' ? 'pt-BR' : language,
    },
  };
}
