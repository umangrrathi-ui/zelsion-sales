import { useState } from 'react'
import { INDIAN_STATES } from '../../lib/utils'

export default function ClientForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    company_name: initial.company_name || '',
    contact_person: initial.contact_person || '',
    phone: initial.phone || '',
    email: initial.email || '',
    city: initial.city || '',
    state: initial.state || 'Gujarat',
    gst_number: initial.gst_number || '',
    product_interest: initial.product_interest || '',
    notes: initial.notes || '',
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
        <input required value={form.company_name} onChange={e => set('company_name', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
          <input value={form.contact_person} onChange={e => set('contact_person', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input value={form.city} onChange={e => set('city', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <select value={form.state} onChange={e => set('state', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none bg-white">
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
        <input value={form.gst_number} onChange={e => set('gst_number', e.target.value.toUpperCase())} maxLength={15}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none mono" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Interest</label>
        <input value={form.product_interest} onChange={e => set('product_interest', e.target.value)} placeholder="MCC PH 101, MCC PH 102"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none resize-none" />
      </div>
      <div className="flex gap-3 mt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium">Cancel</button>
        )}
        <button type="submit" disabled={loading} className="flex-1 py-3 bg-navy text-white rounded-xl font-medium disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Client'}
        </button>
      </div>
    </form>
  )
}
