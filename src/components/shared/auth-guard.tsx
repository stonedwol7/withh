'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, type PortalRole } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'

export function AuthGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole: PortalRole }) {
  const router = useRouter()
  const { isAuthenticated, role } = useAuthStore()
  const initialize = useAppStore((s) => s.initialize)
  const initialized = useAppStore((s) => s.initialized)

  useEffect(() => {
    if (isAuthenticated && !initialized) {
      initialize()
    }
  }, [isAuthenticated, initialized, initialize])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (requiredRole && role !== requiredRole) {
      router.push('/login')
    }
  }, [isAuthenticated, role, requiredRole, router])

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
