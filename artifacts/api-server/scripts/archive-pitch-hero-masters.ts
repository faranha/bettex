import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Keep the full-resolution, lossless masters out of the static website: archive
// them under a local, git-ignored directory (default generated-artifacts/) keyed by
// content digest. Copy that directory to any backup storage you choose.
// Only small, compressed responsive delivery variants are shipped to the site.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const files: string[] = JSON.parse(await readFile(
  resolve(root, 'generated-artifacts/pitch-high-resolution/masters.json'), 'utf8',
));
const archiveRoot = resolve(root, process.env.PITCH_MASTERS_ARCHIVE_DIR ?? 'generated-artifacts/pitch-hero-masters');
for (const file of files) {
  const localPath = resolve(root, file);
  const digest = createHash('sha256').update(await readFile(localPath)).digest('hex').slice(0, 16);
  const target = resolve(archiveRoot, digest);
  await mkdir(target, { recursive: true });
  await copyFile(localPath, resolve(target, basename(file)));
  console.log(`Archived master: ${basename(file)}`);
}
