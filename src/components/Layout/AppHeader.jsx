import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LogOut, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AppHeader({ title, showBack, onBack }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/orders?search=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  return (
    <header className="bg-navy text-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={onBack || (() => navigate(-1))} className="p-1">
              <ArrowLeft size={22} />
            </button>
          )}
          <h1 className="text-lg font-semibold truncate">{title || 'Zelsion Sales'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-full hover:bg-navy-light">
            <Search size={20} />
          </button>
          <button onClick={signOut} className="p-2 rounded-full hover:bg-navy-light">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      {searchOpen && (
        <form onSubmit={handleSearch} className="px-4 pb-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search clients or order numbers..."
            autoFocus
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 outline-none focus:bg-white/20"
          />
        </form>
      )}
    </header>
  )
}
