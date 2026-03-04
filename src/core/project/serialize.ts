import type { Pattern } from '../pattern'
import { deserializePattern, serializePattern } from '../pattern'
import {
  PROJECT_SCHEMA_VERSION,
  createProject,
  isValidProject,
  type ProjectMetadata,
  type ProjectSettings,
  type TapestryProject,
} from './model'

interface RawProjectPayload {
  version: number
  metadata: ProjectMetadata
  settings: ProjectSettings
  pattern: Pattern
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function parsePattern(value: unknown): Pattern {
  return deserializePattern(JSON.stringify(value))
}

function parseMetadata(value: unknown): ProjectMetadata {
  if (!isObject(value)) {
    throw new Error('Metadata ausente no arquivo de projeto')
  }

  const createdAt = value.createdAt
  const updatedAt = value.updatedAt
  const name = value.name

  if (typeof createdAt !== 'string' || typeof updatedAt !== 'string') {
    throw new Error('Metadata invalida no arquivo de projeto')
  }

  if (name !== undefined && name !== null && typeof name !== 'string') {
    throw new Error('Nome de projeto invalido')
  }

  return {
    ...(typeof name === 'string' ? { name } : {}),
    createdAt,
    updatedAt,
  }
}

function parseSettings(value: unknown): ProjectSettings {
  if (!isObject(value)) {
    throw new Error('Settings ausente no arquivo de projeto')
  }

  const width = value.width
  const height = value.height
  const paletteSize = value.paletteSize
  const cleanIsolated = value.cleanIsolated
  const title = value.title

  if (
    typeof width !== 'number' ||
    !Number.isInteger(width) ||
    width <= 0 ||
    typeof height !== 'number' ||
    !Number.isInteger(height) ||
    height <= 0
  ) {
    throw new Error('Resolucao invalida no arquivo de projeto')
  }

  if (
    typeof paletteSize !== 'number' ||
    !Number.isInteger(paletteSize) ||
    paletteSize <= 0
  ) {
    throw new Error('Configuracao de paleta invalida no arquivo de projeto')
  }

  if (typeof cleanIsolated !== 'boolean') {
    throw new Error('Configuracao de limpeza invalida no arquivo de projeto')
  }

  if (title !== undefined && title !== null && typeof title !== 'string') {
    throw new Error('Titulo invalido no arquivo de projeto')
  }

  return {
    width,
    height,
    paletteSize,
    cleanIsolated,
    ...(typeof title === 'string' ? { title } : {}),
  }
}

function parseProject(raw: string): RawProjectPayload {
  const parsed: unknown = JSON.parse(raw)
  if (!isObject(parsed)) {
    throw new Error('Arquivo de projeto invalido')
  }

  const version = parsed.version
  if (version !== PROJECT_SCHEMA_VERSION) {
    throw new Error(`Versao de projeto nao suportada: ${String(version)}`)
  }

  const metadata = parseMetadata(parsed.metadata)
  const settings = parseSettings(parsed.settings)

  const pattern = parsePattern(parsed.pattern)

  return {
    version,
    metadata,
    settings,
    pattern,
  }
}

export function serializeProject(project: TapestryProject): string {
  if (!isValidProject(project)) {
    throw new Error('Projeto invalido para serializacao')
  }

  const parsedPattern = JSON.parse(serializePattern(project.pattern)) as Pattern
  const payload: TapestryProject = {
    ...project,
    pattern: parsedPattern,
  }

  return JSON.stringify(payload, null, 2)
}

export function deserializeProject(raw: string): TapestryProject {
  const parsed = parseProject(raw)

  const project = createProject({
    pattern: parsed.pattern,
    cleanIsolated: parsed.settings.cleanIsolated,
    name: parsed.metadata.name,
    createdAt: parsed.metadata.createdAt,
  })

  project.metadata.updatedAt = parsed.metadata.updatedAt
  if (typeof parsed.settings.title === 'string') {
    project.settings.title = parsed.settings.title
  }

  if (!isValidProject(project)) {
    throw new Error('Arquivo de projeto invalido')
  }

  return project
}
