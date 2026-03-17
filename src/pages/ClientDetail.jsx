import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Phone, Mail, MapPin, FileText, Plus, Pencil, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AppHeader from '../components/Layout/AppHeader'
import ClientForm from '../components/Clients/ClientForm'
import StageBadge from '../components/UI/StageBadge'
import { SkeletonList } from '../components/UI/Skeleton'
import { useToast } from '../components/UI/Toast'
import { formatDate, formatCurrency } from '../lib/utils'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    const [clientRes, ordersRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('sales_orders').select('*').eq('client_id', id).order('created_at', { ascending: false })
    ])
    if (clientRes.data) setClient(clientRes.data)
    setOrders(ordersRes.data || [])
    setLoading(false)
  }

  async function handleUpdate(data) {
    setSaving(true)
    const { error } = await supabase.from('clients').update(data).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Client updated!'); setEditing(false); load() }
    setSaving(false)
  }

  if (loading) return <><AppHeader title="Client" showBack /><SkeletonList count={4} /></>
  if (!client) return <><AppHeader title="Client" showBack /><p className="p-4 text-center text-gray-500">Client not found</p></>

  return (
    <div className="pb-20">
      <AppHeader title={client.company_name} showBack />

      {editing ? (
        <div className="p-4">
          <ClientForm initial={client} onSubmit={handleUpdate} onCancel={() => setEditing(false)} loading={saving} />
        </div>
      ) : (
        <>
          {/* Client Info Card */}
          <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-gray-900">{client.company_name}</h2>
              <button onClick={() => setEditing(true)} className="p-2 text-gray-400 hover:text-navy">
                <Pencil size={18} />
              </button>
            </div>
            {client.contact_person && <p className="text-sm text-gray-600 mt-1">{client.contact_person}</p>}
            <div className="flex flex-col gap-2 mt-3 text-sm text-gray-600">
              {client.phone && <a href={`tel:${client.phone}`} className="flex items-center gap-2"><Phone size={14} className="text-navy" /> {client.phone}</a>}
              {client.email && <a href={`mailto:${client.email}`} className="flex items-center gap-2"><Mail size={14} className="text-navy" /> {client.email}</a>}
              {client.city && <span className="flex items-center gap-2"><MapPin size={14} className="text-navy" /> {client.city}, {client.state}</span>}
              {client.gst_number && <span className="flex items-center gap-2"><FileText size={14} className="text-navy" /> GST: <span className="mono">{client.gst_number}</span></span>}
            </div>
            {client.product_interest && (
              <p className="mt-3 text-xs text-gray-500">Products: {client.product_interest}</p>
            )}
          </div>

          {/* Orders */}
          <div className="mx-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Orders ({orders.length})</h3>
              <button onClick={() => navigate(`/orders/new?client=${id}`)} className="flex items-center gap-1 text-sm text-navy font-medium">
                <Plus size={16} /> New Order
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {orders.map(order => (
                <button key={order.id} onClick={() => navigate(`/orders/${order.id}`)} className="bg-white rounded-xl p-3.5 shadow-sm text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-gray-900 mono">{order.order_number}</span>
                    <StageBadge stage={order.current_stage} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{order.product_name} &middot; {formatDate(order.created_at)}</p>
                  {order.po_amount && <p className="text-xs text-gray-500 mono">PO: {formatCurrency(order.po_amount)}</p>}
                </button>
              ))}
              {orders.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
