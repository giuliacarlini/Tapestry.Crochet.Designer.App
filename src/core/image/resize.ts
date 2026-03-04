function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function interpolate(
  topLeft: number,
  topRight: number,
  bottomLeft: number,
  bottomRight: number,
  xWeight: number,
  yWeight: number,
): number {
  const top = topLeft + (topRight - topLeft) * xWeight
  const bottom = bottomLeft + (bottomRight - bottomLeft) * xWeight
  return top + (bottom - top) * yWeight
}

export function resizeImageDataBilinear(
  source: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(targetWidth * targetHeight * 4)

  for (let y = 0; y < targetHeight; y += 1) {
    const sourceY = ((y + 0.5) * sourceHeight) / targetHeight - 0.5
    const y0 = clamp(Math.floor(sourceY), 0, sourceHeight - 1)
    const y1 = clamp(y0 + 1, 0, sourceHeight - 1)
    const yWeight = sourceY - y0

    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = ((x + 0.5) * sourceWidth) / targetWidth - 0.5
      const x0 = clamp(Math.floor(sourceX), 0, sourceWidth - 1)
      const x1 = clamp(x0 + 1, 0, sourceWidth - 1)
      const xWeight = sourceX - x0

      const outIndex = (y * targetWidth + x) * 4
      const topLeftIndex = (y0 * sourceWidth + x0) * 4
      const topRightIndex = (y0 * sourceWidth + x1) * 4
      const bottomLeftIndex = (y1 * sourceWidth + x0) * 4
      const bottomRightIndex = (y1 * sourceWidth + x1) * 4

      for (let channel = 0; channel < 4; channel += 1) {
        const value = interpolate(
          source[topLeftIndex + channel],
          source[topRightIndex + channel],
          source[bottomLeftIndex + channel],
          source[bottomRightIndex + channel],
          xWeight,
          yWeight,
        )
        output[outIndex + channel] = Math.round(value)
      }
    }
  }

  return output
}
