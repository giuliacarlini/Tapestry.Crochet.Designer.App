import { describe, expect, it } from 'vitest'
import { floodFillCells } from './fill'

describe('floodFillCells', () => {
  it('preenche apenas a area contigua da mesma cor', () => {
    const width = 5
    const height = 4
    const cells = [
      0, 0, 1, 1, 1,
      0, 2, 2, 1, 3,
      0, 2, 1, 1, 3,
      4, 4, 1, 3, 3,
    ]

    const filled = floodFillCells(cells, width, height, 0, 9)

    expect(filled).toEqual([
      9, 9, 1, 1, 1,
      9, 2, 2, 1, 3,
      9, 2, 1, 1, 3,
      4, 4, 1, 3, 3,
    ])
  })

  it('nao altera quando a cor de destino e igual a cor atual', () => {
    const cells = [1, 1, 2, 2]
    const filled = floodFillCells(cells, 2, 2, 0, 1)

    expect(filled).toEqual(cells)
  })

  it('nao altera quando o indice inicial e invalido', () => {
    const cells = [0, 0, 1, 1]
    const filled = floodFillCells(cells, 2, 2, 10, 3)

    expect(filled).toEqual(cells)
  })
})

