import { useState } from 'react'
import { formatDate, formatCurrency } from '../../../lib/utils'

export default function Stage2Quotation({ order, onSave, onUpload, expanded, loading }) {
  const year = new Date().getFullYear()
  const [form, setForm] = useState({
    quotation_date: order.quotation_date || new Date().toISOString().split('T')[0],
    quotation_number: order.quotation_number || `QUO-${year}-`,
    quoted_price_per_kg: order.quoted_price_per_kg || '',
    quotation_validity_days: order.quotation_validity_days || 30,
    quotation_notes: order.quotation_notes || '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const totalQuoted = form.quoted_price_per_kg && order.quantity_kg ? Number(form.quoted_price_per_kg) * Number(order.quantity_kg) : 0

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>{order.quotation_number} &middot; {formatCurrency(order.quoted_price_per_kg)}/kg</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.quotation_date)} &middot; Valid {order.quotation_validity_days} days</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Quotation Number</label>
        <input value={form.quotation_number} onChange={e => set('quotation_number', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Quotation Date</label>
        <input type="date" value={form.quotation_date} onChange={e => set('quotation_date', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Rate per KG (INR)</label>
        <input type="number" value={form.quoted_price_per_kg} onChange={e => set('quoted_price_per_kg', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      {totalQuoted > 0 && (
        <div className="bg-blue-50 rounded-lg px-3 py-2 text-sm">
          <span className="text-gray-600">Total Quoted: </span>
          <span className="font-semibold text-navy mono">{formatCurrency(totalQuoted)}</span>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Validity (days)</label>
        <input type="number" value={form.quotation_validity_days} onChange={e => set('quotation_validity_days', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea rows={2} value={form.quotation_notes} onChange={e => set('quotation_notes', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Upload Quotation PDF (optional)</label>
        <input type="file" accept=".pdf,image/*" onChange={e => e.target.files[0] && onUpload(e.target.files[0], 'Quotation')}
          className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700" />
      </div>
      <button onClick={() => onSave({ ...form, current_stage: 'followup' })} disabled={loading}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : 'Save & Move to Follow-up'}
      </button>
      <button onClick={() => onSave(form)} disabled={loading}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50">
        Save Draft
      </button>
    </div>
  )
}
