import { Shield, CheckCircle, Users, Sparkles } from 'lucide-react'

const updates = [
  { from: 'WITHH', message: 'Request received', time: 'Today, 10:30 AM', icon: Shield },
  { from: 'WITHH', message: 'Reviewing details', time: 'Today, 10:32 AM', icon: Sparkles },
  { from: 'WITHH', message: 'Partner assigned — waiting for your confirmation', time: 'Just now', icon: Users, current: true },
  { from: 'WITHH', message: 'Support confirmed', time: 'Pending', icon: CheckCircle, dim: true },
  { from: 'WITHH', message: 'Support completed', time: 'Pending', icon: CheckCircle, dim: true },
]

export default function MessagesPage() {
  return (
    <div className="max-w-lg mx-auto px-5 pt-8 pb-8">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Messages</h1>
      <p className="text-sm text-muted-foreground mb-8">Journey updates.</p>

      <div className="space-y-3">
        {updates.map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className={`bg-card rounded-2xl border border-border p-4 flex items-start gap-3 transition-all ${
              item.current ? 'ring-1 ring-accent/20' : ''
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                item.dim ? 'bg-muted text-muted-foreground/20' :
                item.current ? 'bg-accent/10 text-accent' :
                'bg-primary/10 text-primary'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-medium ${
                  item.dim ? 'text-muted-foreground/30' : 'text-foreground/60'
                }`}>{item.from}</p>
                <p className={`text-sm ${
                  item.dim ? 'text-muted-foreground/30' :
                  item.current ? 'text-foreground font-medium' : 'text-foreground'
                }`}>{item.message}</p>
                <p className={`text-[10px] mt-0.5 ${
                  item.dim ? 'text-muted-foreground/20' : 'text-muted-foreground/50'
                }`}>{item.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
