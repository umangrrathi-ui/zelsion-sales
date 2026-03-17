import { useState } from 'react'
import { formatDate, formatCurrency } from '../../../lib/utils'

export default function Stage6Advance({ order, onSave, expanded, loading }) {
  const expectedAdvance = order.po_amount && order.advance_percentage ? (order.po_amount * order.advance_percentage / 100) : 0
  const [form, setForm] = useState({
    advance_amount: order.advance_amount || expectedAdvance || '',
    advance_received_date: order.advance_received_date || new Date().toISOString().split('T')[0],
    advance_utr: order.advance_utr || '',
    advance_notes: order.advance_notes || '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>{formatCurrency(order.advance_amount)} received</p>
        <p className="text-xs text-gray-400 mt-0.5">UTR: {order.advance_utr} &middot; {formatDate(order.advance_received_date)}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {expectedAdvance > 0 && (
        <div className="bg-yellow-50 rounded-lg px-3 py-2 text-sm">
          Expected advance ({order.advance_percentage}%): <span className="font-semibold mono">{formatCurrency(expectedAdvance)}</span>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Amount Received (INR)</label>
        <input type="number" value={form.advance_amount} onChange={e => set('advance_amount', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Date of Receipt</label>
        <input type="date" value={form.advance_received_date} onChange={e => set('advance_received_date', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">UTR / Transaction Reference</label>
        <input value={form.advance_utr} onChange={e => set('advance_utr', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea rows={2} value={form.advance_notes} onChange={e => set('advance_notes', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy resize-none" />
      </div>
      <button onClick={() => onSave({ ...form, current_stage: 'dispatch' })} disabled={loading}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : 'Save & Move to Dispatch'}
      </button>
      <button onClick={() => onSave(form)} disabled={loading}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50">
        Save Draft
      </button>
    </div>
  )
}
