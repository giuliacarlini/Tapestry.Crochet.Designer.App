import { describe, expect, it } from 'vitest'
import { createPattern } from '../pattern'
import { createProject } from './model'
import { deserializeProject, serializeProject } from './serialize'

function makePalette(size: number): string[] {
  return Array.from({ length: size }, (_, index) => {
    const channel = (index * 23).toString(16).padStart(2, '0')
    return `#${channel}${channel}${channel}`.toUpperCase()
  })
}

describe('Project serialization', () => {
  it('serializa e desserializa preservando settings e pattern', () => {
    const width = 100
    const height = 100
    const paletteSize = 8
    const pattern = createPattern(
      makePalette(paletteSize),
      Array.from({ length: width * height }, (_, index) => index % paletteSize),
      {
        title: 'Projeto Teste',
        config: { width, height, paletteSize },
      },
    )

    const project = createProject({
      pattern,
      cleanIsolated: true,
      name: 'Meu projeto',
    })

    const serialized = serializeProject(project)
    const restored = deserializeProject(serialized)

    expect(restored.version).toBe(1)
    expect(restored.metadata.name).toBe('Meu projeto')
    expect(restored.settings.width).toBe(width)
    expect(restored.settings.height).toBe(height)
    expect(restored.settings.paletteSize).toBe(paletteSize)
    expect(restored.pattern.cells).toHaveLength(width * height)
    expect(restored.pattern.palette).toHaveLength(paletteSize)
  })
})

