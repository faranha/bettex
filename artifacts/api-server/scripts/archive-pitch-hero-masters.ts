import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { ObjectStorageService, objectStorageClient } from '../src/lib/objectStorage';

// Keep the full-resolution, lossless masters in App Storage. Only small,
// compressed responsive delivery variants are included in the static website.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const files: string[] = JSON.parse(await readFile(
  resolve(root, 'generated-artifacts/pitch-high-resolution/masters.json'), 'utf8',
));
const publicPath = new ObjectStorageService().getPublicObjectSearchPaths()[0];
const [bucketName, ...prefix] = publicPath.split('/').filter(Boolean);
for (const file of files) {
  const localPath = resolve(root, file);
  const digest = createHash('sha256').update(await readFile(localPath)).digest('hex').slice(0, 16);
  await objectStorageClient.bucket(bucketName).upload(localPath, {
    destination: [...prefix, 'pitch-hero-masters', digest, basename(file)].join('/'),
    metadata: { contentType: 'image/png' },
  });
  console.log(`Archived master: ${basename(file)}`);
}
