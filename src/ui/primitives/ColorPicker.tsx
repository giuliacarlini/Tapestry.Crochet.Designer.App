import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import s from './ColorPicker.module.css'

interface ColorPickerProps {
  color: string
  onChange: (hex: string) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function ColorPicker({ color, onChange, disabled, size = 'md' }: ColorPickerProps) {
  const [localColor, setLocalColor] = useState(color)

  const handleChange = (hex: string) => {
    setLocalColor(hex)
    onChange(hex)
  }

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (open) setLocalColor(color)
      }}
    >
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={size === 'sm' ? s.swatchSm : s.swatch}
          style={{ backgroundColor: color }}
          aria-label={`Cor: ${color}`}
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className={s.content} side="bottom" sideOffset={6} align="start">
          <HexColorPicker
            color={localColor}
            onChange={handleChange}
            className={s.picker}
          />
          <div className={s.inputRow}>
            <span className={s.hash}>#</span>
            <HexColorInput
              color={localColor}
              onChange={handleChange}
              prefixed={false}
              className={s.hexInput}
            />
          </div>
          <Popover.Arrow className={s.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
