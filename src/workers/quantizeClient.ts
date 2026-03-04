import type { QuantizeWorkerRequest, QuantizeWorkerResponse, QuantizeWorkerSuccess } from './types'

function isSuccessResponse(response: QuantizeWorkerResponse): response is QuantizeWorkerSuccess {
  return 'palette' in response && 'cells' in response
}

export function runQuantizeWorker(request: QuantizeWorkerRequest): Promise<QuantizeWorkerSuccess> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./quantize.worker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = (event: MessageEvent<QuantizeWorkerResponse>) => {
      const response = event.data
      worker.terminate()

      if (isSuccessResponse(response)) {
        resolve(response)
        return
      }

      reject(new Error(response.error))
    }

    worker.onerror = (event) => {
      worker.terminate()
      reject(new Error(event.message || 'Falha ao executar worker de quantizacao'))
    }

    worker.postMessage(request)
  })
}
