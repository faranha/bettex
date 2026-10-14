import './extract-locales.mjs';
import fs from 'node:fs';
import { intelligenceTranslations } from '../src/lib/documentation-intelligence.ts';
import { presentationTranslations } from '../src/lib/documentation-intelligence-presentation.ts';
import { orderStandardTranslations } from '../src/lib/documentation-order-standard.ts';
const root = new URL('../src/lib/locales/', import.meta.url);
const source = JSON.parse(fs.readFileSync(new URL('source.json', root), 'utf8'));
const catalog = fs.readFileSync(new URL('translations.json', root), 'utf8');
const messages = { ...JSON.parse(catalog),
  ...JSON.parse(fs.readFileSync(new URL('documentation-architecture.json', root), 'utf8')),
  ...JSON.parse(fs.readFileSync(new URL('english-source-messages.json', root), 'utf8')),
  ...intelligenceTranslations, ...presentationTranslations, ...orderStandardTranslations };
const failures = [];
const seen = new Set();
let depth = 0;
let expectsKey = false;
for (const [token] of catalog.matchAll(/"(?:[^"\\]|\\.)*"|[{}\[\],:]/g)) {
  if (token === '{' || token === '[') {
    depth++;
    if (depth === 1) expectsKey = true;
  } else if (token === '}' || token === ']') {
    depth--;
  } else if (token === ',' && depth === 1) {
    expectsKey = true;
  } else if (token.startsWith('"') && depth === 1 && expectsKey) {
    const key = JSON.parse(token);
    if (seen.has(key)) failures.push(`duplicate translation key: ${key}`);
    seen.add(key);
    expectsKey = false;
  }
}
for (const key of source) {
  for (const language of ['en', 'es']) {
    const target = messages[key]?.[language];
    if (typeof target !== 'string' || !target.trim()) { failures.push(`${language}: ${key}`); continue; }
    const placeholders = value => [...value.matchAll(/\{\d+\}/g)].map(match => match[0]).sort().join(',');
    if (placeholders(key) !== placeholders(target)) failures.push(`${language} placeholders: ${key}`);
  }
}
if (failures.length) throw new Error(`Incomplete localization (${failures.length}). Update all three languages before building:\n${failures.slice(0,20).join('\n')}`);
console.log(`Localization coverage: ${source.length} messages, complete EN/ES, matching dynamic placeholders and no duplicate catalog keys.`);