export default function Security({ onNavigate }) {
  return (
    <section id="page-security" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Security Settings</h2>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onNavigate?.('dashboard')
            }}
          >
            Home
          </a>
          <span className="mx-2 text-slate-600">›</span>
          <span>Security Settings</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-6" style={{ '--accent': '#fb7185' }}>
        <span className="card-accent" aria-hidden="true" />
        <h3 className="font-display text-sm font-bold tracking-wide text-shield">Security & Privacy</h3>
        <p className="mt-3 text-sm text-slate-400">
          Content for security settings will go here.
        </p>
      </div>
    </section>
  )
}
