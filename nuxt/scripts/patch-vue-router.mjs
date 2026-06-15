// @ts-check
// Nuxt 4 generates tsconfig with a vue-router/volar/sfc-route-blocks plugin reference
// that only exists in vue-router v5, not v4. This script creates a minimal stub
// so vue-tsc can load the plugin without crashing.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const vueRouterDir = resolve(root, 'node_modules', 'vue-router')
const pkgPath = resolve(vueRouterDir, 'package.json')

// Nothing to patch if vue-router doesn't exist at the top level
if (!existsSync(vueRouterDir)) {
  process.exit(0)
}

// Read existing package.json
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

// Already patched?
if (pkg.exports?.['./volar/sfc-route-blocks']) {
  process.exit(0)
}

// Create volar directory
const volarDir = resolve(vueRouterDir, 'volar')
if (!existsSync(volarDir)) {
  mkdirSync(volarDir, { recursive: true })
}

const stubCode = `module.exports = function() {
  return {
    version: 2.1,
    getEmbeddedCodes() { return [] },
    resolveEmbeddedCode() {}
  };
};`

const stubDts = `declare function plugin(): {
  version: 2.1;
  getEmbeddedCodes(): never[];
  resolveEmbeddedCode(): void;
};
export = plugin;`

writeFileSync(resolve(volarDir, 'sfc-route-blocks.js'), stubCode, 'utf8')
writeFileSync(resolve(volarDir, 'sfc-route-blocks.d.ts'), stubDts, 'utf8')

// Add the volar export to package.json
if (!pkg.exports) {
  pkg.exports = {}
}
pkg.exports['./volar/sfc-route-blocks'] = {
  types: './volar/sfc-route-blocks.d.ts',
  default: './volar/sfc-route-blocks.js'
}

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
