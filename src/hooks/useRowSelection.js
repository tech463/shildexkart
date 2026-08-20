import { useCallback, useMemo, useState } from 'react'

export function useRowSelection(items = [], getId = (item) => item.id) {
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const visibleIds = useMemo(
    () => items.map(getId).filter((id) => id != null),
    [items, getId],
  )

  const selectedVisibleIds = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)),
    [visibleIds, selectedIds],
  )

  const selectedCount = selectedVisibleIds.length
  const allSelected = visibleIds.length > 0 && selectedCount === visibleIds.length
  const someSelected = selectedCount > 0 && !allSelected

  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds])

  const toggleOne = useCallback((id) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedIds((current) => {
      const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => current.has(id))
      const next = new Set(current)
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id))
      } else {
        visibleIds.forEach((id) => next.add(id))
      }
      return next
    })
  }, [visibleIds])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  return {
    selectedVisibleIds,
    selectedCount,
    allSelected,
    someSelected,
    isSelected,
    toggleOne,
    toggleAll,
    clearSelection,
  }
}
