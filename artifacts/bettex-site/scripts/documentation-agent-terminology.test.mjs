import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { documentationAgentTerminology as terms, isDocumentationPath } from '../src/lib/documentation-agent-terminology.ts';
import { intelligenceCopy, intelligenceTranslations } from '../src/lib/documentation-intelligence.ts';
import { presentationCopy, presentationTranslations } from '../src/lib/documentation-intelligence-presentation.ts';
import { formatOutlineTitle, groupReferenceItems } from '../src/components/whitepaperOutline.ts';

test('reference menu groups all descendants without consuming adjacent sections or renumbering', () => {
  const make = (number, isReference = false) => ({ id: `item-${number}`, chapterId: 'chapter', number, title: number, level: 1, isReference });
  const items = [make('2.1'), make('2.3', true), make('2.3.1'), make('2.3.7'), make('2.3.7.1'), make('2.4'), make('2.5', true), make('2.5.1')];
  const groups = groupReferenceItems(items);
  assert.deepEqual(groups.map(group => group.item.number), ['2.1', '2.3', '2.4', '2.5']);
  assert.deepEqual(groups[1].children.map(item => item.number), ['2.3.1', '2.3.7', '2.3.7.1']);
  assert.deepEqual(groups[3].children.map(item => item.number), ['2.5.1']);
  assert.deepEqual(groupReferenceItems([]), []);
  assert.equal(groups[1].item, items[1]);
  assert.equal(groups[1].children[2], items[4]);
});

test('documentation menu omits terminal punctuation without changing meaningful commas or numbering', () => {
  for (const title of ['Visão.', 'Agente BETTEX e subagentes.', 'Tokenomics.', 'Participation and results.', 'Administración, seguridad y riesgos.']) {
    assert.equal(formatOutlineTitle(title), title.slice(0, -1));
  }
  assert.equal(formatOutlineTitle('  Administração, segurança\n e riscos.  '), 'Administração, segurança e riscos');
  assert.equal(formatOutlineTitle('2.1.1 Fórmula:'), '2.1.1 Fórmula');
  assert.equal(formatOutlineTitle('Roadmap'), 'Roadmap');
  assert.equal(formatOutlineTitle(undefined), '');
});

test('positioning transforms bettors into investors, never betting into investment', () => {
  const messages = JSON.parse(readFileSync(new URL('../src/lib/locales/translations.json', import.meta.url), 'utf8'));
  const source = JSON.parse(readFileSync(new URL('../src/lib/locales/source.json', import.meta.url), 'utf8'));
  const forbidden = [
    /\btransform(?:ar|ando)\s+(?:as?\s+)?apostas?\s+em\s+[^.]*\binvestimentos?\b/i,
    /\bturn(?:ing)?\s+betting\s+into\s+[^.]*\binvestment\b/i,
    /\btransform(?:ar|ando)\s+(?:(?:la|las)\s+)?apuestas?\s+en\s+[^.]*\binversi[oó]n\b/i,
  ];
  for (const text of [...source, ...Object.keys(messages), ...Object.values(messages).flatMap(Object.values)]) {
    if (typeof text !== 'string') continue;
    for (const pattern of forbidden) assert.doesNotMatch(text, pattern);
  }
  const claim = 'A proposta da BETTEX é transformar apostadores em investidores por meio de um projeto DeFAI';
  assert.ok(source.includes(claim));
  assert.match(messages[claim].en, /bettors into investors/);
  assert.match(messages[claim].es, /apostadores en inversores/);
});

test('wallet and optional games follow core participation and precede their full application rules', () => {
  const chapters = readFileSync(new URL('../src/components/WhitepaperChapters.tsx', import.meta.url), 'utf8');
  const staking = chapters.split("case 'documentacao-staking':")[1].split("case 'documentacao-roadmap':")[0];
  assert.ok(staking.includes('<DocumentationAppIntroduction />'));
  assert.ok(staking.indexOf('<DocumentationAppIntroduction />') > staking.indexOf('documentacao-exemplo'));
  assert.ok(staking.indexOf('<DocumentationAppIntroduction />') < staking.indexOf('documentacao-regras-demo'));
  const introduction = readFileSync(new URL('../src/components/DocumentationAppIntroduction.tsx', import.meta.url), 'utf8');
  for (const marker of ['Burn Lottery', 'Double 2X', '50/50',
    'todo o valor pago é queimado diretamente', 'the entire payment is burned directly', 'todo el importe pagado se quema directamente',
    'nunca créditos pendentes', 'never pending credits', 'nunca créditos pendientes',
    'derrota perde o valor jogado', 'a loss forfeits the played amount', 'perder supone perder el importe jugado',
    'exclusivamente visual', 'visual only', 'exclusivamente visual y',
    'controlar a carteira fora do aplicativo', 'control the wallet outside the application', 'controlar la cartera fuera del aplicativo']) {
    assert.ok(introduction.includes(marker), `App introduction omits ${marker}`);
  }
});

