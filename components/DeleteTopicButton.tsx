'use client'

import { useTransition } from 'react'
import { deleteTopic } from '@/app/actions'

export default function DeleteTopicButton({ topicId }: { topicId: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this topic and all its tasks?')) return
    startTransition(() => deleteTopic(topicId))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-sm text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete topic'}
    </button>
  )
}
