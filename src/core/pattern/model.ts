export const PATTERN_WIDTH = 150
export const PATTERN_HEIGHT = 150
export const PALETTE_SIZE = 12
export const CELL_COUNT = PATTERN_WIDTH * PATTERN_HEIGHT
export const MIN_PALETTE_SIZE = 2
export const MAX_PALETTE_SIZE = 12

export interface ResolutionPreset {
  label: string
  width: number
  height: number
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { label: '50x50', width: 50, height: 50 },
  { label: '80x80', width: 80, height: 80 },
  { label: '100x100', width: 100, height: 100 },
  { label: '120x120', width: 120, height: 120 },
  { label: '150x150', width: 150, height: 150 },
]

const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/i

export interface PatternMetadata {
  title?: string
  createdAt: string
}

export interface PaletteColor {
  id: number
  hex: string
}

export interface Pattern {
  width: number
  height: number
  palette: PaletteColor[]
  cells: number[]
  metadata: PatternMetadata
}

export interface PatternConfig {
  width: number
  height: number
  paletteSize: number
}

interface CreatePatternOptions {
  title?: string
  config?: PatternConfig
}

function normalizeHex(hex: string): string {
  return HEX_COLOR_REGEX.test(hex) ? hex.toUpperCase() : '#000000'
}

function getCellCount(width: number, height: number): number {
  return width * height
}

function getSafeConfig(config?: PatternConfig): PatternConfig {
  const width = config?.width ?? PATTERN_WIDTH
  const height = config?.height ?? PATTERN_HEIGHT
  const paletteSize = config?.paletteSize ?? PALETTE_SIZE

  return {
    width: Number.isInteger(width) && width > 0 ? width : PATTERN_WIDTH,
    height: Number.isInteger(height) && height > 0 ? height : PATTERN_HEIGHT,
    paletteSize:
      Number.isInteger(paletteSize) && paletteSize >= MIN_PALETTE_SIZE && paletteSize <= MAX_PALETTE_SIZE
        ? paletteSize
        : PALETTE_SIZE,
  }
}

function normalizePalette(paletteHex: string[], paletteSize: number): PaletteColor[] {
  const safePalette = paletteHex.slice(0, paletteSize).map(normalizeHex)

  while (safePalette.length < paletteSize) {
    safePalette.push('#000000')
  }

  return safePalette.map((hex, id) => ({ id, hex }))
}

function normalizeCells(cells: number[], cellCount: number, paletteSize: number): number[] {
  const normalizedCells = cells.slice(0, cellCount).map((value) => {
    if (!Number.isFinite(value)) {
      return 0
    }

    const clamped = Math.max(0, Math.min(paletteSize - 1, Math.round(value)))
    return clamped
  })

  while (normalizedCells.length < cellCount) {
    normalizedCells.push(0)
  }

  return normalizedCells
}

export function createPattern(
  paletteHex: string[],
  cells: number[],
  options: CreatePatternOptions = {},
): Pattern {
  const { title, config } = options
  const safeConfig = getSafeConfig(config)
  const cellCount = getCellCount(safeConfig.width, safeConfig.height)
  const trimmedTitle = title?.trim()

  return {
    width: safeConfig.width,
    height: safeConfig.height,
    palette: normalizePalette(paletteHex, safeConfig.paletteSize),
    cells: normalizeCells(cells, cellCount, safeConfig.paletteSize),
    metadata: {
      ...(trimmedTitle ? { title: trimmedTitle } : {}),
      createdAt: new Date().toISOString(),
    },
  }
}

export function isValidPattern(pattern: Pattern): boolean {
  if (!Number.isInteger(pattern.width) || pattern.width <= 0) {
    return false
  }

  if (!Number.isInteger(pattern.height) || pattern.height <= 0) {
    return false
  }

  if (pattern.palette.length < MIN_PALETTE_SIZE || pattern.palette.length > MAX_PALETTE_SIZE) {
    return false
  }

  if (pattern.cells.length !== getCellCount(pattern.width, pattern.height)) {
    return false
  }

  const hasValidPalette = pattern.palette.every(
    (color, index) => color.id === index && HEX_COLOR_REGEX.test(color.hex),
  )
  if (!hasValidPalette) {
    return false
  }

  const hasValidCells = pattern.cells.every(
    (cell) => Number.isInteger(cell) && cell >= 0 && cell < pattern.palette.length,
  )
  if (!hasValidCells) {
    return false
  }

  if (!pattern.metadata || !pattern.metadata.createdAt) {
    return false
  }

  return true
}
