/** Business orders only. Evidence requests and HTTP requests are different concepts. */
export function documentationOrderTerminology(text: string, language: 'pt' | 'en' | 'es'): string {
  if (!/autoriza|authoriz|reserv|compromiss|commitment|execu|ejecu|exposi|exposu|conector|connector|ordem|ordens|orders?|órdenes|orden\b/i.test(text)) return text;
  if (language === 'en') return text.replace(
    /(?<!HTTP )\brequests?\b(?!\s+(?:(?:for|of)\s+)?(?:(?:additional|more|new|further)\s+)?(?:evidence|information|clarification|explanations?|analysis|analyses|investigation))/gi,
    word => word[0] === word[0].toUpperCase() ? (word.toLowerCase() === 'requests' ? 'Orders' : 'Order') : (word === 'requests' ? 'orders' : 'order'));
  if (language === 'es') return text.replace(
    /\bsolicitud(?:es)?\b(?!\s+de\s+(?:evidencias?|información|aclaraciones?))/gi,
    word => word[0] === word[0].toUpperCase() ? (word.toLowerCase() === 'solicitudes' ? 'Órdenes' : 'Orden') : (word === 'solicitudes' ? 'órdenes' : 'orden'));
  const gender: Record<string, string> = { ao: 'à', aos: 'às', do: 'da', dos: 'das', no: 'na', nos: 'nas', pelo: 'pela', pelos: 'pelas', o: 'a', os: 'as', um: 'uma', uns: 'umas', mesmo: 'mesma', mesmos: 'mesmas', novo: 'nova', novos: 'novas', outro: 'outra', outros: 'outras', único: 'única', únicos: 'únicas', este: 'esta', estes: 'estas', esse: 'essa', esses: 'essas' };
  return text.replace(
    /(?<![\p{L}\p{N}_])((?:(?:ao|aos|do|dos|no|nos|pelo|pelos|o|os|um|uns|mesmo|mesmos|novo|novos|outro|outros|único|únicos|este|estes|esse|esses|cada)\s+)*)(pedidos?)\b(?!\s+de\s+(?:evidências?|informações|informação|esclarecimentos?))/giu,
    (_, prefix: string, noun: string) => prefix.replace(/\S+/g, word => {
      const replacement = gender[word.toLowerCase()];
      return !replacement ? word : word[0] === word[0].toUpperCase() ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
    }) + (noun[0] === noun[0].toUpperCase() ? (noun.toLowerCase() === 'pedidos' ? 'Ordens' : 'Ordem') : noun === 'pedidos' ? 'ordens' : 'ordem'))
    .replace(/\b(ordem|ordens) (recusad|autorizad|enviad|registrad|vinculad|executad|nov|distint|idêntic)o(s?)\b/gi, '$1 $2a$3');
}
