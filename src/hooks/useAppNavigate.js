import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { pageToPath } from '../routes/paths'

/**
 * App-level navigate that accepts legacy page ids (e.g. 'products', 'add-product')
 * and optional payload (path params and/or location.state).
 */
export function useAppNavigate() {
  const navigate = useNavigate()

  return useCallback(
    (pageId, payload = null) => {
      const path = pageToPath(
        pageId,
        payload && typeof payload === 'object' ? payload : {},
      )

      // Edit product: id is already in the URL path
      if (pageId === 'edit-product') {
        navigate(path)
        return
      }

      if (payload != null) {
        navigate(path, { state: payload })
      } else {
        navigate(path)
      }
    },
    [navigate],
  )
}
