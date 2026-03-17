import { useState } from 'react'
import { PRODUCTS, INQUIRY_SOURCES, formatDate } from '../../../lib/utils'

export default function Stage1Inquiry({ order, onSave, expanded, loading }) {
  const [form, setForm] = useState({
    inquiry_date: order.inquiry_date || new Date().toISOString().split('T')[0],
    inquiry_source: order.inquiry_source || '',
    product_name: order.product_name || '',
    quantity_kg: order.quantity_kg || '',
    inquiry_notes: order.inquiry_notes || '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>{order.product_name} &middot; {order.quantity_kg} kg</p>
        <p className="text-xs text-gray-400 mt-0.5">Source: {order.inquiry_source} &middot; {formatDate(order.inquiry_date)}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Inquiry Date</label>
        <input type="date" value={form.inquiry_date} onChange={e => set('inquiry_date', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
        <select value={form.inquiry_source} onChange={e => set('inquiry_source', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy bg-white">
          <option value="">Select source</option>
          {INQUIRY_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
        <select value={form.product_name} onChange={e => set('product_name', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy bg-white">
          <option value="">Select product</option>
          {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Quantity Required (kg)</label>
        <input type="number" value={form.quantity_kg} onChange={e => set('quantity_kg', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea rows={2} value={form.inquiry_notes} onChange={e => set('inquiry_notes', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy resize-none" />
      </div>
      <button onClick={() => onSave({ ...form, current_stage: 'quotation' })} disabled={loading}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : 'Save & Move to Quotation'}
      </button>
      <button onClick={() => onSave(form)} disabled={loading}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50">
        Save Draft
      </button>
    </div>
  )
}
