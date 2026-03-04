function getNeighborIndices(index: number, width: number, height: number): number[] {
  const x = index % width
  const y = Math.floor(index / width)
  const neighbors: number[] = []

  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) {
        continue
      }

      const nx = x + offsetX
      const ny = y + offsetY

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
        continue
      }

      neighbors.push(ny * width + nx)
    }
  }

  return neighbors
}

export function cleanIsolatedPixels(
  cells: number[],
  width: number,
  height: number,
  paletteSize: number,
): number[] {
  const result = [...cells]

  for (let index = 0; index < cells.length; index += 1) {
    const color = cells[index]
    const neighbors = getNeighborIndices(index, width, height)
    const counts = new Array<number>(paletteSize).fill(0)

    for (const neighborIndex of neighbors) {
      const neighborColor = cells[neighborIndex]
      counts[neighborColor] += 1
    }

    const sameColorNeighbors = counts[color]
    let dominantColor = color
    let dominantCount = 0

    for (let paletteIndex = 0; paletteIndex < counts.length; paletteIndex += 1) {
      if (counts[paletteIndex] > dominantCount) {
        dominantCount = counts[paletteIndex]
        dominantColor = paletteIndex
      }
    }

    if (dominantColor !== color && sameColorNeighbors <= 1 && dominantCount >= 5) {
      result[index] = dominantColor
    }
  }

  return result
}
