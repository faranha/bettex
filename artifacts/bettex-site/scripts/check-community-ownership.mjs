import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const activeFiles = [
  'src/App.tsx', 'src/pages/pitch.tsx',
  'src/components/HomeRevisionSections.tsx',
  'src/components/HomeWhaleSection.tsx',
  'src/components/ProjectModelSection.tsx',
  'src/components/pitch/PitchMissionHero.tsx',
  'src/components/pitch/PitchNarrative.tsx',
  'src/components/pitch/PitchTokenomics.tsx',
  'src/components/pitch/PitchFinalCommunity.tsx',
];
for (const file of activeFiles) {
  assert.doesNotMatch(readFileSync(`${root}/${file}`, 'utf8'),
    /nosso agente|nossa IA|nós descobrimos|nós sabemos quando entrar|sua parte dos lucros|sua parte é entregue/i,
    `Provider/customer framing returned in ${file}`);
}

const localized = [
  { prefix: '', ownership: 'dono da IA', technology: 'tecnologia', decentralization: 'descentraliza', founder: 'fundador', fund: 'não um fundo de investimentos', profit: 'lucro elegível' },
  { prefix: '/en', ownership: 'owner of the AI', technology: 'technology', decentralization: 'decentraliz', founder: 'founder', fund: 'not an investment fund', profit: 'eligible profit' },
  { prefix: '/es', ownership: 'dueño de la IA', technology: 'tecnología', decentralization: 'descentraliza', founder: 'fundador', fund: 'no un fondo de inversión', profit: 'beneficio' },
];
const plain = html => html.replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<[^>]*>/g, ' ').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ');

const server = await createServer({
  root,
  configFile: `${root}/vite.config.ts`,
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
});
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  for (const language of localized) {
    for (const suffix of ['/', '/pitch']) {
      const path = `${language.prefix}${suffix}`;
      const text = plain(render(path));
      for (const key of ['ownership', 'technology', 'decentralization', 'founder', 'fund', 'profit']) {
        assert.ok(text.toLowerCase().includes(language[key].toLowerCase()), `${path}: missing ${key}`);
      }
      if (language.prefix) {
        for (const pt of ['Com BETTEX, você se torna', 'A IA da comunidade', 'Os resultados também são seus', 'A apuração é diária', 'Ao comprar BETTEX']) {
          assert.ok(!text.includes(pt), `${path}: untranslated ownership copy: ${pt}`);
        }
      }
      if (suffix === '/pitch') {
        assert.ok(text.includes('25%'), `${path}: profit split missing`);
        assert.ok(text.includes('50%'), `${path}: treasury split missing`);
      }
      console.log(`Ownership, initial administration, risk and localization: ${path}`);
    }
  }
} finally {
  await server.close();
}
