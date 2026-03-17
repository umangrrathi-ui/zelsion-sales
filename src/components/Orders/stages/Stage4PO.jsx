import { useState } from 'react'
import { formatDate, formatCurrency } from '../../../lib/utils'

export default function Stage4PO({ order, onSave, onUpload, expanded, loading }) {
  const [form, setForm] = useState({
    po_date: order.po_date || new Date().toISOString().split('T')[0],
    po_number: order.po_number || '',
    po_quantity_kg: order.po_quantity_kg || order.quantity_kg || '',
    po_amount: order.po_amount || '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>PO #{order.po_number} &middot; {formatCurrency(order.po_amount)}</p>
        <p className="text-xs text-gray-400 mt-0.5">{order.po_quantity_kg} kg &middot; {formatDate(order.po_date)}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">PO Date</label>
          <input type="date" value={form.po_date} onChange={e => set('po_date', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">PO Number</label>
          <input value={form.po_number} onChange={e => set('po_number', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">PO Quantity (kg)</label>
          <input type="number" value={form.po_quantity_kg} onChange={e => set('po_quantity_kg', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">PO Amount (INR)</label>
          <input type="number" value={form.po_amount} onChange={e => set('po_amount', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Upload PO Document (Required) *</label>
        <input type="file" accept=".pdf,image/*" onChange={e => e.target.files[0] && onUpload(e.target.files[0], 'PO')}
          className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700" />
      </div>
      <button onClick={() => onSave({ ...form, current_stage: 'payment_terms' })} disabled={loading}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : 'Save & Set Payment Terms'}
      </button>
      <button onClick={() => onSave(form)} disabled={loading}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50">
        Save Draft
      </button>
    </div>
  )
}
