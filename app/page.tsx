export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import AddTopicForm from '@/components/AddTopicForm'
import TopicCard from '@/components/TopicCard'
import JoinTopicForm from '@/components/JoinTopicForm'

export default async function Dashboard() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  // Topics this user is a member of
  const { data: memberships } = await supabase
    .from('topic_members')
    .select('topic_id, next_steps')
    .eq('user_id', user.id)

  const topicIds = memberships?.map((m) => m.topic_id) ?? []
  const nextStepsMap = Object.fromEntries(
    (memberships ?? []).map((m) => [m.topic_id, m.next_steps])
  )

  const { data: topics } = topicIds.length
    ? await supabase
        .from('topics')
        .select('*')
        .in('id', topicIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // All tasks for these topics
  const { data: allTasks } = topicIds.length
    ? await supabase.from('tasks').select('id, topic_id').in('topic_id', topicIds)
    : { data: [] }

  const allTaskIds = allTasks?.map((t) => t.id) ?? []
  const tasksByTopic = (allTasks ?? []).reduce(
    (acc, t) => { (acc[t.topic_id] ??= []).push(t.id); return acc },
    {} as Record<string, string[]>
  )

  // My progress on all tasks
  const { data: myProgress } = allTaskIds.length
    ? await supabase
        .from('task_progress')
        .select('task_id, status')
        .eq('user_id', user.id)
        .in('task_id', allTaskIds)
    : { data: [] }

  const myProgressMap = Object.fromEntries((myProgress ?? []).map((p) => [p.task_id, p.status]))

  // Member counts per topic
  const { data: memberRows } = topicIds.length
    ? await supabase.from('topic_members').select('topic_id').in('topic_id', topicIds)
    : { data: [] }

  const memberCountMap = (memberRows ?? []).reduce(
    (acc, r) => { acc[r.topic_id] = (acc[r.topic_id] ?? 0) + 1; return acc },
    {} as Record<string, number>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 Study Tracker</h1>
            <p className="text-gray-500 mt-1">
              {profile.avatar_emoji} <strong>{profile.name}</strong> — your topics
            </p>
          </div>
          <div className="flex gap-3">
            <JoinTopicForm />
            <AddTopicForm />
          </div>
        </div>

        {!topics?.length ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl font-medium text-gray-500">No topics yet</p>
            <p className="mt-1 text-sm">Create one or join a friend's topic with an invite code</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((topic) => {
              const taskIds = tasksByTopic[topic.id] ?? []
              const myDone = taskIds.filter((id) => myProgressMap[id] === 'done').length
              return (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  myDone={myDone}
                  myTotal={taskIds.length}
                  memberCount={memberCountMap[topic.id] ?? 1}
                  nextSteps={nextStepsMap[topic.id] ?? null}
                />
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
