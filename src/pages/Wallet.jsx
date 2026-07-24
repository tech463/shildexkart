export default function Wallet({ onNavigate }) {
  const totalEarned = 0
  const totalPayments = 0
  const recentPayments = []

  return (
    <section id="page-wallet" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Wallet</h2>
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
          <span>Wallet</span>
        </nav>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="neo-card glass-card wallet-stat-card p-5" style={{ '--accent': '#34d399' }}>
          <span className="card-accent" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-400">Total Earned</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">
            ₹{totalEarned.toLocaleString('en-IN')}
          </p>
          <p className="mt-3 text-xs font-medium text-emerald-400">Net after platform commission</p>
        </div>

        <div className="neo-card glass-card wallet-stat-card p-5" style={{ '--accent': '#00A3FF' }}>
          <span className="card-accent" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-400">Total Payments</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">{totalPayments}</p>
          <p className="mt-3 text-xs font-medium text-slate-500">Number of successful orders processed</p>
        </div>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#34d399' }}>
        <span className="card-accent" aria-hidden="true" />
        <h3 className="mb-6 font-display text-sm font-bold tracking-wide text-shield">Recent Payments</h3>

        {recentPayments.length === 0 ? (
          <div className="wallet-empty-state">
            <p>No payment history available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="vendors-table data-table w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="font-medium text-slate-200">{payment.order}</td>
                    <td className="text-slate-300">{payment.amount}</td>
                    <td className="text-slate-400">{payment.type}</td>
                    <td className="text-slate-400">{payment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
