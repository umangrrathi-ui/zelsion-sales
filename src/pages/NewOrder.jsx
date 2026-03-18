import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppHeader from '../components/Layout/AppHeader'
import ClientForm from '../components/Clients/ClientForm'
import { useToast } from '../components/UI/Toast'
import { generateOrderNumber, INQUIRY_SOURCES } from '../lib/utils'
import { getProducts, formatOrderItems } from '../lib/products'
import { Plus, Trash2 } from 'lucide-react'

export default function NewOrder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const presetClientId = searchParams.get('client')
  const toast = useToast()

  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(presetClientId || '')
  const [showNewClient, setShowNewClient] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [products] = useState(getProducts())

  // Product line items
  const [items, setItems] = useState([{ name: '', qty: '' }])

  const [form, setForm] = useState({
    inquiry_date: new Date().toISOString().split('T')[0],
    inquiry_source: '',
    inquiry_notes: '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const addItem = () => {
    setItems(prev => [...prev, { name: '', qty: '' }])
  }

  const removeItem = (index) => {
    if (items.length <= 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    supabase.from('clients').select('id, company_name').order('company_name').then(({ data }) => setClients(data || []))
  }, [])

  const handleNewClient = async (data) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: client, error } = await supabase.from('clients').insert({ ...data, created_by: user.id }).select().single()
    if (error) { toast.error(error.message); setSaving(false); return }
    setClients(prev => [...prev, client].sort((a, b) => a.company_name.localeCompare(b.company_name)))
    setSelectedClient(client.id)
    setShowNewClient(false)
    toast.success('Client created!')
    setSaving(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedClient) { toast.error('Select a client first'); return }
    const validItems = items.filter(i => i.name)
    if (validItems.length === 0) { toast.error('Add at least one product'); return }

    setSaving(true)
    const orderNumber = await generateOrderNumber(supabase)
    const { data: { user } } = await supabase.auth.getUser()
    const { product_name, quantity_kg } = formatOrderItems(validItems)

    const { data, error } = await supabase.from('sales_orders').insert({
      client_id: selectedClient,
      order_number: orderNumber,
      current_stage: 'inquiry',
      inquiry_date: form.inquiry_date,
      inquiry_source: form.inquiry_source,
      inquiry_notes: form.inquiry_notes,
      product_name,
      quantity_kg,
      created_by: user.id,
    }).select().single()
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Order created!')
    navigate(`/orders/${data.id}`)
  }

  const [showClientList, setShowClientList] = useState(!presetClientId)
  const filteredClients = clients.filter(c => c.company_name.toLowerCase().includes(clientSearch.toLowerCase()))
  const selectedClientName = clients.find(c => c.id === selectedClient)?.company_name || ''
  const hasValidProduct = items.some(i => i.name)

  return (
    <div className="pb-20">
      <AppHeader title="New Inquiry" showBack />
      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        {/* Client Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Client *</label>
          {!showNewClient ? (
            <>
              {selectedClient && !showClientList ? (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-navy/10 border border-navy/20">
                    <span className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center text-xs font-bold">{selectedClientName.charAt(0)}</span>
                    <span className="text-sm font-medium text-navy">{selectedClientName}</span>
                  </div>
                  <button type="button" onClick={() => { setShowClientList(true); setSelectedClient(''); setClientSearch('') }}
                    className="px-3 py-3 text-xs text-gray-500 bg-gray-100 rounded-xl font-medium">Change</button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={e => { setClientSearch(e.target.value); setSelectedClient('') }}
                    placeholder="Search clients..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none mb-2"
                  />
                  <div className="max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl">
                    {filteredClients.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedClient(c.id); setClientSearch(c.company_name); setShowClientList(false) }}
                        className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 ${selectedClient === c.id ? 'bg-navy/10 text-navy font-medium' : 'text-gray-700 active:bg-gray-50'}`}
                      >
                        {c.company_name}
                      </button>
                    ))}
                    {filteredClients.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">No clients found</p>}
                  </div>
                </>
              )}
              <button type="button" onClick={() => setShowNewClient(true)} className="mt-2 text-sm text-navy font-medium">
                + Create New Client
              </button>
            </>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">New Client</h3>
              <ClientForm onSubmit={handleNewClient} onCancel={() => setShowNewClient(false)} loading={saving} />
            </div>
          )}
        </div>

        {/* Inquiry Fields */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Inquiry Details</h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Inquiry Date</label>
              <input type="date" value={form.inquiry_date} onChange={e => set('inquiry_date', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Source *</label>
              <select value={form.inquiry_source} onChange={e => set('inquiry_source', e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none bg-white">
                <option value="">Select source</option>
                {INQUIRY_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Product Lines */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Products *</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-xs font-medium text-navy bg-navy/10 px-3 py-1.5 rounded-full"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-gray-500 flex-1">Product {index + 1}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="p-1 text-gray-300 active:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <select
                      value={item.name}
                      onChange={e => updateItem(index, 'name', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy bg-white"
                    >
                      <option value="">Select product</option>
                      {products.map(p => <option key={p} value={p}>{p}</option>)}
                      <option value="__custom">Other (type below)</option>
                    </select>
                    {item.name === '__custom' && (
                      <input
                        type="text"
                        placeholder="Enter product name"
                        onChange={e => updateItem(index, 'name', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mt-2"
                      />
                    )}
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={e => updateItem(index, 'qty', e.target.value)}
                      placeholder="Qty (kg)"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea rows={3} value={form.inquiry_notes} onChange={e => set('inquiry_notes', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none resize-none" />
        </div>

        <button type="submit" disabled={saving || !selectedClient || !hasValidProduct}
          className="w-full py-3.5 bg-navy text-white rounded-xl font-semibold disabled:opacity-50 mt-2">
          {saving ? 'Creating...' : 'Create Inquiry'}
        </button>
      </form>
    </div>
  )
}
