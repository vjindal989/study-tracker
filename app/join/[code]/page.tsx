export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login`)

  const { data: topic } = await supabase
    .from('topics')
    .select('id, name, emoji')
    .eq('invite_code', code.toLowerCase())
    .single()

  if (!topic) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-lg font-medium text-gray-700">Invalid invite code</p>
          <p className="text-sm text-gray-500 mt-1">This link may have expired or the code is wrong.</p>
          <Link href="/" className="mt-4 inline-block text-blue-500 hover:underline text-sm">
            Go to my topics
          </Link>
        </div>
      </main>
    )
  }

  await supabase
    .from('topic_members')
    .upsert({ topic_id: topic.id, user_id: user.id }, { onConflict: 'topic_id,user_id' })

  redirect(`/topics/${topic.id}`)
}
