export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface QuantizedImage {
  palette: RgbColor[]
  cells: number[]
  width: number
  height: number
}

export interface WorkerImageInput {
  data: Uint8ClampedArray
  width: number
  height: number
}
