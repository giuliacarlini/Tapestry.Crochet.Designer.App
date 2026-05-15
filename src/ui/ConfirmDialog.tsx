import * as Dialog from '@radix-ui/react-dialog'
import s from './ConfirmDialog.module.css'
import shared from './shared.module.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className={s.overlay} />
        <Dialog.Content className={s.content}>
          <Dialog.Title className={s.title}>{title}</Dialog.Title>
          <Dialog.Description className={s.description}>{description}</Dialog.Description>
          <div className={s.actions}>
            <Dialog.Close asChild>
              <button type="button" className={shared.buttonGhost} onClick={onCancel}>
                {cancelLabel}
              </button>
            </Dialog.Close>
            <button type="button" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
