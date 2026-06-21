import { Shield, CheckCircle, Clock, Users } from 'lucide-react'

const timeline = [
  { stage: 'Request received', status: 'done', icon: Shield, time: 'Today, 10:30 AM' },
  { stage: 'Reviewing details', status: 'done', icon: Clock, time: 'Today, 10:32 AM' },
  { stage: 'Partner assigned', status: 'current', icon: Users, time: 'Finding the right match...' },
  { stage: 'Support confirmed', status: 'upcoming', icon: CheckCircle, time: 'Pending' },
  { stage: 'Support completed', status: 'upcoming', icon: CheckCircle, time: 'Pending' },
]

export default function JourneyPage() {
  return (
    <div className="max-w-lg mx-auto px-5 pt-8 pb-8">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Journey</h1>
      <p className="text-sm text-muted-foreground mb-8">What&apos;s happening next.</p>

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-6">
          {timeline.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex gap-4">
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.status === 'done' ? 'bg-primary/10 text-primary' :
                  item.status === 'current' ? 'bg-accent/10 text-accent animate-status-pulse' :
                  'bg-muted text-muted-foreground/30'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-medium ${
                    item.status === 'done' ? 'text-foreground' :
                    item.status === 'current' ? 'text-accent' :
                    'text-muted-foreground/40'
                  }`}>{item.stage}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">{item.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
