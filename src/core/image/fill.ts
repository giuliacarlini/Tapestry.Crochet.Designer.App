function isInsideGrid(index: number, width: number, height: number): boolean {
  return index >= 0 && index < width * height
}

export function floodFillCells(
  cells: number[],
  width: number,
  height: number,
  startIndex: number,
  nextColor: number,
): number[] {
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    return [...cells]
  }

  if (!isInsideGrid(startIndex, width, height) || startIndex >= cells.length) {
    return [...cells]
  }

  const targetColor = cells[startIndex]
  if (targetColor === nextColor) {
    return [...cells]
  }

  const result = [...cells]
  const stack: number[] = [startIndex]

  result[startIndex] = nextColor

  while (stack.length > 0) {
    const index = stack.pop()
    if (index === undefined) {
      continue
    }

    const x = index % width
    const y = Math.floor(index / width)

    const neighbors: number[] = []
    if (x > 0) {
      neighbors.push(index - 1)
    }
    if (x < width - 1) {
      neighbors.push(index + 1)
    }
    if (y > 0) {
      neighbors.push(index - width)
    }
    if (y < height - 1) {
      neighbors.push(index + width)
    }

    for (const neighborIndex of neighbors) {
      if (neighborIndex >= cells.length) {
        continue
      }

      if (result[neighborIndex] !== targetColor) {
        continue
      }

      result[neighborIndex] = nextColor
      stack.push(neighborIndex)
    }
  }

  return result
}

