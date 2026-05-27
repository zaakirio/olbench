import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Resolves correctly from both `src/modules` (dev via tsx) and
// `dist/modules` (compiled), since package.json sits two levels up in both.
const pkg = require('../../package.json');
export const VERSION = pkg.version;
//# sourceMappingURL=version.js.map