import { PAGE_SIZE_OPTIONS } from '../hooks/usePagination'

const CHEVRON_LEFT = 'M15.75 19.5 8.25 12l7.5-7.5'
const CHEVRON_RIGHT = 'm8.25 4.5 7.5 7.5-7.5 7.5'

function Chevron({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

/** Builds a compact page list such as [1, '...', 4, 5, 6, '...', 12]. */
function buildPageList(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const pages = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  if (start > 2) pages.push('start-gap')
  for (let current = start; current <= end; current += 1) pages.push(current)
  if (end < totalPages - 1) pages.push('end-gap')
  pages.push(totalPages)

  return pages
}

export default function TablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'entries',
}) {
  const pages = buildPageList(page, totalPages)

  return (
    <div className="table-pagination">
      <div className="table-pagination-info">
        <span>
          Showing <strong>{rangeStart}</strong>–<strong>{rangeEnd}</strong> of <strong>{totalItems}</strong> {itemLabel}
        </span>
        <label className="table-pagination-size">
          Rows
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(event.target.value)}
            className="glass-input rounded-lg px-2 py-1 text-xs"
            aria-label={`${itemLabel} per page`}
          >
            {PAGE_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>

      <div className="table-pagination-controls">
        <button
          type="button"
          className="table-page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <Chevron path={CHEVRON_LEFT} />
        </button>

        {pages.map((entry) => (
          typeof entry === 'number' ? (
            <button
              key={entry}
              type="button"
              className={`table-page-btn ${entry === page ? 'table-page-btn-active' : ''}`}
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? 'page' : undefined}
            >
              {entry}
            </button>
          ) : (
            <span key={entry} className="table-page-gap">…</span>
          )
        ))}

        <button
          type="button"
          className="table-page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <Chevron path={CHEVRON_RIGHT} />
        </button>
      </div>
    </div>
  )
}
