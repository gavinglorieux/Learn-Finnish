import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { textById, lessonById, lessonLabel, grammarById, VOCAB_WORDS, type ReadingText } from '@/data/content'
import { ChevronLeftIcon, SpeakerIcon, XIcon } from '@/components/Icons'
import { speak } from '@/lib/tts'

type Gloss = { fi: string; en: string }

const VOCAB_INDEX = new Map(VOCAB_WORDS.map((w) => [w.fi.toLowerCase(), { fi: w.fi, en: w.en }]))

// Endings to peel off when a form isn't in the glossary (longest first).
const SUFFIXES = [
  'ssakin', 'ssäkin', 'kin', 'han', 'hän', 'ko', 'kö', 'pa', 'pä',
  'ssa', 'ssä', 'sta', 'stä', 'lla', 'llä', 'lta', 'ltä', 'lle', 'na', 'nä', 'ksi',
  'seen', 'hin', 'mme', 'tte', 'vat', 'vät', 'ni', 'si', 'nsa', 'nsä',
  'ta', 'tä', 'n', 't', 'a', 'ä'
]

export const lookupWord = (token: string, text: ReadingText): Gloss | null => {
  const form = token.toLowerCase().replace(/[^a-zåäö-]/gi, '')
  if (!form) return null
  const gloss = new Map(text.glossary.map((g) => [g.form, { fi: g.fi, en: g.en }]))
  const direct = gloss.get(form) ?? VOCAB_INDEX.get(form)
  if (direct) return direct
  for (const suf of SUFFIXES) {
    if (form.length - suf.length < 3 || !form.endsWith(suf)) continue
    const stem = form.slice(0, -suf.length)
    for (const cand of [stem, `${stem}a`, `${stem}ä`, `${stem}i`, `${stem}e`, stem.replace(/(.)\1$/, '$1')]) {
      const hit = gloss.get(cand) ?? VOCAB_INDEX.get(cand)
      if (hit) return hit
    }
  }
  return null
}

export default function TextPage() {
  const { textId } = useParams()
  const navigate = useNavigate()
  const text = textId ? textById(textId) : undefined
  const [showAll, setShowAll] = useState(false)
  const [openLines, setOpenLines] = useState<Set<number>>(new Set())
  const [picked, setPicked] = useState<{ token: string; gloss: Gloss | null; line: number } | null>(null)

  const lessons = useMemo(() => (text?.lessons ?? []).map(lessonById).filter(Boolean), [text])

  if (!text) {
    return (
      <div className="card p-5 text-center space-y-3">
        <p>Text not found.</p>
        <Link to="/texts" className="btn-secondary inline-flex">All texts</Link>
      </div>
    )
  }

  const toggleLine = (i: number) =>
    setOpenLines((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const tapWord = (token: string, line: number) => {
    const clean = token.replace(/[^a-zåäö-]/gi, '')
    if (!clean) return
    setPicked({ token: clean, gloss: lookupWord(clean, text), line })
  }

  return (
    <article className="space-y-5 animate-fade-in pb-24">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
        <ChevronLeftIcon size={16} /> Back
      </button>

      <header>
        <div className="text-xs uppercase tracking-wide text-slate-500">{text.kind === 'dialogue' ? 'Dialogue' : 'Reading'}</div>
        <h1 className="text-2xl font-bold">{text.title.fi}</h1>
        {text.title.en && <p className="text-slate-500 dark:text-slate-400">{text.title.en}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {lessons.map((l) => (
            <Link key={l!.id} to={`/lessons/${l!.id}`} className="chip !text-[11px] hover:bg-finnish-50 dark:hover:bg-slate-800">{lessonLabel(l!)}</Link>
          ))}
          {text.topics.slice(0, 4).map((t) => {
            const g = grammarById(t)
            return g ? <Link key={t} to={`/grammar/${t}`} className="chip !text-[11px] hover:bg-finnish-50 dark:hover:bg-slate-800">{g.emoji} {g.title}</Link> : null
          })}
        </div>
      </header>

      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-slate-500">Tap a word for its meaning, a line's 🇬🇧 for the translation.</span>
        <label className="flex items-center gap-2 shrink-0">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="accent-finnish-500" />
          English
        </label>
      </div>

      <div className="card p-4 sm:p-5 space-y-3">
        {text.lines.map((ln, i) => {
          const showEn = showAll || openLines.has(i)
          return (
            <div key={i} className="group">
              <div className="flex gap-2 items-start">
                <button onClick={() => speak(ln.fi)} aria-label="Read line aloud" className="mt-1 shrink-0 text-finnish-500 dark:text-finnish-200">
                  <SpeakerIcon size={16} />
                </button>
                <p className="flex-1 text-[17px] leading-relaxed">
                  {ln.speaker && <span className="font-semibold text-slate-500 mr-1">{ln.speaker}:</span>}
                  {ln.fi.split(/(\s+)/).map((tok, k) =>
                    /^\s+$/.test(tok) ? tok : (
                      <button
                        key={k}
                        onClick={() => tapWord(tok, i)}
                        className={`rounded px-0.5 -mx-0.5 hover:bg-finnish-50 dark:hover:bg-slate-800 ${picked?.line === i && picked.token === tok.replace(/[^a-zåäö-]/gi, '') ? 'bg-sun-100 dark:bg-sun-500/20' : ''}`}
                      >
                        {tok}
                      </button>
                    )
                  )}
                </p>
                {ln.en && (
                  <button onClick={() => toggleLine(i)} aria-label="Show translation" className="shrink-0 text-sm opacity-60 hover:opacity-100">🇬🇧</button>
                )}
              </div>
              {showEn && ln.en && <p className="ml-6 mt-0.5 text-sm text-slate-500 dark:text-slate-400">{ln.en}</p>}
            </div>
          )
        })}
      </div>

      {picked && (
        <div className="fixed left-0 right-0 bottom-20 md:bottom-6 z-40 px-4">
          <div className="container-app">
            <div className="card p-4 flex items-start gap-3 shadow-lg">
              <button onClick={() => speak(picked.gloss?.fi ?? picked.token)} className="mt-0.5 text-finnish-500 dark:text-finnish-200" aria-label="Pronounce">
                <SpeakerIcon size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">
                  {picked.token}
                  {picked.gloss && picked.gloss.fi.toLowerCase() !== picked.token.toLowerCase() && (
                    <span className="font-normal text-slate-500"> ← {picked.gloss.fi}</span>
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {picked.gloss ? picked.gloss.en : 'Not in the glossary — tap 🇬🇧 for the whole line.'}
                </div>
              </div>
              <button onClick={() => setPicked(null)} aria-label="Close" className="text-slate-400"><XIcon size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
