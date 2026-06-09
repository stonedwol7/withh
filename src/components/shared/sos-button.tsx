'use client'

import { useState } from 'react'
import { AlertTriangle, Phone, X } from 'lucide-react'
import { useNotificationStore } from '@/lib/notification-store'

interface SosButtonProps {
  requestId?: string
  className?: string
}

export function SosButton({ requestId, className = '' }: SosButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const { triggerSos, clearSos, sosActive } = useNotificationStore()

  const handleSos = () => {
    triggerSos(requestId)
    setShowModal(false)
  }

  if (sosActive) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
        <div className="bg-destructive text-destructive-foreground px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-semibold">SOS Sent — Help is on the way</span>
          <button onClick={clearSos} className="p-1 hover:bg-destructive/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full bg-destructive text-destructive-foreground shadow-2xl flex items-center justify-center hover:bg-destructive/90 transition-all active:scale-95 ${className}`}
        aria-label="Emergency SOS"
      >
        <AlertTriangle className="w-6 h-6" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center p-5">
          <div className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Emergency SOS</h2>
              <p className="text-sm text-muted-foreground">
                This will immediately notify our operations team and your emergency contacts.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSos}
                className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Send SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
