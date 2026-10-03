import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const messages = JSON.parse(fs.readFileSync(path.join(root, 'src/lib/locales/translations.json'), 'utf8'));
const headline = 'Gigante americana das bets usou IA para encontrar apostadores mais propensos a perder';
const font = execFileSync('fc-match', ['-f', '%{file}', 'DejaVu Sans:style=Bold'], { encoding: 'utf8' }).trim();
for (const language of ['en', 'es']) {
  const title = messages[headline]?.[language];
  if (!title) throw new Error(`Missing ${language} newspaper headline`);
  execFileSync('magick', [
    path.join(root, 'public/noticia-ia-fundo.webp'),
    '-fill', '#020304', '-draw', 'rectangle 0,96 720,367',
    '(', '-size', '620x244', '-background', 'none', '-font', font,
    '-fill', 'white', '-pointsize', '43', '-gravity', 'northwest', `caption:${title}`, ')',
    '-geometry', '+54+104', '-compose', 'over', '-composite', '-quality', '90',
    path.join(root, `public/noticia-ia-fundo-${language}.webp`),
  ]);
  console.log(`Localized newspaper image: ${language}`);
}