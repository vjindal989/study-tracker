'use client'

import { useState } from 'react'

type Props = {
  label: string
  value: string
  placeholder: string
  onSave: (value: string) => Promise<void>
}

export default function EditableField({ label, value, placeholder, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState(value)

  async function handleBlur() {
    setEditing(false)
    if (current.trim() !== value.trim()) {
      await onSave(current.trim())
    }
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      {editing ? (
        <textarea
          autoFocus
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onBlur={handleBlur}
          rows={2}
          placeholder={placeholder}
          className="w-full text-sm text-gray-700 bg-gray-50 border border-blue-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors min-h-[2.5rem] border border-transparent hover:border-gray-200"
        >
          {current || <span className="text-gray-300 italic">{placeholder}</span>}
        </button>
      )}
    </div>
  )
}
