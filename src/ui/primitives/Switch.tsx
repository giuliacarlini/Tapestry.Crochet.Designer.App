import * as RadixSwitch from '@radix-ui/react-switch'
import s from './Switch.module.css'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  'aria-label'?: string
}

export function Switch({ checked, onChange, disabled, ...rest }: SwitchProps) {
  return (
    <RadixSwitch.Root
      className={s.root}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={rest['aria-label']}
    >
      <RadixSwitch.Thumb className={s.thumb} />
    </RadixSwitch.Root>
  )
}
