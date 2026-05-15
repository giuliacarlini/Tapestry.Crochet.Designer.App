import { describe, expect, it } from 'vitest'
import { cleanIsolatedPixels } from './clean'

describe('cleanIsolatedPixels', () => {
  it('remove um pixel isolado no centro quando os vizinhos tem consenso', () => {
    const input = [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0,
    ]

    const cleaned = cleanIsolatedPixels(input, 3, 3, 2)
    expect(cleaned).toEqual([
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    ])
  })

  it('remove um pixel isolado na quina quando os vizinhos concordam', () => {
    const input = [
      1, 0,
      0, 0,
    ]

    const cleaned = cleanIsolatedPixels(input, 2, 2, 2)
    expect(cleaned).toEqual([
      0, 0,
      0, 0,
    ])
  })

  it('preserva detalhes finos quando o pixel nao esta isolado', () => {
    const input = [
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
    ]

    const cleaned = cleanIsolatedPixels(input, 3, 3, 2)
    expect(cleaned).toEqual(input)
  })

  it('remove micro-ilha de 2 pixels quando esta cercada por uma cor dominante', () => {
    const input = [
      0, 0, 0, 0,
      0, 1, 1, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]

    const cleaned = cleanIsolatedPixels(input, 4, 4, 2)
    expect(cleaned).toEqual([
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ])
  })

  it('preserva micro-ilha quando o entorno esta dividido sem dominancia clara', () => {
    const input = [
      0, 0, 2, 2, 2,
      0, 1, 1, 2, 2,
      0, 0, 2, 2, 2,
    ]

    const cleaned = cleanIsolatedPixels(input, 5, 3, 3)
    expect(cleaned).toEqual(input)
  })
})
