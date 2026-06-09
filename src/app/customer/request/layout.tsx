'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useDraftAutoSave, restoreDraft, clearSavedDraft } from '@/lib/draft-autosave'
import { useAppStore } from '@/store/use-store'

export default function CustomerRequestLayout({ children }: { children: React.ReactNode }) {
  useDraftAutoSave()
  const pathname = usePathname()
  const draft = useAppStore((s) => s.requestDraft)

  useEffect(() => {
    if (pathname === '/customer/request' && !draft.category && !draft.meetingLocation) {
      restoreDraft()
    }
    if (pathname === '/customer/request/step7') {
      const submitted = sessionStorage.getItem('withh-request-submitted')
      if (submitted) {
        clearSavedDraft()
        sessionStorage.removeItem('withh-request-submitted')
      }
    }
  }, [pathname])

  return (
    <div className="max-w-lg mx-auto bg-background min-h-screen">
      {children}
    </div>
  )
}
