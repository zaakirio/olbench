import { createRequire } from 'module';

const require = createRequire(import.meta.url);

interface PackageJson {
  version: string;
}

// Resolves correctly from both `src/modules` (dev via tsx) and
// `dist/modules` (compiled), since package.json sits two levels up in both.
const pkg = require('../../package.json') as PackageJson;

export const VERSION: string = pkg.version;
