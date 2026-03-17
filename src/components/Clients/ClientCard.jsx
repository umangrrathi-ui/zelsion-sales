import { useNavigate } from 'react-router-dom'
import { Phone, MapPin, Package } from 'lucide-react'
import StageBadge from '../UI/StageBadge'

export default function ClientCard({ client }) {
  const navigate = useNavigate()
  const orders = client.sales_orders || []
  const latestOrder = orders.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]

  return (
    <button
      onClick={() => navigate(`/clients/${client.id}`)}
      className="bg-white rounded-xl p-4 shadow-sm text-left w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-[15px] truncate">{client.company_name}</h3>
          {client.contact_person && (
            <p className="text-sm text-gray-600 mt-0.5">{client.contact_person}</p>
          )}
        </div>
        {latestOrder && <StageBadge stage={latestOrder.current_stage} />}
      </div>
      <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500">
        {client.phone && (
          <span className="flex items-center gap-1"><Phone size={12} /> {client.phone}</span>
        )}
        {client.city && (
          <span className="flex items-center gap-1"><MapPin size={12} /> {client.city}</span>
        )}
        <span className="flex items-center gap-1"><Package size={12} /> {orders.length} orders</span>
      </div>
    </button>
  )
}