test('project overview keeps only a localized demo link, without a walkthrough', () => {
  const source = readFileSync(new URL('../src/components/DocumentationAppWalkthrough.tsx', import.meta.url), 'utf8');
  const chapters = readFileSync(new URL('../src/components/WhitepaperChapters.tsx', import.meta.url), 'utf8');
  assert.ok(chapters.includes('<DocumentationAppWalkthrough />'));
  assert.ok(chapters.indexOf('<DocumentationAppWalkthrough />') < chapters.indexOf('<div className="whitepaper__lead"><p>{c.visaoLead}'));
  assert.match(source, /<DemoAppLink/);
  for (const label of ['Explorar o demo BETTEX', 'Explore the BETTEX demo', 'Explorar el demo BETTEX']) assert.ok(source.includes(label));
  assert.match(source, /id="documentacao-percurso-demo"/);
  assert.doesNotMatch(source, /const steps|<h3|25 USDC|steps\.map/);
  const owned = readFileSync(new URL('../src/components/DocumentationOwnedContent.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(owned, /DocumentationDemoJourney/);
});

test('token utility identifies the community-only DeFi and decentralized AI project without changing rights', () => {
  const synthesis = JSON.parse(readFileSync(new URL('../src/lib/locales/documentation-synthesis.json', import.meta.url), 'utf8'));
  const key = 'BETTEX dá participação nos resultados conforme as regras. Não dá propriedade da tesouraria, voto automático ou resgate patrimonial. Não garante pagamento.';
  const markers = {
    pt: ['finanças descentralizadas', 'inteligência artificial descentralizada', 'exclusivamente pela própria comunidade', 'Não há instituição, fundação, empresa ou fundo', 'sem conceder propriedade da tesouraria, voto ou resgate', 'Pagamento não garantido'],
    en: ['decentralized finance', 'decentralized artificial intelligence', 'exclusively by its own community', 'no institution, foundation, company or fund', 'without granting treasury ownership, voting rights, or redemption', 'Payment is not guaranteed'],
    es: ['finanzas descentralizadas', 'inteligencia artificial descentralizada', 'exclusivamente por su propia comunidad', 'No hay institución, fundación, empresa ni fondo', 'sin otorgar propiedad de la tesorería, voto o rescate', 'No se garantiza el pago'],
  };
  for (const language of ['pt', 'en', 'es']) {
    for (const marker of markers[language]) assert.ok(synthesis[key][language].includes(marker), `${language} omits ${marker}`);
  }
});

test('tokenomics subtitle introduces DeFAI, DEX and decentralization instead of allocations', () => {
  const synthesis = JSON.parse(readFileSync(new URL('../src/lib/locales/documentation-synthesis.json', import.meta.url), 'utf8'));
  const key = '1 bilhão de BETTEX: 10% mint inicial, 55% comunidade, 20% fundador/equipe e 15% investidores; vesting de 24 meses.';
  for (const language of ['pt', 'en', 'es']) {
    const subtitle = synthesis[key][language];
    for (const term of ['DeFAI', 'DEX', { pt: 'descentralizadas', en: 'decentralized', es: 'descentralizadas' }[language]]) {
      assert.ok(subtitle.includes(term), `${language} omits ${term}`);
    }
    assert.doesNotMatch(subtitle, /\d|%|vesting/i);
  }
});

test('documentation openings name every trading market and the betting audience in all languages', () => {
  for (const language of ['pt', 'en', 'es']) {
    for (const key of ['hero', 'agP1']) {
      const text = intelligenceTranslations[intelligenceCopy[key]][language].toLowerCase();
      const sports = { pt: 'esportes (surebet)', en: 'sports (surebet)', es: 'deportes (surebet)' }[language];
      assert.doesNotMatch(text, /\besports\b/);
      for (const market of [sports, 'igaming', language === 'en' ? 'crypto' : 'cripto', 'predictions']) {
        assert.ok(text.includes(market), `${language}/${key} omits ${market}`);
      }
      if (key === 'hero') {
        assert.doesNotMatch(text, /[—–]|\bsubagents?\b|\bsubagentes?\b/);
        assert.ok(text.split(/\s+/).length <= 85, `${language}/hero is too detailed`);
      } else {
        assert.match(text, language === 'en' ? /\bsubagents?\b/ : /\bsubagentes?\b/);
        assert.ok(text.includes(language === 'en' ? 'each market' : 'cada mercado'));
        assert.ok(text.includes({ pt: 'seu próprio subagente', en: 'its own trading subagent', es: 'su propio subagente' }[language]));
        assert.ok(text.includes({ pt: 'se comunica', en: 'communicates', es: 'se comunica' }[language]));
      }
    }
    const audience = {
      pt: 'pessoas que hoje apostam e tratam apostas como investimento',
      en: 'people who currently bet and treat betting as an investment',
      es: 'personas que hoy apuestan y tratan las apuestas como una inversión',
    }[language];
    for (const key of ['hero']) {
      const text = intelligenceTranslations[intelligenceCopy[key]][language];
      assert.ok(text.includes(audience),
        `${language}/${key} omits the intended audience`);
      for (const concept of ['DeFi', 'DeFi AI', 'DeFAI', '100%',
        { pt: 'descentralizado', en: 'decentralized', es: 'descentralizado' }[language],
        { pt: 'independente', en: 'independent', es: 'independiente' }[language],
        { pt: 'sem operador centralizado', en: 'no centralized operator', es: 'sin operador centralizado' }[language]]) {
        assert.ok(text.includes(concept), `${language}/${key} omits ${concept}`);
      }
    }
  }
});

test('vision develops agentic reasoning and independence without repeating the market introduction', () => {
  const concepts = {
    pt: ['formular objetivos', 'incertezas', 'revisa estratégias', 'fundador', 'controles de risco', 'limites de autorização', 'desenvolvida e validada', 'sem garantia de retorno'],
    en: ['set objectives', 'uncertainty', 'revises strategies', 'founder', 'risk controls', 'authorization limits', 'developed and validated', 'no guarantee of returns'],
    es: ['formular objetivos', 'incertidumbres', 'revisa estrategias', 'fundador', 'controles de riesgo', 'límites de autorización', 'desarrollarse y validarse', 'sin garantía de rentabilidad'],
  };
  for (const language of ['pt', 'en', 'es']) {
    const reasoning = intelligenceTranslations[intelligenceCopy.visaoLead][language];
    const independence = intelligenceTranslations[intelligenceCopy.visaoIndependencia][language];
    const text = `${reasoning} ${independence}`;
    for (const concept of concepts[language]) assert.ok(text.includes(concept), `${language}/vision omits ${concept}`);
    assert.doesNotMatch(text, /[—–]|\besports\b|\biGaming\b|\bpredictions\b/);
    assert.notEqual(reasoning, intelligenceTranslations[intelligenceCopy.hero][language]);
  }
});

test('BETTEX orchestration explicitly depends on risk and treasury decision support in every presentation', () => {
  const markers = {
    pt: ['orquestração', 'risco', 'tesouraria', 'decisões'],
    en: ['orchestration', 'risk', 'treasury', 'decision'],
    es: ['orquestación', 'riesgo', 'tesorería', 'decisiones'],
  };
  for (const language of ['pt', 'en', 'es']) {
    for (const key of ['visaoLead', 'agentDefinition', 'subagentDefinition', 'agP1']) {
      const text = intelligenceTranslations[intelligenceCopy[key]][language].toLowerCase();
      for (const marker of markers[language]) assert.ok(text.includes(marker), `${language}/${key} omits ${marker}`);
    }
    const support = intelligenceTranslations[intelligenceCopy.subagentDefinition][language];
    for (const marker of { pt: ['capital', 'reservas', 'liquidez'], en: ['capital', 'reserves', 'liquidity'], es: ['capital', 'reservas', 'liquidez'] }[language]) {
      assert.ok(support.includes(marker), `${language}/treasury omits ${marker}`);
    }
  }
});

test('agent identity and roles use the present tense in all languages', () => {
  const keys = ['agentDefinition', 'subagentDefinition', 'visaoLead', 'agP1', 'agP2', 'agP3', 'agP5',
    'governanceDocumentation', 'coordination', 'risk', 'governance', 'treasury', 'learning', 'evaluation', 'governanceBaseline'];
  const future = /(?<!\p{L})(?:será|serão|terá|terão|deverá|deverão|coordenará|investigará|analisará|desenvolverá|comunicará|will|should|tendrá|deberá|desarrollará|comunicará)(?!\p{L})/iu;
  for (const language of ['pt', 'en', 'es']) {
    for (const key of keys) {
      assert.doesNotMatch(intelligenceTranslations[intelligenceCopy[key]][language], future, `${language}/${key} uses the future`);
    }
    const introduction = intelligenceTranslations[intelligenceCopy.agP1][language];
    assert.ok(introduction.startsWith({
      pt: 'O agente BETTEX é', en: 'The BETTEX agent is', es: 'El agente BETTEX es',
    }[language]));
  }
});

test('central agent stays distinct from specialized subagents in all languages', () => {
  assert.equal(terms('Agente BETTEX coordena agentes de risco. Agente de governança.', 'pt'),
    'Agente BETTEX coordena subagentes de risco. Subagente de governança.');
  assert.equal(terms('BETTEX AI coordinates agents. Risk agent and governance agent.', 'en'),
    'BETTEX agent coordinates subagents. Risk subagent and governance subagent.');
  assert.equal(terms('La IA BETTEX coordina agentes. Agente de riesgo.', 'es'),
    'El agente BETTEX coordina subagentes. Subagente de riesgo.');
});

test('trading specialties present analysis and contributions in every language, without future claims', () => {
  const component = readFileSync(new URL('../src/components/AgentIntelligence.tsx', import.meta.url), 'utf8');
  for (const market of ['crypto', 'sports', 'predictions', 'igaming']) {
    assert.ok(component.includes(`['documentacao-subagente-${market}', p.${market}Title, p.${market}, p.${market}Proposal]`));
    for (const language of ['pt', 'en', 'es']) {
      for (const key of [`${market}Title`, market, `${market}Proposal`]) {
        const text = presentationTranslations[presentationCopy[key]][language];
        assert.ok(text.length > 8, `${language}/${key} is missing`);
        assert.doesNotMatch(text, /(?<!\p{L})(?:será|terá|deverá|will|should|tendrá|deberá)(?!\p{L})/iu);
      }
      assert.ok(presentationTranslations[presentationCopy[`${market}Proposal`]][language].includes('BETTEX'));
    }
  }
  for (const language of ['pt', 'en', 'es']) {
    assert.doesNotMatch(presentationTranslations[presentationCopy.markets][language],
      /(?<!\p{L})(?:terá|comunicará|will|tendrá)(?!\p{L})/iu);
  }
});

test('normalization is idempotent and preserves spacing, amounts and identifiers', () => {
  for (const language of ['pt', 'en', 'es']) {
    const source = '  BETTEX · 50% / 25% / 25% · USDC · documentacao-agentes · agentes agents  ';
    const once = terms(source, language);
    assert.equal(terms(once, language), once);
    assert.ok(once.startsWith('  ') && once.endsWith('  '));
    assert.ok(once.includes('50% / 25% / 25% · USDC · documentacao-agentes'));
  }
});

test('central agent labels and their articles never duplicate the word agent', () => {
  assert.equal(terms('Tesouraria conectada ao agente de IA BETTEX; análises da IA BETTEX.', 'pt'),
    'Tesouraria conectada ao agente BETTEX; análises do agente BETTEX.');
  assert.equal(terms('BETTEX AI agent', 'en'), 'BETTEX agent');
  assert.equal(terms('Agente de IA BETTEX', 'es'), 'Agente BETTEX');
});

test('agent agreement is masculine, while intelligence agreement stays feminine', () => {
  assert.equal(terms('A IA BETTEX será desenvolvida. Sua inteligência será desenvolvida.', 'pt'),
    'O agente BETTEX será desenvolvido. Sua inteligência será desenvolvida.');
  assert.equal(terms('IA BETTEX · orquestradora', 'pt'), 'agente BETTEX · orquestrador');
  assert.equal(terms('IA BETTEX · orquestadora', 'es'), 'agente BETTEX · orquestador');
});

test('terminology applies only to documentation routes, including artifact prefixes', () => {
  for (const path of ['/documentacao', '/en/documentation/', '/es/documentacion#documentacao-agentes', '/bettex/documentacao']) {
    assert.equal(isDocumentationPath(path), true);
  }
  for (const path of ['/', '/pitch', '/en/pitch', '/app', '/app/documentacao-extra']) {
    assert.equal(isDocumentationPath(path), false);
  }
});
