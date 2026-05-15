import * as RadixSelect from '@radix-ui/react-select'
import s from './Select.module.css'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  'aria-label'?: string
}

export function Select({ value, options, onChange, placeholder, ...rest }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger className={s.trigger} aria-label={rest['aria-label']}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className={s.icon}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content className={s.content} position="popper" sideOffset={4}>
          <RadixSelect.Viewport className={s.viewport}>
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className={s.item}>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className={s.indicator}>
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
