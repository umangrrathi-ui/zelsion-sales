import { useState } from 'react'
import { formatDate } from '../../../lib/utils'

export default function Stage9Delivery({ order, onSave, onUpload, expanded, loading }) {
  const [form, setForm] = useState({
    delivery_date: order.delivery_date || '',
    delivery_confirmed: order.delivery_confirmed || false,
    delivery_notes: order.delivery_notes || '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>Delivered: {formatDate(order.delivery_date)} {order.delivery_confirmed ? '✅' : ''}</p>
        {order.delivery_notes && <p className="text-xs text-gray-400 mt-0.5">{order.delivery_notes}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Actual Delivery Date</label>
        <input type="date" value={form.delivery_date} onChange={e => set('delivery_date', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Notes</label>
        <textarea rows={2} value={form.delivery_notes} onChange={e => set('delivery_notes', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Upload COA (Certificate of Analysis) *</label>
        <input type="file" accept=".pdf,image/*" onChange={e => e.target.files[0] && onUpload(e.target.files[0], 'COA')}
          className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700" />
      </div>
      <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
        <input type="checkbox" checked={form.delivery_confirmed} onChange={e => set('delivery_confirmed', e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-navy focus:ring-navy" />
        <span className="text-sm font-medium text-gray-700">Delivery Confirmed</span>
      </label>
      <button onClick={() => onSave({ ...form, current_stage: 'completed' })} disabled={loading || !form.delivery_confirmed}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : 'Save & Complete Payment'}
      </button>
      <button onClick={() => onSave(form)} disabled={loading}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50">
        Save Draft
      </button>
    </div>
  )
}
