/** Presentation vocabulary only. API identifiers, URLs and unrelated economic cycles stay intact. */
export function roundTerminology(input: string, locale: 'pt' | 'en' | 'es'): string {
  if (/^https?:\/\//.test(input)) return input;
  const protectedPhrases: string[] = [];
  let text = input.replace(/\b(?:economic|business|market|innovation)\s+cycles?\b|\bciclos?\s+(?:econ[oôó]mic[oa]s?|de inovação|de innovación|de mercado)\b/gi, phrase => {
    protectedPhrases.push(phrase); return `@@MACRO${protectedPhrases.length - 1}@@`;
  });
  const casing = (original: string, replacement: string) => original === original.toUpperCase() ? replacement.toUpperCase() : /^[A-ZÁÀÉÍÓÚ]/.test(original) ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
  text = text.replace(locale === 'en' ? /\bcycles?\b/gi : /\bciclos?\b/gi, word => casing(word, locale === 'en' ? `round${/s$/i.test(word) ? 's' : ''}` : `${locale === 'pt' ? 'rodada' : 'ronda'}${/s$/i.test(word) ? 's' : ''}`));
  if (locale !== 'en') {
    const noun = locale === 'pt' ? 'rodadas?' : 'rondas?';
    const articles: Record<string, string> = locale === 'pt'
      ? { o:'a', os:'as', do:'da', dos:'das', no:'na', nos:'nas', ao:'à', aos:'às', um:'uma', uns:'umas', este:'esta', estes:'estas', esse:'essa', esses:'essas', neste:'nesta', nestes:'nestas', nesse:'nessa', nesses:'nessas', deste:'desta', destes:'destas', desse:'dessa', desses:'dessas', nenhum:'nenhuma', nenhuns:'nenhumas', algum:'alguma', alguns:'algumas', todo:'toda', todos:'todas' }
      : { el:'la', los:'las', del:'de la', al:'a la', un:'una', unos:'unas', este:'esta', estos:'estas', ese:'esa', esos:'esas', todo:'toda', todos:'todas' };
    const adjectives: Record<string, string> = locale === 'pt'
      ? { diário:'diária', diários:'diárias', próximo:'próxima', próximos:'próximas', último:'última', últimos:'últimas', novo:'nova', novos:'novas', mesmo:'mesma', mesmos:'mesmas', encerrado:'encerrada', encerrados:'encerradas', concluído:'concluída', concluídos:'concluídas', retido:'retida', retidos:'retidas', positivo:'positiva', positivos:'positivas', negativo:'negativa', negativos:'negativas', completo:'completa', completos:'completas', inteiro:'inteira', inteiros:'inteiras', aberto:'aberta', abertos:'abertas' }
      : { diario:'diaria', diarios:'diarias', próximo:'próxima', próximos:'próximas', último:'última', últimos:'últimas', nuevo:'nueva', nuevos:'nuevas', mismo:'misma', mismos:'mismas', cerrado:'cerrada', cerrados:'cerradas', concluido:'concluida', concluidos:'concluidas', retenido:'retenida', retenidos:'retenidas', positivo:'positiva', positivos:'positivas', negativo:'negativa', negativos:'negativas', completo:'completa', completos:'completas', entero:'entera', enteros:'enteras', abierto:'abierta', abiertos:'abiertas' };
    const adjectiveWords = Object.keys(adjectives).join('|');
    text = text.replace(new RegExp(`\\b(${adjectiveWords})\\s+(${noun})\\b`, 'gi'), (_, adjective: string, n: string) => `${casing(adjective, adjectives[adjective.toLowerCase()])} ${n}`);
    text = text.replace(new RegExp(`\\b(${noun})\\s+(${adjectiveWords})\\b`, 'gi'), (_, n: string, adjective: string) => `${n} ${casing(adjective, adjectives[adjective.toLowerCase()])}`);
    text = text.replace(new RegExp(`\\b(${Object.keys(articles).join('|')})\\s+((?:(?:${Object.values(adjectives).join('|')}|atual|actual|anterior|seguinte)\\s+)?${noun})\\b`, 'gi'), (_, article: string, rest: string) => `${casing(article, articles[article.toLowerCase()])} ${rest}`);
  }
  return text.replace(/@@MACRO(\d+)@@/g, (_, index: string) => protectedPhrases[Number(index)]!);
}
