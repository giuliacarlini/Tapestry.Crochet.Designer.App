import { describe, expect, it } from 'vitest'
import { createPattern } from './model'
import { deserializePattern, serializePattern } from './serialize'

function makePalette(size: number): string[] {
  return Array.from({ length: size }, (_, index) => {
    const channel = (index * 17).toString(16).padStart(2, '0')
    return `#${channel}${channel}${channel}`.toUpperCase()
  })
}

describe('Pattern serialization', () => {
  it('serialize and deserialize Pattern mantendo esquema dinamico', () => {
    const width = 80
    const height = 80
    const paletteSize = 6
    const cells = Array.from({ length: width * height }, (_, index) => index % paletteSize)

    const pattern = createPattern(makePalette(paletteSize), cells, {
      title: 'Teste',
      config: { width, height, paletteSize },
    })

    const serialized = serializePattern(pattern)
    const restored = deserializePattern(serialized)

    expect(restored.width).toBe(width)
    expect(restored.height).toBe(height)
    expect(restored.palette).toHaveLength(paletteSize)
    expect(restored.cells).toHaveLength(width * height)
    expect(restored.metadata.title).toBe('Teste')
  })
})
