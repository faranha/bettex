/**
 * Private release preservation. Never prints credentials or object contents.
 * Usage: node scripts/releases/preserve-storage.mjs <local-release-directory>
 * Input: workspace.tar.gz, development.dump, payload-manifest.json.
 * Output: storage-receipt.json. Refuses to overwrite an existing release.
 */
import { createRequire } from 'node:module';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, basename, join } from 'node:path';
import { createHash } from 'node:crypto';

const require = createRequire(resolve('artifacts/api-server/package.json'));
const { Storage } = require('@google-cloud/storage');
const directory = resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('A local release directory is required.');
const payload = JSON.parse(await readFile(join(directory, 'payload-manifest.json'), 'utf8'));
const privateRoot = process.env.PRIVATE_OBJECT_DIR;
if (!privateRoot) throw new Error('Private App Storage configuration is required.');
const [bucketName, ...segments] = privateRoot.replace(/^\/+/, '').split('/');
if (!bucketName || !segments.length) throw new Error('Invalid private storage root.');
const prefix = `${segments.join('/')}/canonical-releases/${payload.id}`;
const storage = new Storage({
  credentials: {
    audience: 'replit', subject_token_type: 'access_token',
    token_url: 'http://127.0.0.1:1106/token', type: 'external_account',
    credential_source: {
      url: 'http://127.0.0.1:1106/credential',
      format: { type: 'json', subject_token_field_name: 'access_token' },
    },
    universe_domain: 'googleapis.com',
  },
  projectId: '',
});
const destination = storage.bucket(bucketName);
const [existing] = await destination.getFiles({ prefix: `${prefix}/`, maxResults: 1 });
if (existing.length) throw new Error('Release destination already exists; never overwrite it.');
const acl = JSON.stringify({ owner: 'canonical-release-custodian', visibility: 'private' });
const receipt = {
  id: payload.id, createdAt: new Date().toISOString(),
  destination: { bucket: bucketName, prefix },
  objects: [], archives: [], status: 'incomplete',
};
// Snapshot original objects before uploading any release objects.
const roots = new Set([bucketName]);
for (const path of (process.env.PUBLIC_OBJECT_SEARCH_PATHS || '').split(',')) {
  const root = path.trim().replace(/^\/+/, '').split('/')[0];
  if (root) roots.add(root);
}
for (const name of roots) {
  const [files] = await storage.bucket(name).getFiles();
  for (const file of files) {
    if (file.name.includes('/canonical-releases/')) continue;
    const [before] = await file.getMetadata();
    const targetName = `${prefix}/app-storage/${name}/${file.name}`;
    const target = destination.file(targetName);
    await storage.bucket(name).file(file.name, { generation: before.generation }).copy(target, {
      preconditionOpts: { ifGenerationMatch: 0 },
      metadata: {
        metadata: { 'custom:aclPolicy': acl },
        cacheControl: 'private, no-store',
      },
    });
    // copy() can preserve source custom metadata; enforce privacy on the result.
    await target.setMetadata({
      metadata: { 'custom:aclPolicy': acl }, cacheControl: 'private, no-store',
    });
    const [after] = await target.getMetadata();
    if (JSON.parse(after.metadata?.['custom:aclPolicy'] || '{}').visibility !== 'private') {
      throw new Error('Storage backup privacy verification failed.');
    }
    if (before.size !== after.size || before.crc32c !== after.crc32c) {
      throw new Error('Storage copy integrity mismatch.');
    }
    receipt.objects.push({
      source: { bucket: name, name: file.name, generation: before.generation },
      backup: { name: targetName, generation: after.generation },
      size: before.size, crc32c: before.crc32c,
      originalMetadata: before,
    });
  }
}
for (const name of ['workspace.tar.gz', 'development.dump', 'payload-manifest.json']) {
  const filename = join(directory, name);
  await stat(filename);
  const [file] = await destination.upload(filename, {
    destination: `${prefix}/archives/${basename(filename)}`,
    preconditionOpts: { ifGenerationMatch: 0 },
    validation: 'crc32c',
    metadata: { metadata: { 'custom:aclPolicy': acl }, cacheControl: 'private, no-store' },
  });
  // Download and hash the durable copy, not just the local upload.
  const hash = createHash('sha256');
  for await (const chunk of file.createReadStream({ validation: 'crc32c' })) hash.update(chunk);
  const sha256 = hash.digest('hex');
  const expected = payload.archives?.[name]?.sha256;
  if (expected && expected !== sha256) throw new Error('Uploaded archive hash mismatch.');
  const [metadata] = await file.getMetadata();
  receipt.archives.push({ name, object: file.name, generation: metadata.generation, sha256, size: metadata.size });
}
receipt.status = 'verified';
receipt.completedAt = new Date().toISOString();
const receiptBytes = JSON.stringify(receipt, null, 2);
await destination.file(`${prefix}/storage-receipt.json`).save(receiptBytes, {
  resumable: false, preconditionOpts: { ifGenerationMatch: 0 },
  metadata: { metadata: { 'custom:aclPolicy': acl }, cacheControl: 'private, no-store' },
});
await writeFile(join(directory, 'storage-receipt.json'), receiptBytes, { mode: 0o600 });
console.log(JSON.stringify({
  status: receipt.status, objectsPreserved: receipt.objects.length,
  archivesVerified: receipt.archives.length,
}));
