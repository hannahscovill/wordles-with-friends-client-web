/**
 * Validates that all required PUBLIC_* environment variables are set
 * before building or starting the dev server.
 *
 * Called via npm pre-hooks (prebuild, predev).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Load .env files the same way rsbuild does (later files override earlier ones).
// process.env values set externally (e.g. CI) always take precedence.
for (const name of ['.env', '.env.local']) {
  const filePath = resolve(process.cwd(), name);
  if (!existsSync(filePath)) continue;
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    // Don't overwrite values already in the environment (CI, shell exports, etc.)
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const required = [
  'PUBLIC_AUTH0_DOMAIN',
  'PUBLIC_AUTH0_CLIENT_ID',
  'PUBLIC_AUTH0_AUDIENCE',
  'PUBLIC_POSTHOG_KEY',
  'PUBLIC_ENVIRONMENT_NAME',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`\nMissing required environment variables:\n`);
  for (const key of missing) {
    console.error(`  - ${key}`);
  }
  console.error(
    `\nConfigure them in .env, .env.local, or your CI environment.\n`,
  );
  process.exit(1);
}
