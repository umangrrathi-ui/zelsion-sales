import { useState } from 'react'
import { INQUIRY_SOURCES, formatDate } from '../../../lib/utils'
import { getProducts, parseOrderItems, formatOrderItems, getProductDisplay } from '../../../lib/products'
import { Plus, Trash2 } from 'lucide-react'

export default function Stage1Inquiry({ order, onSave, expanded, loading }) {
  const products = getProducts()
  const existingItems = parseOrderItems(order.product_name, order.quantity_kg)

  const [items, setItems] = useState(
    existingItems.length > 0 ? existingItems : [{ name: '', qty: '' }]
  )
  const [form, setForm] = useState({
    inquiry_date: order.inquiry_date || new Date().toISOString().split('T')[0],
    inquiry_source: order.inquiry_source || '',
    inquiry_notes: order.inquiry_notes || '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }
  const addItem = () => setItems(prev => [...prev, { name: '', qty: '' }])
  const removeItem = (index) => {
    if (items.length <= 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = (nextStage) => {
    const validItems = items.filter(i => i.name && i.name !== '__custom')
    const { product_name, quantity_kg } = formatOrderItems(validItems)
    const updates = { ...form, product_name, quantity_kg }
    if (nextStage) updates.current_stage = nextStage
    onSave(updates)
  }

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>{getProductDisplay(order.product_name)}</p>
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

      {/* Product Lines */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-gray-600">Products</label>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-[10px] font-medium text-navy bg-navy/10 px-2 py-1 rounded-full">
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <div className="flex gap-2 items-center">
                <select
                  value={products.includes(item.name) ? item.name : (item.name ? '__custom' : '')}
                  onChange={e => {
                    if (e.target.value === '__custom') updateItem(index, 'name', '')
                    else updateItem(index, 'name', e.target.value)
                  }}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy bg-white"
                >
                  <option value="">Select</option>
                  {products.map(p => <option key={p} value={p}>{p}</option>)}
                  <option value="__custom">Other...</option>
                </select>
                <input
                  type="number"
                  value={item.qty}
                  onChange={e => updateItem(index, 'qty', e.target.value)}
                  placeholder="kg"
                  className="w-20 px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono"
                />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)} className="p-1 text-gray-300">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              {!products.includes(item.name) && item.name !== '' && item.name !== '__custom' && (
                <input
                  type="text"
                  value={item.name}
                  onChange={e => updateItem(index, 'name', e.target.value)}
                  placeholder="Custom product name"
                  className="w-full px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm outline-none focus:border-navy"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea rows={2} value={form.inquiry_notes} onChange={e => set('inquiry_notes', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy resize-none" />
      </div>
      <button onClick={() => handleSave('quotation')} disabled={loading}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : 'Save & Move to Quotation'}
      </button>
      <button onClick={() => handleSave(null)} disabled={loading}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50">
        Save Draft
      </button>
    </div>
  )
}
