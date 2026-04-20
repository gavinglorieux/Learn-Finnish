// Generates PNG icons from public/favicon.svg at several sizes for PWA + Apple touch.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const svg = readFileSync(resolve(root, 'public/favicon.svg'))

const iconsDir = resolve(root, 'public/icons')
mkdirSync(iconsDir, { recursive: true })

const render = (size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()

const targets = [
  { path: 'public/icons/icon-192.png', size: 192 },
  { path: 'public/icons/icon-512.png', size: 512 },
  { path: 'public/icons/icon-512-maskable.png', size: 512 },
  { path: 'public/icons/apple-touch-icon.png', size: 180 }
]

for (const t of targets) {
  writeFileSync(resolve(root, t.path), render(t.size))
  console.log('wrote', t.path, t.size)
}
