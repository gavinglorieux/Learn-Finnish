import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { grammarById } from '@/data/content'

// Minimal inline markup used in content/grammar: **bold**, *italic*, [[topic-id|label]].
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[\[[a-z0-9-]+(?:\|[^\]]+)?\]\])/g

export const renderInline = (text: string): ReactNode[] =>
  text.split(TOKEN).filter(Boolean).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>
    if (part.startsWith('[[')) {
      const [id, label] = part.slice(2, -2).split('|')
      const topic = grammarById(id)
      return (
        <Link key={i} to={`/grammar/${id}`} className="text-finnish-500 dark:text-finnish-200 underline decoration-dotted underline-offset-2">
          {label ?? topic?.title ?? id}
        </Link>
      )
    }
    if (part.startsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
    return <Fragment key={i}>{part}</Fragment>
  })

export default function RichText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderInline(text)}</span>
}
