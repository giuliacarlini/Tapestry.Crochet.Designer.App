import { describe, expect, it } from 'vitest'
import { quantizeMedianCut } from './quantize'

function buildFlatImage(width: number, height: number, r: number, g: number, b: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }
  return data
}

describe('Median cut quantization', () => {
  it('retorna exatamente 2 cores quando paletteSize = 2', () => {
    const width = 80
    const height = 80
    const input = buildFlatImage(width, height, 200, 40, 20)
    const quantized = quantizeMedianCut(input, width, height, 2)

    expect(quantized.palette).toHaveLength(2)
  })

  it('gera cells com comprimento width x height', () => {
    const width = 100
    const height = 120
    const input = buildFlatImage(width, height, 10, 180, 120)
    const quantized = quantizeMedianCut(input, width, height, 6)

    expect(quantized.width).toBe(width)
    expect(quantized.height).toBe(height)
    expect(quantized.cells).toHaveLength(width * height)
  })
})
