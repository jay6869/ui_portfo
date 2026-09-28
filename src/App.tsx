export function App() {
  return (
    <main className="grid" style={{ paddingBlock: '20vh' }}>
      <h1 className="display" style={{ gridColumn: '1 / -1', fontSize: 'var(--step-hero)' }}>
        <em className="accent">J</em>anith
      </h1>
      <p className="mono dim" style={{ gridColumn: '1 / -1' }}>
        Scaffold check
      </p>
    </main>
  )
}
