import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './components/UI/Toast'
import BottomNav from './components/Layout/BottomNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Orders from './pages/Orders'
import OrderJourney from './pages/OrderJourney'
import NewOrder from './pages/NewOrder'
import Followups from './pages/Followups'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function ProtectedLayout() {
  return (
    <div className="min-h-dvh bg-bg">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/new" element={<NewOrder />} />
        <Route path="/orders/:id" element={<OrderJourney />} />
        <Route path="/followups" element={<Followups />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4 animate-pulse">
            <span className="text-2xl font-bold text-navy-dark">ZS</span>
          </div>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      {user ? <ProtectedLayout /> : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </ToastProvider>
  )
}
