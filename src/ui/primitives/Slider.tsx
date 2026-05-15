import * as RadixSlider from '@radix-ui/react-slider'
import s from './Slider.module.css'

interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  'aria-label'?: string
}

export function Slider({ min, max, step = 1, value, onChange, ...rest }: SliderProps) {
  return (
    <RadixSlider.Root
      className={s.root}
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={([next]) => onChange(next)}
      aria-label={rest['aria-label']}
    >
      <RadixSlider.Track className={s.track}>
        <RadixSlider.Range className={s.range} />
      </RadixSlider.Track>
      <RadixSlider.Thumb className={s.thumb} />
    </RadixSlider.Root>
  )
}
