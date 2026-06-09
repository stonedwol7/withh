'use client'

import { useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/use-store'
import type { SupportCategory, SupportDuration, GenderPreference, Language, WhoNeedsSupport } from '@/lib/types'

interface SavedDraft {
  whoNeedsSupport?: WhoNeedsSupport
  someoneElseName?: string
  someoneElsePhone?: string
  someoneElseRelationship?: string
  category?: SupportCategory
  otherCategoryDescription?: string
  meetingLocation?: string
  destination?: string
  date?: string
  time?: string
  duration?: SupportDuration
  description?: string
  accessibilityNeeds?: string
  genderPreference?: GenderPreference
  languagePreference?: Language | 'no-preference'
  trustedContactName?: string
  trustedContactPhone?: string
  trustedContactRelationship?: string
  savedAt: string
  currentStep: number
}

const STORAGE_KEY = 'withh-request-draft'

export function loadSavedDraft(): SavedDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

export function saveDraftToStorage(draft: Partial<SavedDraft>) {
  try {
    const existing = loadSavedDraft() || { savedAt: '', currentStep: 1 }
    const updated = { ...existing, ...draft, savedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}

export function clearSavedDraft() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

export function restoreDraft(): boolean {
  const saved = loadSavedDraft()
  if (!saved || !saved.category) return false
  const { savedAt, currentStep, ...draft } = saved
  useAppStore.getState().setRequestDraft(draft)
  return true
}

export function useDraftAutoSave() {
  const draft = useAppStore((s) => s.requestDraft)

  useEffect(() => {
    if (draft.category || draft.meetingLocation || draft.date) {
      saveDraftToStorage(draft)
    }
  }, [draft])
}
