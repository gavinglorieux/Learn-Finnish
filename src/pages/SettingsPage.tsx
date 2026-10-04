import { Link } from 'react-router-dom'
import { useApp } from '@/state/AppState'
import { CATEGORIES, WORDS, wordById } from '@/data/vocabulary'
import { DATA_STATS } from '@/data/content'
import { speak, ttsAvailable } from '@/lib/tts'
import { TrashIcon, DownloadIcon } from '@/components/Icons'
import { useState } from 'react'

export default function SettingsPage() {
  const { settings, updateSettings, resetAll, progress, srs } = useApp()
  const [confirming, setConfirming] = useState(false)
  // The SRS store also holds verb-drill and course-exercise keys; only count real words.
  const seen = Object.keys(srs).filter((id) => wordById(id)).length
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Personalise your learning experience.</p>
      </div>

      <section className="card p-4 space-y-4">
        <Row title="Theme" body="Match your system or choose manually.">
          <select
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value as 'system' | 'light' | 'dark' })}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Row>
        <Row title="Daily XP goal" body="A short, achievable daily target builds consistency.">
          <select
            value={settings.dailyGoal}
            onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) as 40 | 60 | 100 | 150 })}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <option value={40}>Casual — 40 XP</option>
            <option value={60}>Regular — 60 XP</option>
            <option value={100}>Serious — 100 XP</option>
            <option value={150}>Intense — 150 XP</option>
          </select>
        </Row>
        <Row title="Haptics" body="Gentle vibration feedback on mobile devices.">
          <Toggle value={settings.haptics} onChange={(v) => updateSettings({ haptics: v })} />
        </Row>
        <Row title="Auto-speak Finnish" body="Automatically pronounce the Finnish word during exercises.">
          <Toggle value={settings.autoSpeakFinnish} onChange={(v) => updateSettings({ autoSpeakFinnish: v })} />
        </Row>
        <Row title="Pronunciation" body={ttsAvailable() ? 'Test the Finnish voice.' : 'Speech synthesis not available on this device.'}>
          <button onClick={() => speak('Hyvää päivää! Puhun suomea.')} disabled={!ttsAvailable()} className="btn-secondary disabled:opacity-50">
            Test voice
          </button>
        </Row>
      </section>

      <section className="card p-4">
        <h2 className="font-semibold">Your data</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Total XP: {progress.totalXp} · Streak: {progress.streak} days · Words seen: {seen}/{WORDS.length} · Topics: {CATEGORIES.length}
        </p>
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="btn-secondary flex items-center gap-2">
            <TrashIcon size={16} /> Reset progress
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { resetAll(); setConfirming(false) }} className="btn-danger flex items-center gap-2">
              <TrashIcon size={16} /> Yes, reset everything
            </button>
            <button onClick={() => setConfirming(false)} className="btn-secondary">Cancel</button>
          </div>
        )}
      </section>

      <section className="card p-4">
        <h2 className="font-semibold flex items-center gap-2"><DownloadIcon size={18} /> Install the app</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get a native-feeling Learn Finnish on iPhone and Mac.</p>
        <Link to="/install" className="btn-primary mt-3 inline-flex">How to install</Link>
      </section>

      <p className="text-xs text-slate-400 text-center">Learn Finnish · made with love. Content from {DATA_STATS.lessons} classes with Teija.</p>
    </div>
  )
}

function Row({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{body}</div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition relative ${value ? 'bg-finnish-500' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition ${value ? 'translate-x-5' : ''}`} />
    </button>
  )
}
