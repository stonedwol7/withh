interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex gap-1 px-4 pb-4" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < current ? 'bg-primary' : 'bg-border'
          }`}
        />
      ))}
    </div>
  )
}
