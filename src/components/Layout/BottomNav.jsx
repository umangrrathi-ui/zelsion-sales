import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, Package, Plus, MoreHorizontal, CalendarClock, BarChart3, Settings, X, BoxesIcon } from 'lucide-react'

const mainTabs = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/orders/new', label: 'New', icon: Plus, isFab: true },
  { path: '/orders', label: 'Orders', icon: Package },
]

const moreItems = [
  { path: '/followups', label: 'Follow-ups', icon: CalendarClock, desc: 'Track pending follow-ups' },
  { path: '/products', label: 'Manage Products', icon: BoxesIcon, desc: 'Add or edit product catalog' },
  { path: '/reports', label: 'Reports', icon: BarChart3, desc: 'Sales analytics & insights' },
  { path: '/settings', label: 'Settings', icon: Settings, desc: 'Account & preferences' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    if (path === '/orders/new') return location.pathname === '/orders/new'
    return location.pathname.startsWith(path)
  }

  const isMoreActive = moreItems.some(item => isActive(item.path))

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl pb-safe animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-base font-semibold text-gray-900">More Options</h3>
              <button onClick={() => setShowMore(false)} className="p-1.5 rounded-full bg-gray-100 active:bg-gray-200">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="px-4 pb-6 flex flex-col gap-1">
              {moreItems.map(item => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setShowMore(false)
                    }}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition ${
                      active ? 'bg-navy/5' : 'active:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      active ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${active ? 'text-navy' : 'text-gray-900'}`}>{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto h-16">
          {mainTabs.map((tab) => {
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
          {/* More Button */}
          <button
            onClick={() => setShowMore(true)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 ${isMoreActive ? 'text-navy' : 'text-gray-400'}`}
          >
            <MoreHorizontal size={22} strokeWidth={isMoreActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
