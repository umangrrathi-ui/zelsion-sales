import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, Package, Plus } from 'lucide-react'

const tabs = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/orders/new', label: 'New', icon: Plus, isFab: true },
  { path: '/orders', label: 'Orders', icon: Package },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    if (path === '/orders/new') return location.pathname === '/orders/new'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.path)
          if (tab.isFab) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex items-center justify-center w-14 h-14 -mt-5 bg-accent rounded-full shadow-lg active:scale-95 transition-transform"
              >
                <Icon size={28} className="text-navy-dark" strokeWidth={2.5} />
              </button>
            )
          }
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 ${active ? 'text-navy' : 'text-gray-400'}`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
