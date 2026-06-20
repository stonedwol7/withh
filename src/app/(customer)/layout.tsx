import { Toaster } from 'sonner'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors />
    </>
  )
}
