import {
  MAX_PALETTE_SIZE,
  MIN_PALETTE_SIZE,
  isValidPattern,
  type Pattern,
} from '../pattern'

export const PROJECT_SCHEMA_VERSION = 1

export interface ProjectMetadata {
  name?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectSettings {
  width: number
  height: number
  paletteSize: number
  cleanIsolated: boolean
  title?: string
}

export interface TapestryProject {
  version: number
  metadata: ProjectMetadata
  settings: ProjectSettings
  pattern: Pattern
}

function normalizeProjectName(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function getSafeTitle(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function isValidProject(project: TapestryProject): boolean {
  if (project.version !== PROJECT_SCHEMA_VERSION) {
    return false
  }

  if (!project.metadata || typeof project.metadata !== 'object') {
    return false
  }

  if (
    typeof project.metadata.createdAt !== 'string' ||
    typeof project.metadata.updatedAt !== 'string'
  ) {
    return false
  }

  if (
    project.metadata.name !== undefined &&
    project.metadata.name !== null &&
    typeof project.metadata.name !== 'string'
  ) {
    return false
  }

  if (!project.settings || typeof project.settings !== 'object') {
    return false
  }

  if (
    !Number.isInteger(project.settings.width) ||
    project.settings.width <= 0 ||
    !Number.isInteger(project.settings.height) ||
    project.settings.height <= 0
  ) {
    return false
  }

  if (
    !Number.isInteger(project.settings.paletteSize) ||
    project.settings.paletteSize < MIN_PALETTE_SIZE ||
    project.settings.paletteSize > MAX_PALETTE_SIZE
  ) {
    return false
  }

  if (typeof project.settings.cleanIsolated !== 'boolean') {
    return false
  }

  if (
    project.settings.title !== undefined &&
    project.settings.title !== null &&
    typeof project.settings.title !== 'string'
  ) {
    return false
  }

  if (!isValidPattern(project.pattern)) {
    return false
  }

  if (
    project.pattern.width !== project.settings.width ||
    project.pattern.height !== project.settings.height ||
    project.pattern.palette.length !== project.settings.paletteSize
  ) {
    return false
  }

  return true
}

export function createProject(options: {
  pattern: Pattern
  cleanIsolated: boolean
  name?: string
  createdAt?: string
}): TapestryProject {
  const { pattern, cleanIsolated, name, createdAt } = options
  if (!isValidPattern(pattern)) {
    throw new Error('Pattern invalido para criar projeto')
  }

  const now = new Date().toISOString()
  const safeCreatedAt = createdAt ?? now

  return {
    version: PROJECT_SCHEMA_VERSION,
    metadata: {
      ...(normalizeProjectName(name) ? { name: normalizeProjectName(name) } : {}),
      createdAt: safeCreatedAt,
      updatedAt: now,
    },
    settings: {
      width: pattern.width,
      height: pattern.height,
      paletteSize: pattern.palette.length,
      cleanIsolated,
      ...(getSafeTitle(pattern.metadata.title) ? { title: getSafeTitle(pattern.metadata.title) } : {}),
    },
    pattern: {
      ...pattern,
      palette: pattern.palette.map((entry) => ({ ...entry })),
      cells: [...pattern.cells],
      metadata: { ...pattern.metadata },
    },
  }
}

