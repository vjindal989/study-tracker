'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'

async function getAuthContext() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, userId: user.id }
}

export async function createTopic(formData: FormData) {
  const { supabase, userId } = await getAuthContext()
  const name = (formData.get('name') as string)?.trim()
  const target = (formData.get('target') as string)?.trim()
  const emoji = (formData.get('emoji') as string) || '📚'

  if (!name) return

  const { data: topic } = await supabase
    .from('topics')
    .insert({ name, target: target || null, emoji, created_by: userId })
    .select()
    .single()

  if (topic) {
    await supabase.from('topic_members').insert({ topic_id: topic.id, user_id: userId })
  }

  revalidatePath('/')
}

export async function joinTopic(inviteCode: string) {
  const { supabase, userId } = await getAuthContext()

  const { data: topic } = await supabase
    .from('topics')
    .select('id')
    .eq('invite_code', inviteCode.trim().toLowerCase())
    .single()

  if (!topic) return { error: 'Topic not found. Check the code and try again.' }

  await supabase
    .from('topic_members')
    .upsert({ topic_id: topic.id, user_id: userId }, { onConflict: 'topic_id,user_id' })

  revalidatePath('/')
  redirect(`/topics/${topic.id}`)
}

export async function createTask(formData: FormData) {
  const { supabase, userId } = await getAuthContext()
  const title = (formData.get('title') as string)?.trim()
  const topicId = formData.get('topic_id') as string

  if (!title || !topicId) return

  const { data: task } = await supabase
    .from('tasks')
    .insert({ topic_id: topicId, title, created_by: userId })
    .select()
    .single()

  if (task) {
    const { data: members } = await supabase
      .from('topic_members')
      .select('user_id')
      .eq('topic_id', topicId)

    if (members?.length) {
      await supabase.from('task_progress').insert(
        members.map((m) => ({ task_id: task.id, user_id: m.user_id, status: 'todo' }))
      )
    }
  }

  revalidatePath(`/topics/${topicId}`)
}

export async function updateMyProgress(taskId: string, topicId: string, status: string) {
  const { supabase, userId } = await getAuthContext()
  await supabase
    .from('task_progress')
    .upsert(
      { task_id: taskId, user_id: userId, status, updated_at: new Date().toISOString() },
      { onConflict: 'task_id,user_id' }
    )
  revalidatePath(`/topics/${topicId}`)
}

export async function deleteTask(taskId: string, topicId: string) {
  const { supabase, userId } = await getAuthContext()
  await supabase.from('tasks').delete().eq('id', taskId).eq('created_by', userId)
  revalidatePath(`/topics/${topicId}`)
}

export async function deleteTopic(topicId: string) {
  const { supabase, userId } = await getAuthContext()
  await supabase.from('topics').delete().eq('id', topicId).eq('created_by', userId)
  revalidatePath('/')
  redirect('/')
}

export async function updateMyNextSteps(topicId: string, text: string) {
  const { supabase, userId } = await getAuthContext()
  await supabase
    .from('topic_members')
    .update({ next_steps: text || null })
    .eq('topic_id', topicId)
    .eq('user_id', userId)
  revalidatePath(`/topics/${topicId}`)
  revalidatePath('/')
}
