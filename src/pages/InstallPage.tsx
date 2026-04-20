export default function InstallPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Install Learn Finnish</h1>
        <p className="text-slate-500 dark:text-slate-400">Adding Learn Finnish to your Home Screen or Dock makes it feel like a native app — offline-capable, fullscreen and fast to open.</p>
      </div>

      <Section title="On iPhone" emoji="📱">
        <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
          <li>Open this app in <strong>Safari</strong> (not Chrome — Apple only supports Home Screen install from Safari).</li>
          <li>Tap the <strong>Share</strong> button (the square with an arrow pointing up).</li>
          <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
          <li>Name it "Finnish" (or whatever you like) and tap <strong>Add</strong>.</li>
          <li>Open it from your Home Screen — it runs fullscreen like a real app.</li>
        </ol>
        <Hint>
          Tip: if you don't see the Share button, make sure you're in Safari and scroll the page up to reveal the toolbar.
        </Hint>
      </Section>

      <Section title="On Mac (Safari 17+)" emoji="💻">
        <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
          <li>Open this app in <strong>Safari</strong>.</li>
          <li>Click <strong>File → Add to Dock…</strong> in the menu bar.</li>
          <li>Keep the name <em>Learn Finnish</em> and click <strong>Add</strong>.</li>
          <li>The app now lives in your Dock and Launchpad — double-click to open in its own window.</li>
        </ol>
        <Hint>Older macOS? Use Chrome's install button (see below) — it works just as well.</Hint>
      </Section>

      <Section title="On Mac (Chrome / Edge)" emoji="🖥️">
        <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
          <li>Open this app in <strong>Chrome</strong> or <strong>Edge</strong>.</li>
          <li>Look for the small <strong>install icon</strong> at the right of the address bar (a monitor with a down-arrow), or open the browser menu and pick <strong>Install Learn Finnish…</strong>.</li>
          <li>Click <strong>Install</strong> in the prompt.</li>
          <li>The app is launched in its own window and appears in Launchpad / Applications.</li>
        </ol>
      </Section>

      <Section title="Everyday use" emoji="✨">
        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
          <li><strong>Daily goal</strong>: aim for the XP target on the Home tab. Consistency beats long sessions.</li>
          <li><strong>Streak</strong>: practise at least one exercise a day to keep your flame 🔥 alive.</li>
          <li><strong>Smart review</strong>: the spaced-repetition queue surfaces words right before you're likely to forget them — use it first.</li>
          <li><strong>Speaker icon</strong>: tap it anywhere you see a Finnish word to hear it spoken.</li>
          <li><strong>Pick a topic</strong> from <em>Learn</em> to focus on one theme (food, weather, verbs…) during a session.</li>
          <li><strong>Grammar reference</strong> is always available — flick through when something confuses you.</li>
        </ul>
      </Section>

      <Section title="Works offline" emoji="📡">
        <p className="text-slate-700 dark:text-slate-300">
          Once loaded, Learn Finnish works without a network connection. Text-to-speech requires an installed Finnish voice on your device — on iPhone you can add one under <em>Settings → Accessibility → Spoken Content → Voices → Finnish</em>.
        </p>
      </Section>
    </div>
  )
}

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 space-y-2">
      <h2 className="text-lg font-semibold flex items-center gap-2"><span className="text-2xl">{emoji}</span> {title}</h2>
      {children}
    </section>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm rounded-lg bg-sun-50 text-sun-500 dark:bg-sun-500/10 dark:text-sun-200 px-3 py-2">
      {children}
    </p>
  )
}
