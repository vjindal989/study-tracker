export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { updateMyNextSteps } from '@/app/actions'
import TaskItem from '@/components/TaskItem'
import AddTaskForm from '@/components/AddTaskForm'
import EditableField from '@/components/EditableField'
import DeleteTopicButton from '@/components/DeleteTopicButton'
import InviteCard from '@/components/InviteCard'

export default async function TopicDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify membership
  const { data: myMembership } = await supabase
    .from('topic_members')
    .select('next_steps')
    .eq('topic_id', id)
    .eq('user_id', user.id)
    .single()

  if (!myMembership) notFound()

  const { data: topic } = await supabase.from('topics').select('*').eq('id', id).single()
  if (!topic) notFound()

  // All members with profiles
  const { data: memberships } = await supabase
    .from('topic_members')
    .select('user_id, next_steps, profiles(name, avatar_emoji)')
    .eq('topic_id', id)

  const members = (memberships ?? []).map((m) => ({
    userId: m.user_id as string,
    name: (m.profiles as unknown as { name: string; avatar_emoji: string } | null)?.name ?? 'Unknown',
    avatar: (m.profiles as unknown as { name: string; avatar_emoji: string } | null)?.avatar_emoji ?? '🧑',
    nextSteps: m.next_steps as string | null,
    isMe: m.user_id === user.id,
  }))

  // All tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('topic_id', id)
    .order('created_at', { ascending: true })

  // All progress for all tasks
  const taskIds = (tasks ?? []).map((t) => t.id)
  const { data: allProgress } = taskIds.length
    ? await supabase.from('task_progress').select('*').in('task_id', taskIds)
    : { data: [] }

  // progressMap[taskId][userId] = status
  const progressMap = (allProgress ?? []).reduce(
    (acc, p) => {
      if (!acc[p.task_id]) acc[p.task_id] = {}
      acc[p.task_id][p.user_id] = p.status
      return acc
    },
    {} as Record<string, Record<string, string>>
  )

  const saveNextSteps = updateMyNextSteps.bind(null, id)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
            ← Back
          </Link>
          <span className="text-2xl">{topic.emoji}</span>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{topic.name}</h1>
          {topic.created_by === user.id && <DeleteTopicButton topicId={id} />}
        </div>

        {/* Members + invite */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Members:
            </span>
            {members.map((m) => (
              <span
                key={m.userId}
                className="flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1 text-sm"
              >
                {m.avatar} {m.isMe ? 'You' : m.name}
              </span>
            ))}
          </div>
          <InviteCard inviteCode={topic.invite_code} />
        </div>

        {/* Goal + my next steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              🎯 Goal / Target
            </p>
            <p className="text-sm text-gray-700">
              {topic.target || (
                <span className="text-gray-300 italic">No goal set</span>
              )}
            </p>
          </div>
          <EditableField
            label="➡️ My next session"
            value={myMembership.next_steps || ''}
            placeholder="What will you do next time?"
            onSave={saveNextSteps}
          />
        </div>

        {/* Other members' next steps */}
        {members.filter((m) => !m.isMe && m.nextSteps).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Team's next steps
            </p>
            <div className="space-y-2">
              {members
                .filter((m) => !m.isMe && m.nextSteps)
                .map((m) => (
                  <div key={m.userId} className="flex items-start gap-2 text-sm">
                    <span>{m.avatar}</span>
                    <span className="font-medium text-gray-600">{m.name}:</span>
                    <span className="text-gray-500">{m.nextSteps}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Task list */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-1">Tasks</h3>
          <p className="text-xs text-gray-400 mb-4">
            Click your status icon (○ / ◑ / ✓) to update your progress
          </p>

          {!(tasks ?? []).length ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No tasks yet — add one below
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {(tasks ?? []).map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  topicId={id}
                  currentUserId={user.id}
                  members={members}
                  progressMap={progressMap[task.id] ?? {}}
                  canDelete={task.created_by === user.id}
                />
              ))}
            </div>
          )}

          <AddTaskForm topicId={id} />
        </div>
      </div>
    </main>
  )
}
