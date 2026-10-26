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
  { prefix: '', ownership: ['dono da IA', 'dono do token'], technology: 'tecnologia', decentralization: 'descentraliza', founder: 'fundador', fund: 'não um fundo de investimentos', profit: 'lucro elegível', voting: 'votar', rules: 'regras digitais', company: ['sem empresa ou fundo', 'não existe empresa'], demo: ['demo não oferece votação real', 'não no demo atual'] },
  { prefix: '/en', ownership: ['owner of the AI', 'own the token'], technology: 'technology', decentralization: 'decentraliz', founder: 'founder', fund: 'not an investment fund', profit: 'eligible profit', voting: 'vote', rules: 'digital', company: ['no company or fund', 'no company, fund'], demo: ['demo does not offer real voting', 'not in the current demo'] },
  { prefix: '/es', ownership: ['dueño de la IA', 'dueño del token'], technology: 'tecnología', decentralization: 'descentraliza', founder: 'fundador', fund: 'no un fondo de inversión', profit: 'beneficio', voting: 'votar', rules: 'reglas digitales', company: ['sin empresa ni fondo', 'no hay empresa'], demo: ['demo no ofrece votación real', 'no en el demo actual'] },
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
      assert.doesNotMatch(text, /\bpix\b/i, `${path}: removed payment method returned`);
      assert.doesNotMatch(text, /recebimento em reais|recebe no Pix|payouts? in reais|cobros? en reales/i, `${path}: fiat payout promise returned`);
      assert.ok(text.includes('USDC'), `${path}: crypto settlement missing`);
      for (const key of ['technology', 'decentralization', 'founder', 'fund', 'profit', 'voting', 'rules']) {
        assert.ok(text.toLowerCase().includes(language[key].toLowerCase()), `${path}: missing ${key}`);
      }
      for (const key of ['ownership', 'company']) {
        assert.ok(language[key].some(phrase => text.toLowerCase().includes(phrase.toLowerCase())), `${path}: missing ${key}`);
      }
      if (language.prefix) {
        for (const pt of ['Com BETTEX, você se torna', 'A IA da comunidade', 'Os resultados também são seus', 'A apuração é diária', 'Ao comprar BETTEX']) {
          assert.ok(!text.includes(pt), `${path}: untranslated ownership copy: ${pt}`);
        }
      }
      if (suffix === '/pitch') {
        assert.ok(language.demo.some(phrase => text.toLowerCase().includes(phrase.toLowerCase())), `${path}: missing demo scope`);
        assert.ok(text.includes('25%'), `${path}: profit split missing`);
        assert.ok(text.includes('50%'), `${path}: treasury split missing`);
      }
      console.log(`Community ownership, DeFi, digital rules, planned voting, risk and localization: ${path}`);
    }
  }
} finally {
  await server.close();
}
