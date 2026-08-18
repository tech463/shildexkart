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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="neo-card glass-card p-6" style={{ '--accent': '#fb7185' }}>
          <span className="card-accent" aria-hidden="true" />
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Login protection</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Admin login always requires email, password, and a one-time OTP sent to the admin email.
            Expired sessions are signed out automatically.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>OTP is required on every admin sign-in.</li>
            <li>Unchecking Remember me stores the session only until this browser tab is closed.</li>
            <li>Invalid or expired tokens return you to the login page.</li>
          </ul>
        </div>

        <div className="neo-card glass-card p-6" style={{ '--accent': '#00A3FF' }}>
          <span className="card-accent" aria-hidden="true" />
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Password</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Change your current admin password from Account Settings. Use a unique password that is at least 6 characters.
          </p>
          <button
            type="button"
            className="mt-5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400"
            onClick={() => onNavigate?.('account')}
          >
            Open Account Settings
          </button>
        </div>
      </div>
    </section>
  )
}
