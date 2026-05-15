/**
 * Reads tokens.json (W3C DTCG / Tokens Studio format) and generates
 * a CSS file with custom properties.
 *
 * Usage:  node tokens/build.mjs
 * Output: src/tokens.css
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TOKENS_PATH = resolve(__dirname, 'tokens.json')
const OUTPUT_PATH = resolve(__dirname, '..', 'src', 'tokens.css')

function flatten(obj, prefix = '') {
  const entries = []

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}-${key}` : key

    if (value && typeof value === 'object' && '$value' in value) {
      entries.push({ name: `--${path}`, value: value.$value })
    } else if (value && typeof value === 'object') {
      entries.push(...flatten(value, path))
    }
  }

  return entries
}

const tokens = JSON.parse(readFileSync(TOKENS_PATH, 'utf-8'))
const vars = flatten(tokens)

const lines = [
  '/* Auto-generated from tokens/tokens.json — do not edit by hand */',
  '/* Run: npm run tokens:build */',
  '',
  ':root {',
  ...vars.map(({ name, value }) => `  ${name}: ${value};`),
  '}',
  '',
]

writeFileSync(OUTPUT_PATH, lines.join('\n'), 'utf-8')
console.log(`✓ Generated ${vars.length} CSS custom properties → ${OUTPUT_PATH}`)
