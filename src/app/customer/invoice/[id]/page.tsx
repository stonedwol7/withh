'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { useRef } from 'react'
import { ArrowLeft, Printer, Download } from 'lucide-react'
import { format } from 'date-fns'
import { CATEGORY_LABELS, PRICING } from '@/lib/constants'

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const request = useAppStore((s) => s.getRequest(params.id as string))
  const payment = useAppStore((s) => s.getPaymentByRequest(params.id as string))
  const partner = useAppStore((s) => s.getPartnerByRequest(params.id as string))
  const invoiceRef = useRef<HTMLDivElement>(null)

  if (!request || !payment) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <p className="text-muted-foreground">Invoice not available</p>
      </div>
    )
  }

  const handlePrint = () => {
    const content = invoiceRef.current
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>WITHH Invoice</title>
      <style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto}
      h1{font-size:24px;margin-bottom:4px}.muted{color:#666;font-size:14px}
      table{width:100%;border-collapse:collapse;margin-top:24px}
      th,td{padding:12px 8px;text-align:left;border-bottom:1px solid #ddd}
      .total{font-weight:bold;font-size:18px;margin-top:16px}
      .footer{margin-top:40px;font-size:12px;color:#999;text-align:center}
      @media print{body{padding:20px}button{display:none}}
      </style></head><body>
      ${content.innerHTML}
      <script>window.print()</script>
      </body></html>
    `)
    win.document.close()
  }

  const isSensitive = ['hospital', 'interview', 'elderly'].includes(request.category)
  const amount = isSensitive ? PRICING.sensitive : PRICING.standard

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-accent">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="p-2 rounded-xl bg-muted hover:bg-muted/80">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={invoiceRef} className="bg-white text-gray-900 rounded-3xl p-8 shadow-sm border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">WITHH</h1>
          <p className="text-sm text-gray-500">When you can&apos;t go alone, we&apos;ll go with you.</p>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-sm font-semibold">Invoice</p>
            <p className="text-xs text-gray-500">#{payment.id}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Date: {format(new Date(payment.createdAt), 'MMM dd, yyyy')}</p>
            <p>Status: <span className="text-green font-medium">Paid</span></p>
          </div>
        </div>

        <table>
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-xs text-gray-500 font-medium pb-2">Description</th>
              <th className="text-xs text-gray-500 font-medium pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 text-sm">
                {CATEGORY_LABELS[request.category]} Support
                <div className="text-xs text-gray-400">{format(new Date(request.date), 'MMM dd, yyyy')} at {request.time}</div>
              </td>
              <td className="py-3 text-sm text-right">₹{amount}</td>
            </tr>
            {payment.additionalTimeFee > 0 && (
              <tr>
                <td className="py-3 text-sm">Additional time</td>
                <td className="py-3 text-sm text-right">₹{payment.additionalTimeFee}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-gray-200">
          <span className="text-sm font-semibold">Total Paid</span>
          <span className="text-xl font-bold">₹{payment.amount}</span>
        </div>

        {partner && (
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Support Partner</p>
            <p className="text-sm font-semibold">{partner.name}</p>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-400 text-center space-y-1">
          <p>WITHH Technologies Pvt. Ltd.</p>
          <p>GST: 29AABCU9603R1ZX</p>
          <p>support@withh.in</p>
        </div>
      </div>
    </div>
  )
}
