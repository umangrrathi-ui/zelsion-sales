import { useState, useMemo } from 'react'
import { formatDate, formatCurrency } from '../../../lib/utils'

export default function Stage10Payment({ order, onSave, expanded, loading }) {
  const balanceDue = useMemo(() => {
    const inv = Number(order.invoice_amount) || 0
    const adv = Number(order.advance_amount) || 0
    return inv - adv
  }, [order.invoice_amount, order.advance_amount])

  const [form, setForm] = useState({
    balance_amount: order.balance_amount || balanceDue || '',
    balance_received_date: order.balance_received_date || '',
    balance_utr: order.balance_utr || '',
    payment_completed: order.payment_completed || false,
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        {order.payment_completed ? (
          <p className="text-success font-semibold">Payment Completed ✅</p>
        ) : (
          <p>Balance: {formatCurrency(order.balance_amount || balanceDue)}</p>
        )}
        {order.balance_utr && <p className="text-xs text-gray-400 mt-0.5">UTR: {order.balance_utr} &middot; {formatDate(order.balance_received_date)}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-blue-50 rounded-lg px-3 py-2 text-sm">
        <div className="flex justify-between"><span>Invoice Total:</span> <span className="mono font-medium">{formatCurrency(order.invoice_amount)}</span></div>
        <div className="flex justify-between"><span>Advance Received:</span> <span className="mono font-medium">{formatCurrency(order.advance_amount)}</span></div>
        <div className="flex justify-between border-t border-blue-200 mt-1 pt-1 font-semibold"><span>Balance Due:</span> <span className="mono">{formatCurrency(balanceDue)}</span></div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Balance Amount (INR)</label>
        <input type="number" value={form.balance_amount} onChange={e => set('balance_amount', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Balance Received Date</label>
        <input type="date" value={form.balance_received_date} onChange={e => set('balance_received_date', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">UTR / Transaction Reference</label>
        <input value={form.balance_utr} onChange={e => set('balance_utr', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      <label className="flex items-center gap-3 p-3 bg-green-50 rounded-lg cursor-pointer">
        <input type="checkbox" checked={form.payment_completed} onChange={e => set('payment_completed', e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-success focus:ring-success" />
        <span className="text-sm font-medium text-gray-700">Payment Fully Received</span>
      </label>
      <button onClick={() => onSave(form)} disabled={loading}
        className="w-full py-2.5 bg-success text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : form.payment_completed ? 'Mark Order Complete' : 'Save Payment Info'}
      </button>
    </div>
  )
}
