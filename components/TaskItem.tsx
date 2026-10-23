'use client'

import { useTransition } from 'react'
import { updateMyProgress, deleteTask } from '@/app/actions'
import { Task } from '@/lib/supabase'

const NEXT_STATUS: Record<string, string> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
}

const STATUS_ICON: Record<string, string> = {
  todo: '○',
  in_progress: '◑',
  done: '✓',
}

const STATUS_COLORS: Record<string, string> = {
  todo: 'text-gray-400',
  in_progress: 'text-yellow-500',
  done: 'text-green-500',
}

type Member = {
  userId: string
  name: string
  avatar: string
  isMe: boolean
}

type Props = {
  task: Task
  topicId: string
  currentUserId: string
  members: Member[]
  progressMap: Record<string, string>
  canDelete: boolean
}

export default function TaskItem({
  task,
  topicId,
  currentUserId,
  members,
  progressMap,
  canDelete,
}: Props) {
  const [pending, startTransition] = useTransition()
  const myStatus = progressMap[currentUserId] || 'todo'

  return (
    <div
      className={`py-3 first:pt-0 last:pb-0 transition-opacity ${pending ? 'opacity-50' : ''}`}
    >
      {/* Task title row */}
      <div className="flex items-center gap-2 group">
        <button
          onClick={() =>
            startTransition(() =>
              updateMyProgress(task.id, topicId, NEXT_STATUS[myStatus])
            )
          }
          disabled={pending}
          title="Click to advance your status"
          className={`text-xl flex-shrink-0 transition-all hover:scale-110 ${STATUS_COLORS[myStatus]}`}
        >
          {STATUS_ICON[myStatus]}
        </button>

        <span
          className={`flex-1 text-sm font-medium ${
            myStatus === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {task.title}
        </span>

        {canDelete && (
          <button
            onClick={() => startTransition(() => deleteTask(task.id, topicId))}
            disabled={pending}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs"
            title="Delete task"
          >
            ✕
          </button>
        )}
      </div>

      {/* Per-member status row */}
      <div className="mt-1.5 ml-8 flex items-center gap-3 flex-wrap">
        {members.map((m) => {
          const status = progressMap[m.userId] || 'todo'
          return (
            <span
              key={m.userId}
              className="flex items-center gap-1 text-xs"
              title={`${m.name}: ${status.replace('_', ' ')}`}
            >
              <span className={STATUS_COLORS[status]}>{STATUS_ICON[status]}</span>
              <span className="text-gray-400">{m.isMe ? 'You' : m.name}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
