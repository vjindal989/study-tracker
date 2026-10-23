import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type Profile = {
  id: string
  name: string
  avatar_emoji: string
  created_at: string
}

export type Topic = {
  id: string
  name: string
  target: string | null
  emoji: string
  created_by: string
  invite_code: string
  created_at: string
}

export type TopicMember = {
  topic_id: string
  user_id: string
  next_steps: string | null
  joined_at: string
}

export type Task = {
  id: string
  topic_id: string
  title: string
  created_by: string
  created_at: string
}

export type TaskProgress = {
  task_id: string
  user_id: string
  status: 'todo' | 'in_progress' | 'done'
  updated_at: string
}

export function createBrowserClient() {
  return _createBrowserClient(url, anonKey)
}
