/** Editorial terminology only; never changes permissions, IDs or financial rules. */
import { documentationOrderTerminology } from './documentation-order-terminology.ts';
type Language = 'pt' | 'en' | 'es';

export function isDocumentationPath(path: string): boolean {
  return /\/(?:documentacao|documentation|documentacion)\/?$/.test(path.split(/[?#]/)[0]);
}

function subagent(word: string, replacement: string): string {
  return word === word.toUpperCase() ? replacement.toUpperCase()
    : word[0] === word[0].toUpperCase() ? replacement[0].toUpperCase() + replacement.slice(1)
    : replacement;
}

export function documentationAgentTerminology(text: string, language: Language): string {
  text = documentationOrderTerminology(text, language);
  if (language === 'es') text = text.replace(/\btodo la ronda\b/g, 'toda la ronda');
  if (language === 'en') {
    return text
      .replace(/\bAgent and markets\b/gi, 'BETTEX agent and subagents')
      .replace(/\bBETTEX AI agent\b/g, 'BETTEX agent')
      .replace(/\bBETTEX AI\b/g, 'BETTEX agent')
      .replace('system that analyzes and operates markets under common risk and supervision.',
        'central intelligence that coordinates specialized subagents, with independent risk validation.')
      .replace(/\b(risk|governance|treasury|prediction|sports|iGaming|buyback and burn|equities and crypto|stocks and crypto|market) agent\b/gi,
        (_, role: string) => `${role} subagent`)
      .replace(/(?<![\w/-])agents(?![\w/-])/gi, word => subagent(word, 'subagents'))
      .replace(/\bBETTEX ↔ agent\b/g, 'BETTEX agent ↔ subagent');
  }
  if (language === 'es') {
    return text
      .replace(/\bAgente y mercados\b/gi, 'Agente BETTEX y subagentes')
      .replace(/\bagente de IA BETTEX\b/gi, word => subagent(word, 'agente BETTEX'))
      .replace(/\bLa IA BETTEX\b/g, 'El agente BETTEX')
      .replace(/\bla IA BETTEX\b/g, 'el agente BETTEX')
      .replace(/\bIA BETTEX\b/g, 'agente BETTEX')
      .replace(/\bagente BETTEX · orquestadora\b/g, 'agente BETTEX · orquestador')
      .replace('sistema que analiza y opera mercados bajo riesgo y supervisión comunes.',
        'inteligencia central que coordina subagentes especializados, con validación independiente de riesgo.')
      .replace(/\bagente (?=(?:de|del|de la) (?:riesgo|gobernanza|tesorería|predicciones|previsiones|deportes|iGaming|recompra|acciones|mercado))/gi,
        word => subagent(word, 'subagente '))
      .replace(/(?<![\w/-])agentes(?![\w/-])/gi, word => subagent(word, 'subagentes'))
      .replace(/\bBETTEX ↔ agente\b/g, 'Agente BETTEX ↔ subagente');
  }
  return text
    .replace(/\btodo a rodada\b/g, 'toda a rodada')
    .replace(/\bAgente e mercados\b/gi, 'Agente BETTEX e subagentes')
    .replace(/\bagente de IA BETTEX\b/gi, word => subagent(word, 'agente BETTEX'))
    .replace(/\bA IA BETTEX\b/g, 'O agente BETTEX')
    .replace(/\bda IA BETTEX\b/g, 'do agente BETTEX')
    .replace(/\bna IA BETTEX\b/g, 'no agente BETTEX')
    .replace(/\bpela IA BETTEX\b/g, 'pelo agente BETTEX')
    .replace(/\bà IA BETTEX\b/g, 'ao agente BETTEX')
    .replace(/\ba IA BETTEX\b/g, 'o agente BETTEX')
    .replace(/\bIA BETTEX\b/g, 'agente BETTEX')
    .replace(/\bagente BETTEX (será|foi|é|está) desenvolvida\b/g, 'agente BETTEX $1 desenvolvido')
    .replace(/\bagente BETTEX · orquestradora\b/g, 'agente BETTEX · orquestrador')
    .replace('sistema que analisa e opera mercados sob risco e supervisão comuns.',
      'inteligência central que coordena subagentes especializados, com validação independente de risco.')
    .replace(/\bagente (?=(?:de|da) (?:risco|governança|tesouraria|previsões|esportes|iGaming|recompra|ações|mercado))/gi,
      word => subagent(word, 'subagente '))
    .replace(/(?<![\w/-])agentes(?![\w/-])/gi, word => subagent(word, 'subagentes'))
    .replace(/\bBETTEX ↔ agente\b/g, 'Agente BETTEX ↔ subagente');
}
