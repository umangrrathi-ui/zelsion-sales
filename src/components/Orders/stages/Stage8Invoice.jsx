import { useState, useMemo } from 'react'
import { formatDate, formatCurrency } from '../../../lib/utils'

export default function Stage8Invoice({ order, onSave, onUpload, expanded, loading }) {
  const [form, setForm] = useState({
    invoice_number: order.invoice_number || '',
    invoice_date: order.invoice_date || new Date().toISOString().split('T')[0],
    taxable_amount: order.taxable_amount || order.po_amount || '',
    gst_amount: order.gst_amount || '',
    invoice_amount: order.invoice_amount || '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const isInterstate = order.clients?.state && order.clients.state !== 'Gujarat'

  useMemo(() => {
    if (form.taxable_amount) {
      const tax = Number(form.taxable_amount) * 0.18
      const total = Number(form.taxable_amount) + tax
      setForm(p => ({ ...p, gst_amount: tax.toFixed(2), invoice_amount: total.toFixed(2) }))
    }
  }, [form.taxable_amount])

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>Invoice #{order.invoice_number} &middot; {formatCurrency(order.invoice_amount)}</p>
        <p className="text-xs text-gray-400 mt-0.5">GST: {formatCurrency(order.gst_amount)} &middot; {formatDate(order.invoice_date)}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Invoice Number</label>
          <input value={form.invoice_number} onChange={e => set('invoice_number', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Invoice Date</label>
          <input type="date" value={form.invoice_date} onChange={e => set('invoice_date', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Taxable Amount (INR)</label>
        <input type="number" value={form.taxable_amount} onChange={e => set('taxable_amount', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      <div className="bg-blue-50 rounded-lg px-3 py-2 text-sm space-y-1">
        <p className="text-gray-600">GST @ 18%: <span className="font-semibold mono">{formatCurrency(Number(form.gst_amount))}</span></p>
        {isInterstate ? (
          <p className="text-xs text-gray-500">IGST: {formatCurrency(Number(form.gst_amount))}</p>
        ) : (
          <p className="text-xs text-gray-500">CGST (9%): {formatCurrency(Number(form.gst_amount) / 2)} + SGST (9%): {formatCurrency(Number(form.gst_amount) / 2)}</p>
        )}
        <p className="text-gray-700 font-semibold">Total: <span className="mono">{formatCurrency(Number(form.invoice_amount))}</span></p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Upload Tax Invoice PDF (Required) *</label>
        <input type="file" accept=".pdf,image/*" onChange={e => e.target.files[0] && onUpload(e.target.files[0], 'Tax_Invoice')}
          className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700" />
      </div>
      <button onClick={() => onSave({ ...form, current_stage: 'delivery' })} disabled={loading}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : 'Save & Track Delivery'}
      </button>
      <button onClick={() => onSave(form)} disabled={loading}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50">
        Save Draft
      </button>
    </div>
  )
}
