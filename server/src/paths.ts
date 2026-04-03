import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const thisDir = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve a file under `src/data`. After `tsc`, JS lives in `dist/` but assets stay in `src/data`.
 * - `tsx`/dev: this file is under `src/` → `src/data/...` exists.
 * - `node dist/...`: this file is under `dist/` → use `../src/data/...`.
 */
export function resolveDataFile(...segments: string[]): string {
  const fromSrc = join(thisDir, 'data', ...segments);
  if (existsSync(fromSrc)) return fromSrc;
  return join(thisDir, '..', 'src', 'data', ...segments);
}
