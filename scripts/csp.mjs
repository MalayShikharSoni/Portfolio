// Keeps the Content-Security-Policy in vercel.json in step with the built site.
//
// The policy allows same-origin scripts only, plus the SHA-256 hash of each inline script
// that must stay inline (the theme snippet in src/layouts/Base.astro, which has to run before
// first paint). Edit that snippet and its hash changes, so:
//
//   npm run build && npm run csp          rewrite the hash in vercel.json
//   npm run build && npm run csp:check    fail (exit 1) if vercel.json is out of date (CI)
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const CONFIG = 'vercel.json';
const check = process.argv.includes('--check');

/** All .html files under dist/. */
function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

/** Inline scripts the browser would execute (no src, JavaScript type). */
const INLINE = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
const isJs = (attrs) => {
  const type = /\btype=["']?([^"'\s>]+)/.exec(attrs)?.[1];
  return !type || type === 'module' || type === 'text/javascript';
};

const hashes = new Set();
for (const file of htmlFiles(DIST)) {
  for (const [, attrs, body] of readFileSync(file, 'utf8').matchAll(INLINE)) {
    if (!isJs(attrs) || !body.trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
}

const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
const header = config.headers
  .flatMap((rule) => rule.headers)
  .find((h) => h.key === 'Content-Security-Policy');
if (!header) throw new Error('No Content-Security-Policy header in vercel.json');

const directives = header.value
  .split(';')
  .map((d) => d.trim())
  .filter(Boolean);
const index = directives.findIndex((d) => d.startsWith('script-src'));
const wanted = `script-src 'self' ${[...hashes].sort().join(' ')}`.trim();

if (directives[index] === wanted) {
  console.log(
    `CSP up to date (${hashes.size} inline script hash${hashes.size === 1 ? '' : 'es'}).`,
  );
  process.exit(0);
}
if (check) {
  console.error('vercel.json CSP is out of date with the build. Run: npm run build && npm run csp');
  console.error(`  expected: ${wanted}`);
  console.error(`  found:    ${directives[index]}`);
  process.exit(1);
}
directives[index] = wanted;
header.value = directives.join('; ');
writeFileSync(CONFIG, JSON.stringify(config, null, 2) + '\n');
console.log(`Updated vercel.json: ${wanted}`);
