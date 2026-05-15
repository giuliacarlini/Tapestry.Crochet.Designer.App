import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import * as RadixToast from '@radix-ui/react-toast'
import s from './Toast.module.css'

type ToastVariant = 'default' | 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

let nextId = 0

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, variant: ToastVariant = 'default') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, variant }])
  }, [])

  const handleRemove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider duration={3500}>
        {children}
        {toasts.map((item) => (
          <RadixToast.Root
            key={item.id}
            className={`${s.root} ${s[item.variant]}`}
            onOpenChange={(open) => {
              if (!open) handleRemove(item.id)
            }}
          >
            <RadixToast.Description className={s.description}>
              {item.message}
            </RadixToast.Description>
            <RadixToast.Close className={s.close} aria-label="Fechar">
              &times;
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className={s.viewport} />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}
