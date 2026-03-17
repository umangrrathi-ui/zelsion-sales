import { useState } from 'react'
import { formatDate } from '../../../lib/utils'

export default function Stage7Dispatch({ order, onSave, onUpload, expanded, loading }) {
  const [form, setForm] = useState({
    batch_number: order.batch_number || '',
    expected_dispatch_date: order.expected_dispatch_date || '',
    actual_dispatch_date: order.actual_dispatch_date || '',
    transport_company: order.transport_company || '',
    lr_number: order.lr_number || '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>Batch: {order.batch_number} &middot; LR: {order.lr_number}</p>
        <p className="text-xs text-gray-400 mt-0.5">Dispatched: {formatDate(order.actual_dispatch_date)} &middot; {order.transport_company}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Batch Number</label>
        <input value={form.batch_number} onChange={e => set('batch_number', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Expected Dispatch</label>
          <input type="date" value={form.expected_dispatch_date} onChange={e => set('expected_dispatch_date', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Actual Dispatch</label>
          <input type="date" value={form.actual_dispatch_date} onChange={e => set('actual_dispatch_date', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Transport Company</label>
        <input value={form.transport_company} onChange={e => set('transport_company', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">LR Number (Lorry Receipt)</label>
        <input value={form.lr_number} onChange={e => set('lr_number', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Upload E-way Bill (PDF)</label>
        <input type="file" accept=".pdf,image/*" onChange={e => e.target.files[0] && onUpload(e.target.files[0], 'Eway_Bill')}
          className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700" />
      </div>
      <button onClick={() => onSave({ ...form, current_stage: 'invoice' })} disabled={loading}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : 'Save & Generate Invoice'}
      </button>
      <button onClick={() => onSave(form)} disabled={loading}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50">
        Save Draft
      </button>
    </div>
  )
}
