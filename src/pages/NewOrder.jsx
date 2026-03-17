import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppHeader from '../components/Layout/AppHeader'
import ClientForm from '../components/Clients/ClientForm'
import { useToast } from '../components/UI/Toast'
import { generateOrderNumber, PRODUCTS, INQUIRY_SOURCES } from '../lib/utils'

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
  const [form, setForm] = useState({
    inquiry_date: new Date().toISOString().split('T')[0],
    inquiry_source: '',
    product_name: '',
    quantity_kg: '',
    inquiry_notes: '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

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
    setSaving(true)
    const orderNumber = await generateOrderNumber(supabase)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('sales_orders').insert({
      client_id: selectedClient,
      order_number: orderNumber,
      current_stage: 'inquiry',
      ...form,
      created_by: user.id,
    }).select().single()
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Order created!')
    navigate(`/orders/${data.id}`)
  }

  const filteredClients = clients.filter(c => c.company_name.toLowerCase().includes(clientSearch.toLowerCase()))

  return (
    <div className="pb-20">
      <AppHeader title="New Inquiry" showBack />
      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        {/* Client Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Client *</label>
          {!showNewClient ? (
            <>
              <input
                type="text"
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none mb-2"
              />
              <div className="max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl">
                {filteredClients.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setSelectedClient(c.id); setClientSearch(c.company_name) }}
                    className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 ${selectedClient === c.id ? 'bg-navy/10 text-navy font-medium' : 'text-gray-700'}`}
                  >
                    {c.company_name}
                  </button>
                ))}
                {filteredClients.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">No clients found</p>}
              </div>
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
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Product *</label>
              <select value={form.product_name} onChange={e => set('product_name', e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none bg-white">
                <option value="">Select product</option>
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity Required (kg)</label>
              <input type="number" value={form.quantity_kg} onChange={e => set('quantity_kg', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea rows={3} value={form.inquiry_notes} onChange={e => set('inquiry_notes', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none resize-none" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving || !selectedClient}
          className="w-full py-3.5 bg-navy text-white rounded-xl font-semibold disabled:opacity-50 mt-2">
          {saving ? 'Creating...' : 'Create Inquiry'}
        </button>
      </form>
    </div>
  )
}
