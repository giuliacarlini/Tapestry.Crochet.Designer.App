import {
  MAX_PALETTE_SIZE,
  MIN_PALETTE_SIZE,
  isValidPattern,
  type PaletteColor,
  type Pattern,
} from './model'

const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/i

function isPaletteColor(value: unknown): value is PaletteColor {
  if (!value || typeof value !== 'object') {
    return false
  }

  const parsed = value as Record<string, unknown>
  return (
    typeof parsed.id === 'number' &&
    Number.isInteger(parsed.id) &&
    parsed.id >= 0 &&
    parsed.id < MAX_PALETTE_SIZE &&
    typeof parsed.hex === 'string' &&
    HEX_COLOR_REGEX.test(parsed.hex)
  )
}

function isPattern(value: unknown): value is Pattern {
  if (!value || typeof value !== 'object') {
    return false
  }

  const parsed = value as Record<string, unknown>
  if (
    typeof parsed.width !== 'number' ||
    !Number.isInteger(parsed.width) ||
    parsed.width <= 0 ||
    typeof parsed.height !== 'number' ||
    !Number.isInteger(parsed.height) ||
    parsed.height <= 0
  ) {
    return false
  }

  if (!Array.isArray(parsed.palette) || !Array.isArray(parsed.cells)) {
    return false
  }

  const palette = parsed.palette as unknown[]
  const cells = parsed.cells as unknown[]

  if (palette.length < MIN_PALETTE_SIZE || palette.length > MAX_PALETTE_SIZE) {
    return false
  }

  if (cells.length !== parsed.width * parsed.height) {
    return false
  }

  const validPalette = palette.every(isPaletteColor)
  if (!validPalette) {
    return false
  }

  const typedPalette = palette as PaletteColor[]
  const validPaletteIds = typedPalette.every((color, index) => color.id === index)
  if (!validPaletteIds) {
    return false
  }

  const validCells = cells.every(
    (cell) =>
      typeof cell === 'number' &&
      Number.isInteger(cell) &&
      cell >= 0 &&
      cell < typedPalette.length,
  )
  if (!validCells) {
    return false
  }

  const metadata = parsed.metadata
  if (!metadata || typeof metadata !== 'object') {
    return false
  }

  const parsedMetadata = metadata as Record<string, unknown>
  if (typeof parsedMetadata.createdAt !== 'string') {
    return false
  }

  if (
    parsedMetadata.title !== undefined &&
    parsedMetadata.title !== null &&
    typeof parsedMetadata.title !== 'string'
  ) {
    return false
  }

  return true
}

export function serializePattern(pattern: Pattern): string {
  if (!isValidPattern(pattern)) {
    throw new Error('Pattern invalido para serializacao')
  }

  return JSON.stringify(pattern, null, 2)
}

export function deserializePattern(raw: string): Pattern {
  const parsed: unknown = JSON.parse(raw)

  if (!isPattern(parsed)) {
    throw new Error('JSON does not match Pattern schema')
  }

  return parsed
}
