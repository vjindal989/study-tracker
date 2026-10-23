'use client'

import { useState, useRef } from 'react'
import { createTopic } from '@/app/actions'

const EMOJIS = ['📚', '💻', '🧮', '⚛️', '🐍', '🎯', '🔬', '📐', '🗄️', '🌐', '🎨', '🤖']

export default function AddTopicForm() {
  const [open, setOpen] = useState(false)
  const [emoji, setEmoji] = useState('📚')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    formData.set('emoji', emoji)
    await createTopic(formData)
    formRef.current?.reset()
    setEmoji('📚')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
      >
        + Add Topic
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">New Study Topic</h2>

        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-1.5 rounded-lg transition-colors ${
                    emoji === e
                      ? 'bg-blue-100 ring-2 ring-blue-400'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              required
              autoFocus
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal / Target
            </label>
            <textarea
              name="target"
              rows={2}
              placeholder="What do you want to achieve with this topic?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Create Topic
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
