import { useEffect, useMemo, useState } from 'react'

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

/**
 * Client side pagination for the admin tables. Pass the already filtered rows
 * and render `pageItems` instead of the full list.
 */
export default function usePagination(items, initialPageSize = DEFAULT_PAGE_SIZE) {
  const rows = Array.isArray(items) ? items : []
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [page, setPage] = useState(1)

  const totalItems = rows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Filters shrinking the list (or a delete on the last page) must not leave
  // the user stranded on an empty page.
  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(1, Math.ceil(totalItems / pageSize))))
  }, [totalItems, pageSize])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, page, pageSize])

  const goToPage = (next) => {
    setPage(Math.min(Math.max(1, Number(next) || 1), totalPages))
  }

  const changePageSize = (size) => {
    setPageSize(Number(size) || DEFAULT_PAGE_SIZE)
    setPage(1)
  }

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalItems)

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    pageItems,
    rangeStart,
    rangeEnd,
    setPage: goToPage,
    changePageSize,
    resetPage: () => setPage(1),
  }
}
