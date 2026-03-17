import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { FOLLOWUP_MODES, FOLLOWUP_STATUSES, formatDate } from '../../../lib/utils'

const modeIcons = { Call: '📞', WhatsApp: '💬', Email: '📧', Visit: '🤝', Meeting: '🤝' }
const statusColors = { Hot: 'bg-red-100 text-red-700', Warm: 'bg-orange-100 text-orange-700', Cold: 'bg-blue-100 text-blue-700', Converted: 'bg-green-100 text-green-700', Lost: 'bg-gray-100 text-gray-700' }

export default function Stage3Followup({ order, onSave, expanded, loading }) {
  const [followups, setFollowups] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    followup_date: new Date().toISOString().split('T')[0],
    mode: 'Call',
    talked_to: '',
    notes: '',
    next_followup_date: '',
    status: 'Warm',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => { loadFollowups() }, [order.id])

  async function loadFollowups() {
    const { data } = await supabase
      .from('followups')
      .select('*')
      .eq('sales_order_id', order.id)
      .order('followup_date', { ascending: false })
    setFollowups(data || [])
  }

  async function addFollowup() {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('followups').insert({
      sales_order_id: order.id,
      followup_date: form.followup_date,
      mode: form.mode,
      talked_to: form.talked_to,
      notes: form.notes,
      next_followup_date: form.next_followup_date || null,
      next_action: form.status,
      created_by: user.id,
    })
    if (!error) {
      await onSave({
        last_followup_date: form.followup_date,
        next_followup_date: form.next_followup_date || null,
        followup_status: form.status,
      })
      await loadFollowups()
      setShowAdd(false)
      setForm({ followup_date: new Date().toISOString().split('T')[0], mode: 'Call', talked_to: '', notes: '', next_followup_date: '', status: 'Warm' })
    }
  }

  async function moveNext() {
    await onSave({ current_stage: 'po_received', followup_status: 'Converted' })
  }

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>Status: <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.followup_status] || 'bg-gray-100'}`}>{order.followup_status || 'Pending'}</span></p>
        <p className="text-xs text-gray-400 mt-0.5">{followups.length} follow-ups logged &middot; Next: {formatDate(order.next_followup_date)}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Add Follow-up */}
      <button onClick={() => setShowAdd(!showAdd)} className="w-full py-2.5 bg-accent/20 text-amber-800 rounded-lg text-sm font-medium">
        + Add Follow-up
      </button>

      {showAdd && (
        <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" value={form.followup_date} onChange={e => set('followup_date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
              <select value={form.mode} onChange={e => set('mode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white">
                {FOLLOWUP_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Talked To</label>
            <input value={form.talked_to} onChange={e => set('talked_to', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes *</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Next Follow-up</label>
              <input type="date" value={form.next_followup_date} onChange={e => set('next_followup_date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white">
                {FOLLOWUP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button onClick={addFollowup} disabled={!form.notes || loading}
            className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {loading ? 'Saving...' : 'Log Follow-up'}
          </button>
        </div>
      )}

      {/* Follow-up List */}
      <div className="flex flex-col gap-2">
        {followups.map(f => (
          <div key={f.id} className="bg-white border border-gray-100 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">
                {modeIcons[f.mode] || ''} {f.mode} &middot; {formatDate(f.followup_date)}
              </span>
              {f.next_action && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[f.next_action] || 'bg-gray-100'}`}>{f.next_action}</span>
              )}
            </div>
            {f.talked_to && <p className="text-xs text-gray-500 mt-1">Talked to: {f.talked_to}</p>}
            <p className="text-sm text-gray-700 mt-1">{f.notes}</p>
            {f.next_followup_date && <p className="text-xs text-gray-400 mt-1">Next: {formatDate(f.next_followup_date)}</p>}
          </div>
        ))}
        {followups.length === 0 && <p className="text-xs text-gray-400 text-center py-3">No follow-ups logged yet</p>}
      </div>

      {/* Move to PO */}
      <button onClick={moveNext} disabled={loading}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-2">
        Move to PO Received
      </button>
    </div>
  )
}
