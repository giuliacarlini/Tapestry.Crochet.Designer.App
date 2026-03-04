import type { QuantizedImage, RgbColor } from './types'

interface ColorBox {
  colors: RgbColor[]
}

type Channel = 'r' | 'g' | 'b'

function getDominantChannel(colors: RgbColor[]): Channel {
  let minR = 255
  let minG = 255
  let minB = 255
  let maxR = 0
  let maxG = 0
  let maxB = 0

  for (const color of colors) {
    minR = Math.min(minR, color.r)
    minG = Math.min(minG, color.g)
    minB = Math.min(minB, color.b)
    maxR = Math.max(maxR, color.r)
    maxG = Math.max(maxG, color.g)
    maxB = Math.max(maxB, color.b)
  }

  const rangeR = maxR - minR
  const rangeG = maxG - minG
  const rangeB = maxB - minB

  if (rangeR >= rangeG && rangeR >= rangeB) {
    return 'r'
  }

  if (rangeG >= rangeR && rangeG >= rangeB) {
    return 'g'
  }

  return 'b'
}

function splitColorBox(box: ColorBox): [ColorBox, ColorBox] | null {
  if (box.colors.length < 2) {
    return null
  }

  const channel = getDominantChannel(box.colors)
  const sorted = [...box.colors].sort((a, b) => a[channel] - b[channel])
  const middle = Math.floor(sorted.length / 2)

  return [{ colors: sorted.slice(0, middle) }, { colors: sorted.slice(middle) }]
}

function averageColor(colors: RgbColor[]): RgbColor {
  if (colors.length === 0) {
    return { r: 0, g: 0, b: 0 }
  }

  let red = 0
  let green = 0
  let blue = 0

  for (const color of colors) {
    red += color.r
    green += color.g
    blue += color.b
  }

  return {
    r: Math.round(red / colors.length),
    g: Math.round(green / colors.length),
    b: Math.round(blue / colors.length),
  }
}

function colorDistanceSquared(a: RgbColor, b: RgbColor): number {
  const red = a.r - b.r
  const green = a.g - b.g
  const blue = a.b - b.b
  return red * red + green * green + blue * blue
}

function findNearestColorIndex(color: RgbColor, palette: RgbColor[]): number {
  let bestIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  for (let index = 0; index < palette.length; index += 1) {
    const distance = colorDistanceSquared(color, palette[index])
    if (distance < bestDistance) {
      bestDistance = distance
      bestIndex = index
    }
  }

  return bestIndex
}

function rgbaToRgb(source: Uint8ClampedArray): RgbColor[] {
  const colors: RgbColor[] = new Array(source.length / 4)
  let colorIndex = 0

  for (let index = 0; index < source.length; index += 4) {
    const alpha = source[index + 3] / 255

    const red = Math.round(source[index] * alpha + 255 * (1 - alpha))
    const green = Math.round(source[index + 1] * alpha + 255 * (1 - alpha))
    const blue = Math.round(source[index + 2] * alpha + 255 * (1 - alpha))

    colors[colorIndex] = { r: red, g: green, b: blue }
    colorIndex += 1
  }

  return colors
}

function selectBoxToSplit(boxes: ColorBox[]): number {
  let selectedIndex = -1
  let biggestRange = -1

  for (let index = 0; index < boxes.length; index += 1) {
    const box = boxes[index]
    if (box.colors.length < 2) {
      continue
    }

    const channel = getDominantChannel(box.colors)
    let minValue = 255
    let maxValue = 0

    for (const color of box.colors) {
      const value = color[channel]
      minValue = Math.min(minValue, value)
      maxValue = Math.max(maxValue, value)
    }

    const currentRange = maxValue - minValue

    if (currentRange > biggestRange) {
      biggestRange = currentRange
      selectedIndex = index
    }
  }

  return selectedIndex
}

function ensurePaletteSize(palette: RgbColor[], size: number): RgbColor[] {
  const normalized = [...palette]

  while (normalized.length < size) {
    normalized.push(normalized[normalized.length - 1] ?? { r: 0, g: 0, b: 0 })
  }

  return normalized.slice(0, size)
}

export function quantizeMedianCut(
  source: Uint8ClampedArray,
  width: number,
  height: number,
  paletteSize: number,
): QuantizedImage {
  const colors = rgbaToRgb(source)
  const boxes: ColorBox[] = [{ colors }]

  while (boxes.length < paletteSize) {
    const boxIndex = selectBoxToSplit(boxes)
    if (boxIndex < 0) {
      break
    }

    const currentBox = boxes[boxIndex]
    const split = splitColorBox(currentBox)

    if (!split) {
      break
    }

    boxes.splice(boxIndex, 1, split[0], split[1])
  }

  const palette = ensurePaletteSize(boxes.map((box) => averageColor(box.colors)), paletteSize)
  const cells = colors.map((color) => findNearestColorIndex(color, palette))

  return {
    palette,
    cells,
    width,
    height,
  }
}

export function rgbToHex(color: RgbColor): string {
  const red = color.r.toString(16).padStart(2, '0')
  const green = color.g.toString(16).padStart(2, '0')
  const blue = color.b.toString(16).padStart(2, '0')
  return `#${red}${green}${blue}`.toUpperCase()
}
