'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

const AVATARS = ['🧑', '👩', '👨', '🧑‍💻', '👩‍💻', '👨‍💻', '🦊', '🐼', '🦁', '🐸', '🐧', '🦋']

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🧑')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setErrorMsg('')

    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: name.trim(),
      avatar_emoji: avatar,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome!</h1>
        <p className="text-gray-500 text-sm mb-6">Set up your profile to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pick an avatar</label>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`text-2xl p-1.5 rounded-lg transition-colors ${
                    avatar === a ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vasu"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Saving…' : 'Get started →'}
          </button>
        </form>
      </div>
    </main>
  )
}
