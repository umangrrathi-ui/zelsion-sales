import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

const ToastContext = createContext({})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const toast = useCallback({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
  }, [addToast])

  // Make toast callable with .success() and .error()
  const toastFn = useCallback((msg) => addToast(msg, 'success'), [addToast])
  toastFn.success = (msg) => addToast(msg, 'success')
  toastFn.error = (msg) => addToast(msg, 'error')

  return (
    <ToastContext.Provider value={toastFn}>
      {children}
      <div className="fixed top-16 right-4 left-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-slide-down ${
              t.type === 'success' ? 'bg-success' : 'bg-danger'
            }`}
          >
            {t.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}><X size={16} /></button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
