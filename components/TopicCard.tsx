import Link from 'next/link'
import { Topic } from '@/lib/supabase'

type Props = {
  topic: Topic
  myDone: number
  myTotal: number
  memberCount: number
  nextSteps: string | null
}

export default function TopicCard({ topic, myDone, myTotal, memberCount, nextSteps }: Props) {
  const pct = myTotal > 0 ? Math.round((myDone / myTotal) * 100) : 0

  return (
    <Link
      href={`/topics/${topic.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{topic.emoji}</span>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
          👥 {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {topic.name}
      </h2>

      {topic.target && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{topic.target}</p>
      )}

      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Your progress</span>
          <span>{myDone}/{myTotal} tasks done</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {nextSteps && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Your next step</p>
          <p className="text-sm text-gray-600 line-clamp-2">{nextSteps}</p>
        </div>
      )}
    </Link>
  )
}
