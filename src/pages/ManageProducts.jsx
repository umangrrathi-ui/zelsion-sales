import { useState } from 'react'
import AppHeader from '../components/Layout/AppHeader'
import { getProducts, addProduct, removeProduct } from '../lib/products'
import { Plus, Trash2, Package, X } from 'lucide-react'

export default function ManageProducts() {
  const [products, setProducts] = useState(getProducts())
  const [newName, setNewName] = useState('')
  const [message, setMessage] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    const success = addProduct(trimmed)
    if (success) {
      setProducts(getProducts())
      setNewName('')
      setMessage({ type: 'success', text: `"${trimmed}" added!` })
    } else {
      setMessage({ type: 'error', text: 'Product already exists' })
    }
    setTimeout(() => setMessage(null), 2500)
  }

  function handleDelete(name) {
    const updated = removeProduct(name)
    setProducts(updated)
    setConfirmDelete(null)
    setMessage({ type: 'success', text: `"${name}" removed` })
    setTimeout(() => setMessage(null), 2500)
  }

  return (
    <div className="pb-20">
      <AppHeader title="Manage Products" showBack />

      {/* Add New Product */}
      <form onSubmit={handleAdd} className="px-4 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Add New Product</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. MCC PH 103"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="px-5 py-3 bg-navy text-white rounded-xl text-sm font-medium disabled:opacity-40 flex items-center gap-1.5"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </form>

      {/* Message */}
      {message && (
        <div className={`mx-4 mt-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Product List */}
      <div className="px-4 mt-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Product Catalog ({products.length})
        </h3>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {products.map((product, i) => (
            <div
              key={product}
              className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <div className="w-8 h-8 bg-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package size={16} className="text-navy" />
              </div>
              <span className="text-sm text-gray-800 flex-1">{product}</span>
              {confirmDelete === product ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDelete(product)}
                    className="px-2.5 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="p-1.5 text-gray-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(product)}
                  className="p-2 text-gray-300 hover:text-red-400 transition"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6 px-4">
        Products are stored on this device. Add all your MCC product variants here.
      </p>
    </div>
  )
}
