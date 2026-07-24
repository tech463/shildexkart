function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

const paths = {
  back: 'M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18',
  user: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
  briefcase: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 2.707V8.706m0 0a.75.75 0 0 0-.75-.75H5.25a.75.75 0 0 0-.75.75v.194m16.5 0a2.18 2.18 0 0 1 .75 1.661v4.15m-16.5-5.611a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 .75.75v.194m-15 0a2.18 2.18 0 0 0-.75 1.661v4.15',
  pin: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z',
  box: 'm21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
  check: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  cube: 'm21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
}

function formatJoinedOn(value) {
  if (!value) return '—'
  const match = String(value).match(/^(\d{1,2})-([A-Za-z]+)-(\d{4})/)
  if (!match) return value
  const months = {
    January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
    July: '07', August: '08', September: '09', October: '10', November: '11', December: '12',
  }
  const [, day, monthName, year] = match
  const month = months[monthName] || '01'
  return `${day.padStart(2, '0')}/${month}/${year}`
}

function InfoRow({ label, children }) {
  return (
    <div className="insight-info-row">
      <span className="insight-info-label">{label}</span>
      <div className="insight-info-value">{children}</div>
    </div>
  )
}

function SectionHeader({ iconPath, title, tone = 'slate' }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className={`insight-section-icon insight-section-icon-${tone}`}>
        <Icon path={iconPath} />
      </span>
      <h3 className="text-sm font-bold tracking-wide text-slate-100">{title}</h3>
    </div>
  )
}

function MetricCard({ label, value, tone, iconPath }) {
  return (
    <div className="neo-card glass-card insight-metric-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className={`mt-2 text-lg font-bold ${tone}`}>{value}</p>
        </div>
        <span className={`insight-metric-icon ${tone.replace('text-', 'tone-')}`}>
          <Icon path={iconPath} />
        </span>
      </div>
    </div>
  )
}

function DocThumb({ label, src }) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="insight-doc-thumb">
        {src ? (
          <img src={src} alt={`${label} document`} />
        ) : (
          <span className="text-lg font-bold text-slate-500">{label[0]}</span>
        )}
      </div>
    </div>
  )
}

export default function UserInsights({ member, onNavigate, fromPage = 'all-users' }) {
  if (!member) {
    return (
      <section className="page-view">
        <div className="neo-card glass-card p-8 text-center">
          <p className="text-sm text-slate-400">No user selected.</p>
          <button
            type="button"
            className="btn-glass mt-4 rounded-xl px-4 py-2 text-sm font-semibold"
            onClick={() => onNavigate?.(fromPage)}
          >
            Back to list
          </button>
        </div>
      </section>
    )
  }

  const isVendor = member.role === 'Vendor'
  const roleLabel = (member.role || 'User').toUpperCase()
  const catalogCount = member.catalogCount ?? 0
  const inStock = member.inStock ?? 0
  const outOfStock = member.outOfStock ?? 0
  const cumulativeStock = member.cumulativeStock ?? 0

  return (
    <section className="page-view insight-page">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="action-btn mt-0.5 h-10 w-10 shrink-0"
            aria-label="Go back"
            onClick={() => onNavigate?.(fromPage)}
          >
            <Icon path={paths.back} className="h-5 w-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="title-xl !text-2xl">{member.name}</h2>
              <span className={`insight-role-badge${isVendor ? ' insight-role-vendor' : ''}`}>
                {roleLabel}
              </span>
            </div>
            <nav className="breadcrumb mt-2" aria-label="Breadcrumb">
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate?.('dashboard')
                }}
              >
                Home
              </a>
              <span className="mx-2 text-slate-600">/</span>
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate?.(fromPage)
                }}
              >
                Users
              </a>
              <span className="mx-2 text-slate-600">/</span>
              <span>Insights</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="neo-card glass-card p-5">
          <SectionHeader iconPath={paths.user} title="Basic Account Info" tone="slate" />
          <div className="mb-5 flex flex-col items-center text-center">
            <div className={`avatar-ring mb-3 flex h-20 w-20 items-center justify-center rounded-full border text-xl font-bold ${member.color || 'bg-brand-500/20 text-brand-400 border-brand-500/30'}`}>
              {member.avatar || member.name?.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-base font-bold text-slate-100">{member.name}</p>
            <p className="mt-1 text-sm text-slate-400">{member.email}</p>
          </div>
          <div className="space-y-3">
            <InfoRow label="Phone Number">{member.phone || '—'}</InfoRow>
            <InfoRow label="Status">
              <span className={`insight-status-pill${member.active ? ' is-active' : ''}`}>
                {member.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </InfoRow>
            <InfoRow label="Joined On">{formatJoinedOn(member.created)}</InfoRow>
          </div>
        </div>

        {isVendor ? (
          <div className="neo-card glass-card p-5">
            <SectionHeader iconPath={paths.briefcase} title="Business Details" tone="violet" />
            <div className="space-y-3">
              <InfoRow label="Business Name">{member.businessName || '—'}</InfoRow>
              <InfoRow label="GST Number">{member.gstNumber || '—'}</InfoRow>
              <InfoRow label="PAN Number">{member.panNumber || '—'}</InfoRow>
              <InfoRow label="Aadhar Number">{member.aadharNumber || '—'}</InfoRow>
            </div>
            <div className="mt-5 flex gap-3">
              <DocThumb label="PAN" src={member.panImageUrl} />
              <DocThumb label="Aadhar Front" src={member.aadharFrontUrl} />
              <DocThumb label="Aadhar Back" src={member.aadharBackUrl} />
            </div>
          </div>
        ) : (
          <div className="neo-card glass-card p-5">
            <SectionHeader iconPath={paths.briefcase} title="Account Details" tone="violet" />
            <div className="space-y-3">
              <InfoRow label="Role">{member.role || 'User'}</InfoRow>
              <InfoRow label="Email">{member.email || '—'}</InfoRow>
              <InfoRow label="Last Updated">{formatJoinedOn(member.updated) || '—'}</InfoRow>
            </div>
          </div>
        )}

        <div className="neo-card glass-card p-5">
          <SectionHeader iconPath={paths.pin} title="Operational Address" tone="blue" />
          <div className="space-y-3">
            <InfoRow label="Location">{member.location || '—'}</InfoRow>
            <InfoRow label="Road / Street">{member.street || '—'}</InfoRow>
            <InfoRow label="Landmark">{member.landmark || '—'}</InfoRow>
            <InfoRow label="District">{member.district || '—'}</InfoRow>
            <InfoRow label="State">{member.state || '—'}</InfoRow>
            <InfoRow label="Pincode">{member.pincode || '—'}</InfoRow>
          </div>
        </div>
      </div>

      {isVendor ? (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Catalog" value={`${catalogCount} Products`} tone="text-sky-400" iconPath={paths.box} />
            <MetricCard label="In Stock" value={`${inStock} Active`} tone="text-emerald-400" iconPath={paths.check} />
            <MetricCard label="Out of Stock" value={`${outOfStock} Items`} tone="text-red-400" iconPath={paths.warning} />
            <MetricCard label="Cumulative Stock" value={`${cumulativeStock} Units`} tone="text-teal-400" iconPath={paths.cube} />
          </div>

          <div className="neo-card glass-card p-5">
            <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-100">Products Created by Vendor</h3>
            <div className="insight-empty-state">
              No products registered under this vendor catalog.
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
