import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const social = path.join(root, 'public/social');
const messages = JSON.parse(fs.readFileSync(path.join(root, 'src/lib/locales/translations.json'), 'utf8'));
const logo = execFileSync('magick', [
  path.join(social, 'home.jpg'), '-crop', '315x95+40+28', '+repage', 'png:-',
]).toString('base64');
const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const translate = (value, language) => language === 'pt' ? value : messages[value][language];
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bettex-home-social-'));
try {
  for (const language of ['pt', 'en', 'es']) {
    const text = (value) => escape(translate(value, language));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630">
      <defs><linearGradient id="bg"><stop stop-color="#070B1F"/><stop offset="1" stop-color="#13204F"/></linearGradient></defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <g fill="none" stroke="#2B59FF" stroke-opacity=".3"><circle cx="1080" cy="185" r="310"/><circle cx="1080" cy="185" r="395"/></g>
      <image x="40" y="28" width="315" height="95" xlink:href="data:image/png;base64,${logo}"/>
      <g font-family="DejaVu Sans" fill="#F4F1E8">
        <text x="65" y="155" font-size="17" letter-spacing="3">${text('COMUNIDADE ABERTA · TECNOLOGIA DEFI')}</text>
        <text x="65" y="250" font-size="57" font-weight="bold">${text('Comunidade aberta.')}</text>
        <text x="65" y="325" font-size="57" font-weight="bold" fill="#F2B632">${text('Tecnologia com IA.')}</text>
        <text x="65" y="405" font-size="27">${text('BETTEX é o token da comunidade.')}</text>
        <path d="M65 555H1135" stroke="#5F86FF" stroke-opacity=".3"/>
        <text x="65" y="593" font-size="17">${text('Conheça a comunidade')}</text>
      </g>
    </svg>`;
    const source = path.join(temp, `${language}.svg`);
    fs.writeFileSync(source, svg);
    execFileSync('magick', [source, '-quality', '90', path.join(social, language === 'pt' ? 'home.jpg' : `home-${language}.jpg`)]);
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}