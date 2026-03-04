import type { WorkerImageInput } from '../core/image'

export interface QuantizeWorkerRequest {
  image: WorkerImageInput
  cleanIsolated: boolean
  width: number
  height: number
  paletteSize: number
}

export interface QuantizeWorkerSuccess {
  width: number
  height: number
  palette: string[]
  cells: number[]
}

export interface QuantizeWorkerError {
  error: string
}

export type QuantizeWorkerResponse = QuantizeWorkerSuccess | QuantizeWorkerError
