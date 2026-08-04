import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { pageToPath } from '../routes/paths'

/**
 * App-level navigate that accepts legacy page ids (e.g. 'products', 'add-product')
 * and optional payload via location.state (used for user-insights).
 */
export function useAppNavigate() {
  const navigate = useNavigate()

  return useCallback(
    (pageId, state = null) => {
      const path = pageToPath(pageId)
      if (state != null) {
        navigate(path, { state })
      } else {
        navigate(path)
      }
    },
    [navigate],
  )
}
