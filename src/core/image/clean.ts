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

function getRequiredDominantCount(neighborCount: number): number {
  return Math.ceil((neighborCount * 2) / 3)
}

function runIsolatedPixelPass(
  cells: number[],
  width: number,
  height: number,
  paletteSize: number,
): { next: number[]; changed: boolean } {
  const next = [...cells]
  let changed = false

  for (let index = 0; index < cells.length; index += 1) {
    const color = cells[index]
    const neighbors = getNeighborIndices(index, width, height)
    if (neighbors.length === 0) {
      continue
    }

    const counts = new Array<number>(paletteSize).fill(0)

    for (const neighborIndex of neighbors) {
      const neighborColor = cells[neighborIndex]
      counts[neighborColor] += 1
    }

    const sameColorNeighbors = counts[color]
    let dominantColor = color
    let dominantCount = counts[color]

    for (let paletteIndex = 0; paletteIndex < counts.length; paletteIndex += 1) {
      if (counts[paletteIndex] > dominantCount) {
        dominantCount = counts[paletteIndex]
        dominantColor = paletteIndex
      }
    }

    const requiredDominantCount = getRequiredDominantCount(neighbors.length)
    if (dominantColor !== color && sameColorNeighbors === 0 && dominantCount >= requiredDominantCount) {
      next[index] = dominantColor
      changed = true
    }
  }

  return { next, changed }
}

function cleanSmallColorIslands(
  cells: number[],
  width: number,
  height: number,
  paletteSize: number,
  maxIslandSize: number,
): number[] {
  const next = [...cells]
  const visited = new Uint8Array(cells.length)

  for (let start = 0; start < cells.length; start += 1) {
    if (visited[start]) {
      continue
    }

    const color = cells[start]
    const queue = [start]
    const component = [start]
    const borderCounts = new Array<number>(paletteSize).fill(0)
    visited[start] = 1

    while (queue.length > 0) {
      const index = queue.pop() as number
      const neighbors = getNeighborIndices(index, width, height)

      for (const neighborIndex of neighbors) {
        const neighborColor = cells[neighborIndex]
        if (neighborColor === color) {
          if (!visited[neighborIndex]) {
            visited[neighborIndex] = 1
            queue.push(neighborIndex)
            component.push(neighborIndex)
          }
          continue
        }

        borderCounts[neighborColor] += 1
      }
    }

    if (component.length > maxIslandSize) {
      continue
    }

    let dominantBorderColor = color
    let dominantBorderCount = 0
    let borderTotal = 0

    for (let paletteIndex = 0; paletteIndex < borderCounts.length; paletteIndex += 1) {
      if (paletteIndex === color) {
        continue
      }

      const count = borderCounts[paletteIndex]
      borderTotal += count

      if (count > dominantBorderCount) {
        dominantBorderCount = count
        dominantBorderColor = paletteIndex
      }
    }

    if (borderTotal === 0 || dominantBorderColor === color) {
      continue
    }

    const requiredDominance = Math.ceil(borderTotal * 0.6)
    if (dominantBorderCount < requiredDominance) {
      continue
    }

    for (const index of component) {
      next[index] = dominantBorderColor
    }
  }

  return next
}

export function cleanIsolatedPixels(
  cells: number[],
  width: number,
  height: number,
  paletteSize: number,
): number[] {
  const maxIsolatedPasses = 2
  const maxIslandSize = 2
  let current = [...cells]

  for (let pass = 0; pass < maxIsolatedPasses; pass += 1) {
    const isolated = runIsolatedPixelPass(current, width, height, paletteSize)
    current = isolated.next
    const afterIslands = cleanSmallColorIslands(current, width, height, paletteSize, maxIslandSize)
    const islandsChanged = afterIslands.some((cell, index) => cell !== current[index])
    current = afterIslands

    if (!isolated.changed && !islandsChanged) {
      break
    }
  }

  return current
}
