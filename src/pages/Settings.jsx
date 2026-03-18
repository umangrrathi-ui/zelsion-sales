import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import AppHeader from '../components/Layout/AppHeader'
import { User, Mail, Lock, LogOut, Building2, Phone, Shield, Bell, ChevronRight, Check, UserPlus, X } from 'lucide-react'

export default function Settings() {
  const { user, signOut } = useAuth()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleChangePassword(e) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword('')
      setConfirmPassword('')
      setShowChangePassword(false)
    }
  }

  async function handleAddUser(e) {
    e.preventDefault()
    if (!newUserEmail || !newUserPassword) {
      setMessage({ type: 'error', text: 'Email and password are required' })
      return
    }
    if (newUserPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    setSaving(true)
    try {
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY
      if (serviceKey) {
        // Use admin API to create user with auto-confirmed email
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            email: newUserEmail,
            password: newUserPassword,
            email_confirm: true,
          })
        })
        const data = await response.json()
        if (!response.ok) {
          setMessage({ type: 'error', text: data.msg || data.error_description || data.message || 'Failed to create user' })
        } else {
          setMessage({ type: 'success', text: `User ${newUserEmail} created! They can sign in immediately.` })
          setNewUserEmail('')
          setNewUserPassword('')
          setShowAddUser(false)
        }
      } else {
        // Fallback: regular signup (may require email confirmation)
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email: newUserEmail,
            password: newUserPassword,
          })
        })
        const data = await response.json()
        if (!response.ok) {
          setMessage({ type: 'error', text: data.msg || data.error_description || 'Failed to create user' })
        } else if (data.identities && data.identities.length === 0) {
          setMessage({ type: 'error', text: 'This email is already registered.' })
        } else {
          setMessage({ type: 'success', text: `User ${newUserEmail} created! Note: They may need to confirm their email before signing in.` })
          setNewUserEmail('')
          setNewUserPassword('')
          setShowAddUser(false)
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    }
    setSaving(false)
  }

  const menuItems = [
    {
      section: 'Account',
      items: [
        {
          icon: Mail,
          label: 'Email',
          value: user?.email || '---',
          disabled: true,
        },
        {
          icon: Lock,
          label: 'Change Password',
          action: () => { setShowChangePassword(!showChangePassword); setShowAddUser(false) },
          chevron: true,
        },
      ]
    },
    {
      section: 'Team',
      items: [
        {
          icon: UserPlus,
          label: 'Add New User',
          action: () => { setShowAddUser(!showAddUser); setShowChangePassword(false) },
          chevron: true,
          desc: 'Create login for team members',
        },
      ]
    },
    {
      section: 'Company',
      items: [
        { icon: Building2, label: 'Company', value: 'Zelsion Industries Pvt. Ltd.', disabled: true },
        { icon: Phone, label: 'Location', value: 'Ankleshwar, Gujarat', disabled: true },
      ]
    },
    {
      section: 'App Info',
      items: [
        { icon: Shield, label: 'Version', value: 'v1.0.0', disabled: true },
        { icon: Bell, label: 'Notifications', value: 'Coming soon', disabled: true },
      ]
    }
  ]

  return (
    <div className="pb-20">
      <AppHeader title="Settings" showBack />

      {/* Profile Card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center">
            <User size={24} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-4 mt-3 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)} className="flex-shrink-0 mt-0.5"><X size={14} /></button>
        </div>
      )}

      {/* Menu Sections */}
      {menuItems.map(section => (
        <section key={section.section} className="mt-5 px-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{section.section}</h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {section.items.map((item, i) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={item.action || undefined}
                  disabled={item.disabled && !item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${i > 0 ? 'border-t border-gray-50' : ''} ${item.action ? 'active:bg-gray-50' : ''}`}
                >
                  <Icon size={18} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700">{item.label}</span>
                    {item.desc && <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>}
                  </div>
                  {item.value && <span className="text-sm text-gray-400">{item.value}</span>}
                  {item.chevron && <ChevronRight size={16} className="text-gray-300" />}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {/* Change Password Form */}
      {showChangePassword && (
        <form onSubmit={handleChangePassword} className="mx-4 mt-3 bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Change Password</h3>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-navy text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? 'Saving...' : <><Check size={16} /> Update Password</>}
            </button>
          </div>
        </form>
      )}

      {/* Add New User Form */}
      {showAddUser && (
        <form onSubmit={handleAddUser} className="mx-4 mt-3 bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Add Team Member</h3>
          <p className="text-xs text-gray-400 mb-3">Create login credentials for a new team member. They can sign in immediately after creation.</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
              <input
                type="email"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                placeholder="teammate@company.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input
                type="text"
                value={newUserPassword}
                onChange={e => setNewUserPassword(e.target.value)}
                placeholder="Create a password (min 6 chars)"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-navy text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? 'Creating...' : <><UserPlus size={16} /> Add User</>}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Sign Out */}
      <div className="px-4 mt-6">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 rounded-2xl text-sm font-medium active:bg-red-100 transition"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6 mb-4">Zelsion Industries Pvt. Ltd., Ankleshwar</p>
    </div>
  )
}
