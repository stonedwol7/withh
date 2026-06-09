'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const docTypes = [
  { id: 'aadhaar', label: 'Aadhaar Card', required: true },
  { id: 'pan', label: 'PAN Card', required: true },
  { id: 'bank', label: 'Bank Account Details', required: true },
  { id: 'photo', label: 'Passport Photo', required: true },
  { id: 'address', label: 'Address Proof', required: false },
  { id: 'qualification', label: 'Qualification Certificate', required: false },
]

interface KycUploadProps {
  partnerId: string
  onComplete?: () => void
}

export function KycUpload({ partnerId, onComplete }: KycUploadProps) {
  const [uploaded, setUploaded] = useState<Record<string, { name: string; status: 'uploading' | 'done' }>>({})

  const handleUpload = (docId: string, label: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.jpg,.jpeg,.png'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      setUploaded((prev) => ({ ...prev, [docId]: { name: file.name, status: 'uploading' } }))
      await new Promise((r) => setTimeout(r, 500))
      setUploaded((prev) => ({ ...prev, [docId]: { name: file.name, status: 'done' } }))
      toast.success(`${label} uploaded`)
    }
    input.click()
  }

  const allRequired = docTypes.filter((d) => d.required).every((d) => uploaded[d.id]?.status === 'done')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-accent" />
        <div>
          <h3 className="text-base font-bold text-foreground">KYC Documents</h3>
          <p className="text-xs text-muted-foreground">Upload your documents for verification</p>
        </div>
      </div>

      {docTypes.map((doc) => {
        const state = uploaded[doc.id]
        return (
          <button
            key={doc.id}
            onClick={() => !state && handleUpload(doc.id, doc.label)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              state?.status === 'done'
                ? 'border-green/30 bg-green/5'
                : 'border-border bg-card hover:border-accent/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              state?.status === 'done' ? 'bg-green/10' : 'bg-muted'
            }`}>
              {state?.status === 'done' ? (
                <CheckCircle className="w-5 h-5 text-green" />
              ) : state?.status === 'uploading' ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {doc.label}
                {doc.required && <span className="text-destructive text-xs ml-1">*</span>}
              </p>
              {state && <p className="text-xs text-muted-foreground truncate mt-0.5">{state.name}</p>}
            </div>
            {doc.required && !state && <AlertCircle className="w-4 h-4 text-amber shrink-0" />}
          </button>
        )
      })}

      {allRequired && (
        <button
          onClick={() => { toast.success('KYC submitted for verification!'); onComplete?.() }}
          className="w-full py-3.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 transition-colors"
        >
          Submit for Verification
        </button>
      )}
    </div>
  )
}
