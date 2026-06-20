'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Loader2, Upload, Check, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Database } from '@/lib/types/database.types'

type Meta = Database['public']['Tables']['partners_meta']['Row']

const CATEGORIES = ['medical', 'government', 'travel', 'general'] as const
const LANGUAGES = ['english', 'hindi', 'kannada', 'tamil', 'telugu', 'malayalam', 'urdu'] as const

const STEPS = ['Identity', 'Bank & Address', 'Guarantor', 'Services & Terms'] as const

export default function KYCOnboardingPage() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const getSupabase = () => supabaseRef.current ?? (supabaseRef.current = createClient())
  const [step, setStep] = useState(0)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Step 1: Identity
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [panFile, setPanFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [panNumber, setPanNumber] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState({ aadhaar: false, pan: false, selfie: false, address: false })

  // Step 2: Bank & Address
  const [addressFile, setAddressFile] = useState<File | null>(null)
  const [bankAccount, setBankAccount] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [upi, setUpi] = useState('')

  // Step 3: Guarantor
  const [guarantorName, setGuarantorName] = useState('')
  const [guarantorPhone, setGuarantorPhone] = useState('')

  // Step 4: Services & Terms
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState(200)
  const [radius, setRadius] = useState(5)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Bio
  const [bio, setBio] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentDoc, setCurrentDoc] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: auth } = await getSupabase().auth.getUser()
      if (!auth.user) { router.replace('/login'); return }

      const { data: profile } = await getSupabase()
        .from('profiles').select('role').eq('id', auth.user.id).single()

      if (profile?.role !== 'partner') { router.replace('/dashboard'); return }

      // Check existing KYC status
      const { data: meta } = await getSupabase()
        .from('partners_meta').select('*').eq('id', auth.user.id).single()

      if (meta?.kyc_status === 'submitted' || meta?.kyc_status === 'verified') {
        router.replace('/partner')
        toast.info('KYC already submitted')
        return
      }

      if (meta?.kyc_status === 'rejected') {
        toast.error(`KYC rejected: ${meta.rejection_reason || 'Please resubmit with correct documents'}`)
      }

      setUserId(auth.user.id)
      setLoading(false)
    }
    init()
  }, [router])

  const uploadFile = async (file: File, prefix: string): Promise<string | null> => {
    setUploading(prefix)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${prefix}-${Date.now()}.${ext}`
      const { error } = await getSupabase().storage.from('kyc_docs').upload(path, file)
      if (error) { toast.error(`Upload failed: ${error.message}`); return null }
      const { data: urlData } = getSupabase().storage.from('kyc_docs').getPublicUrl(path)
      return urlData.publicUrl
    } catch {
      toast.error('Upload failed')
      return null
    } finally {
      setUploading(null)
    }
  }

  const handleFileSelect = async (field: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large (max 5 MB)'); return }
    const url = await uploadFile(file, field)
    if (!url) return
    setUploaded((prev) => ({ ...prev, [field]: true }))
  }

  const triggerFileInput = (field: string) => {
    setCurrentDoc(field)
    fileInputRef.current?.click()
  }

  const handleSubmit = async () => {
    if (!termsAccepted) { toast.error('Please accept the terms'); return }
    if (selectedCategories.length === 0) { toast.error('Select at least one service category'); return }
    if (selectedLanguages.length === 0) { toast.error('Select at least one language'); return }

    setSubmitting(true)
    try {
      const { error } = await getSupabase().from('partners_meta').upsert({
        id: userId,
        pan_number: panNumber || null,
        bank_account_number: bankAccount || null,
        ifsc_code: ifsc || null,
        upi_id: upi || null,
        guarantor_name: guarantorName || null,
        guarantor_phone: guarantorPhone || null,
        terms_accepted: true,
        service_radius_km: radius,
        categories: selectedCategories,
        languages: selectedLanguages,
        hourly_rate: hourlyRate,
        bio: bio || null,
        kyc_status: 'submitted',
        background_check_status: 'pending',
      })

      if (error) { toast.error(error.message); return }

      toast.success('KYC submitted for verification!')
      router.push('/partner')
    } catch {
      toast.error('Failed to submit KYC')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-copper/30 border-t-copper rounded-full animate-spin" />
      </div>
    )
  }

  const canProceedStep = () => {
    switch (step) {
      case 0: return uploaded.aadhaar && uploaded.pan && uploaded.selfie && panNumber.trim().length >= 4
      case 1: return uploaded.address && bankAccount.trim().length >= 9 && ifsc.trim().length >= 4
      case 2: return guarantorName.trim().length >= 2 && guarantorPhone.trim().length >= 10
      case 3: return selectedCategories.length > 0 && selectedLanguages.length > 0 && termsAccepted
      default: return false
    }
  }

  const FileUploadButton = ({ field, label, done }: { field: string; label: string; done: boolean }) => (
    <button
      onClick={() => triggerFileInput(field)}
      disabled={uploading === field}
      className={`w-full bg-card border ${done ? 'border-green/30 bg-green/5' : 'border-slate/10'} rounded-xl p-4 flex items-center gap-3 hover:border-copper/20 transition-all text-left`}
    >
      <div className={`w-10 h-10 rounded-lg ${done ? 'bg-green/10' : 'bg-slate/5'} flex items-center justify-center shrink-0`}>
        {done ? <Check className="w-4 h-4 text-green" /> : uploading === field ? <Loader2 className="w-4 h-4 animate-spin text-copper" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate">{label}</p>
        <p className="text-[10px] text-muted-foreground">{done ? 'Uploaded' : 'JPG, PNG or PDF (max 5 MB)'}</p>
      </div>
      {done && <X className="w-4 h-4 text-muted-foreground" onClick={(e) => { e.stopPropagation(); setUploaded((p) => ({ ...p, [field]: false })) }} />}
    </button>
  )

  return (
    <div className="min-h-screen bg-alabaster">
      <header className="sticky top-0 bg-alabaster/80 backdrop-blur-xl border-b border-slate/5 px-5 h-14 flex items-center">
        <button onClick={() => step === 0 ? router.push('/partner') : setStep(step - 1)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate/5 transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-slate" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-copper' : i < step ? 'bg-green' : 'bg-slate/15'}`} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">{step + 1} / {STEPS.length}</span>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file && currentDoc) await handleFileSelect(currentDoc, file)
          e.target.value = ''
        }}
      />

      <div className="max-w-lg mx-auto px-5 pt-6 pb-8">
        {/* Step 0: Identity */}
        {step === 0 && (
          <>
            <h1 className="text-xl font-bold text-slate mb-1">Identity verification</h1>
            <p className="text-sm text-muted-foreground mb-6">Upload your documents for verification.</p>
            <div className="space-y-3 mb-6">
              <FileUploadButton field="aadhaar" label="Aadhaar Card" done={uploaded.aadhaar} />
              <FileUploadButton field="pan" label="PAN Card" done={uploaded.pan} />
              <FileUploadButton field="selfie" label="Selfie / Profile Photo" done={uploaded.selfie} />
            </div>
            <div>
              <label htmlFor="kyc-pan" className="text-xs font-medium text-muted-foreground mb-1 block">PAN Number *</label>
              <input
                id="kyc-pan"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="e.g., ABCDE1234F"
                className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
              />
            </div>
          </>
        )}

        {/* Step 1: Bank & Address */}
        {step === 1 && (
          <>
            <h1 className="text-xl font-bold text-slate mb-1">Bank & address</h1>
            <p className="text-sm text-muted-foreground mb-6">For payouts and address verification.</p>
            <div className="space-y-3 mb-6">
              <FileUploadButton field="address" label="Address Proof (utility bill, bank statement)" done={uploaded.address} />
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="kyc-account" className="text-xs font-medium text-muted-foreground mb-1 block">Bank account number *</label>
                <input
                  id="kyc-account"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g., 12345678901"
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
                />
              </div>
              <div>
                <label htmlFor="kyc-ifsc" className="text-xs font-medium text-muted-foreground mb-1 block">IFSC code *</label>
                <input
                  id="kyc-ifsc"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g., SBIN0001234"
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
                />
              </div>
              <div>
                <label htmlFor="kyc-upi" className="text-xs font-medium text-muted-foreground mb-1 block">UPI ID (optional)</label>
                <input
                  id="kyc-upi"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  placeholder="e.g., name@upi"
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
                />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Guarantor */}
        {step === 2 && (
          <>
            <h1 className="text-xl font-bold text-slate mb-1">Guarantor details</h1>
            <p className="text-sm text-muted-foreground mb-6">Someone who can vouch for you (optional but recommended).</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="kyc-gname" className="text-xs font-medium text-muted-foreground mb-1 block">Guarantor name *</label>
                <input
                  id="kyc-gname"
                  value={guarantorName}
                  onChange={(e) => setGuarantorName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
                />
              </div>
              <div>
                <label htmlFor="kyc-gphone" className="text-xs font-medium text-muted-foreground mb-1 block">Guarantor phone *</label>
                <input
                  id="kyc-gphone"
                  value={guarantorPhone}
                  onChange={(e) => setGuarantorPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="+91 98765 43210"
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
                />
              </div>
            </div>
          </>
        )}

        {/* Step 3: Services & Terms */}
        {step === 3 && (
          <>
            <h1 className="text-xl font-bold text-slate mb-1">Services & terms</h1>
            <p className="text-sm text-muted-foreground mb-6">Set up your partner profile.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Service categories *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategories((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c])}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                        selectedCategories.includes(c) ? 'bg-copper text-white' : 'bg-card border border-slate/10 text-muted-foreground hover:border-copper/20'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Languages *</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l}
                      onClick={() => setSelectedLanguages((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l])}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                        selectedLanguages.includes(l) ? 'bg-copper text-white' : 'bg-card border border-slate/10 text-muted-foreground hover:border-copper/20'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="kyc-rate" className="text-xs font-medium text-muted-foreground mb-1 block">Hourly rate (₹) *</label>
                <input
                  id="kyc-rate"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  min={100}
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
                />
              </div>

              <div>
                <label htmlFor="kyc-radius" className="text-xs font-medium text-muted-foreground mb-1 block">Service radius (km)</label>
                <input
                  id="kyc-radius"
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  min={1}
                  max={50}
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
                />
              </div>

              <div>
                <label htmlFor="kyc-bio" className="text-xs font-medium text-muted-foreground mb-1 block">Bio (optional)</label>
                <textarea
                  id="kyc-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell customers about yourself..."
                  rows={3}
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[80px] resize-none"
                />
              </div>

              <div className="flex items-start gap-3 py-3">
                <input
                  type="checkbox"
                  id="kyc-terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-slate/20 text-copper focus:ring-copper/20 mt-0.5"
                />
                <label htmlFor="kyc-terms" className="text-xs text-slate leading-relaxed">
                  I confirm that all information provided is accurate. I agree to WITHH&apos;s code of conduct, privacy policy, and terms of service. I understand that providing false information may result in permanent deactivation.
                </label>
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceedStep()}
              className="flex-1 bg-copper text-white py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 min-h-[48px]"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !canProceedStep()}
              className="flex-1 bg-green text-white py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 min-h-[48px]"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit KYC'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
