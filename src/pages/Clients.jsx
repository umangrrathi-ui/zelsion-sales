import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, X } from 'lucide-react'
import AppHeader from '../components/Layout/AppHeader'
import ClientCard from '../components/Clients/ClientCard'
import ClientForm from '../components/Clients/ClientForm'
import { SkeletonList } from '../components/UI/Skeleton'
import EmptyState from '../components/UI/EmptyState'
import { useClients } from '../lib/hooks/useClients'
import { useToast } from '../components/UI/Toast'

export default function Clients() {
  const navigate = useNavigate()
  const { clients, loading, createClient } = useClients()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const filtered = clients.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_person || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (data) => {
    setSaving(true)
    const { error } = await createClient(data)
    if (error) toast.error(error.message)
    else { toast.success('Client added!'); setShowForm(false) }
    setSaving(false)
  }

  return (
    <div className="pb-20">
      <AppHeader title="Clients" />

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none bg-white"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : (
        <div className="px-4 mt-3 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <EmptyState title="No clients found" message="Add your first client to get started" action={() => setShowForm(true)} actionLabel="+ Add Client" />
          ) : (
            filtered.map(c => <ClientCard key={c.id} client={c} />)
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-accent rounded-full shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <Plus size={28} className="text-navy-dark" />
      </button>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Client</h2>
              <button onClick={() => setShowForm(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            <ClientForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
          </div>
        </div>
      )}
    </div>
  )
}
