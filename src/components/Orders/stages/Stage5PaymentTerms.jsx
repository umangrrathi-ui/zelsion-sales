import { useState } from 'react'
import { PAYMENT_TYPES, CREDIT_DAYS_OPTIONS, PAYMENT_MODES } from '../../../lib/utils'

export default function Stage5PaymentTerms({ order, onSave, expanded, loading }) {
  const [form, setForm] = useState({
    payment_terms: order.payment_terms || '',
    advance_percentage: order.advance_percentage || 0,
    credit_days: order.credit_days || 0,
    payment_mode: order.payment_mode || '',
  })
  const [customDays, setCustomDays] = useState(
    !CREDIT_DAYS_OPTIONS.includes(order.credit_days || 0) && (order.credit_days || 0) > 0
  )
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const showAdvance = form.payment_terms === 'Part Advance + Credit'

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>{order.payment_terms} &middot; {order.payment_mode}</p>
        <p className="text-xs text-gray-400 mt-0.5">{order.advance_percentage}% advance, {order.credit_days} days credit</p>
      </div>
    )
  }

  const getNextStage = () => {
    if (form.payment_terms === '100% Advance' || (form.payment_terms === 'Part Advance + Credit' && form.advance_percentage > 0)) {
      return 'advance_payment'
    }
    return 'dispatch'
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Payment Type</label>
        <select value={form.payment_terms} onChange={e => {
          set('payment_terms', e.target.value)
          if (e.target.value === '100% Advance') setForm(p => ({ ...p, payment_terms: e.target.value, advance_percentage: 100, credit_days: 0 }))
          if (e.target.value === 'Full Credit') setForm(p => ({ ...p, payment_terms: e.target.value, advance_percentage: 0 }))
        }}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy bg-white">
          <option value="">Select type</option>
          {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {showAdvance && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Advance Percentage (%)</label>
          <input type="number" min={0} max={100} value={form.advance_percentage} onChange={e => set('advance_percentage', Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Credit Days</label>
        {!customDays ? (
          <div className="flex gap-2">
            <select
              value={form.credit_days}
              onChange={e => {
                if (e.target.value === '__custom') {
                  setCustomDays(true)
                  set('credit_days', '')
                } else {
                  set('credit_days', Number(e.target.value))
                }
              }}
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy bg-white"
            >
              {CREDIT_DAYS_OPTIONS.map(d => <option key={d} value={d}>{d} days</option>)}
              <option value="__custom">Custom...</option>
            </select>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={0}
              value={form.credit_days}
              onChange={e => set('credit_days', Number(e.target.value) || 0)}
              placeholder="Enter days"
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono"
            />
            <span className="text-sm text-gray-500">days</span>
            <button
              type="button"
              onClick={() => { setCustomDays(false); set('credit_days', 0) }}
              className="text-xs text-navy font-medium px-2 py-1 bg-navy/10 rounded-lg"
            >
              Presets
            </button>
          </div>
        )}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Payment Mode</label>
        <select value={form.payment_mode} onChange={e => set('payment_mode', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy bg-white">
          <option value="">Select mode</option>
          {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <button onClick={() => onSave({ ...form, current_stage: getNextStage() })} disabled={loading}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : 'Save & Continue'}
      </button>
      <button onClick={() => onSave(form)} disabled={loading}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50">
        Save Draft
      </button>
    </div>
  )
}
