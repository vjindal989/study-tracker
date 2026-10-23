'use client'

import { useRef, useState } from 'react'
import { createTask } from '@/app/actions'

export default function AddTaskForm({ topicId }: { topicId: string }) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    formData.set('topic_id', topicId)
    await createTask(formData)
    formRef.current?.reset()
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full text-sm text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg py-2 transition-colors border border-dashed border-gray-200 hover:border-blue-300"
      >
        + Add task
      </button>
    )
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mt-3 space-y-2">
      <input
        name="title"
        autoFocus
        required
        placeholder="Task name..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 text-sm text-gray-400 hover:text-gray-600 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 text-sm bg-blue-600 text-white rounded-lg py-1.5 hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
    </form>
  )
}
