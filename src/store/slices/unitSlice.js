import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createUnitAPI,
  deleteUnitAPI,
  fetchUnitsAPI,
  setUnitStatusAPI,
  updateUnitAPI,
} from '../../services/unitService'

const toErrorMessage = (error) => {
  const payload = error?.response?.data
  return (
    payload?.message ||
    payload?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

export const fetchUnits = createAsyncThunk(
  'unit/fetchAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await fetchUnitsAPI({ page, limit })
      const normalized = data?.data ?? data
      console.log('[unit] fetchUnits', { page, limit, count: Array.isArray(normalized) ? normalized.length : null, raw: data })
      return normalized
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const createUnit = createAsyncThunk(
  'unit/create',
  async (payload, { rejectWithValue }) => {
    try {
      const formData = payload instanceof FormData ? payload : new FormData()

      if (!(payload instanceof FormData)) {
        const { name, symbol, type, sortOrder } = payload || {}
        const cleanName = String(name ?? '').trim()
        const cleanSymbol = String(symbol ?? '').trim()
        const cleanType = String(type ?? '').trim()

        const invalid = (v) => !v || v === 'undefined' || v === '—'

        if (invalid(cleanName) || invalid(cleanSymbol)) {
          return rejectWithValue('Please enter unit name and symbol.')
        }
        if (invalid(cleanType)) {
          return rejectWithValue('Please enter type.')
        }

        formData.append('name', cleanName)
        formData.append('symbol', cleanSymbol)
        formData.append('type', cleanType)
        formData.append('sort_order', String(sortOrder ?? 0))
      }

      console.log('[unit] createUnit formData', [...formData.entries()])
      const data = await createUnitAPI(formData)
      console.log('[unit] createUnit response', data)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const updateUnit = createAsyncThunk(
  'unit/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const formData = payload instanceof FormData ? payload : new FormData()

      if (!(payload instanceof FormData)) {
        const { name, symbol, type, sortOrder } = payload || {}
        const cleanName = String(name ?? '').trim()
        const cleanSymbol = String(symbol ?? '').trim()
        const cleanType = String(type ?? '').trim()

        const invalid = (v) => !v || v === 'undefined' || v === '—'

        if (invalid(cleanName) || invalid(cleanSymbol)) {
          return rejectWithValue('Please enter unit name and symbol.')
        }
        if (invalid(cleanType)) {
          return rejectWithValue('Please enter type.')
        }

        formData.append('name', cleanName)
        formData.append('symbol', cleanSymbol)
        formData.append('type', cleanType)
        formData.append('sort_order', String(sortOrder ?? 0))
      }

      console.log('[unit] updateUnit formData', { id, entries: [...formData.entries()] })
      const data = await updateUnitAPI(id, formData)
      console.log('[unit] updateUnit response', data)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const toggleUnitStatus = createAsyncThunk(
  'unit/toggleStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const data = await setUnitStatusAPI(id, isActive)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const deleteUnit = createAsyncThunk(
  'unit/delete',
  async (id, { rejectWithValue }) => {
    try {
      const data = await deleteUnitAPI(id)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

const unitSlice = createSlice({
  name: 'unit',
  initialState: {
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    toggling: false,
    error: '',
    rows: [],
  },
  reducers: {
    clearUnitError: (state) => {
      state.error = ''
    },
    setUnitRows: (state, action) => {
      state.rows = action.payload ?? []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false
        state.error = ''
        state.rows = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })

      .addCase(createUnit.pending, (state) => {
        state.creating = true
        state.error = ''
      })
      .addCase(createUnit.fulfilled, (state) => {
        state.creating = false
        state.error = ''
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload || action.error.message
      })

      .addCase(updateUnit.pending, (state) => {
        state.updating = true
        state.error = ''
      })
      .addCase(updateUnit.fulfilled, (state) => {
        state.updating = false
        state.error = ''
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload || action.error.message
      })

      .addCase(toggleUnitStatus.pending, (state) => {
        state.toggling = true
        state.error = ''
      })
      .addCase(toggleUnitStatus.fulfilled, (state) => {
        state.toggling = false
        state.error = ''
      })
      .addCase(toggleUnitStatus.rejected, (state, action) => {
        state.toggling = false
        state.error = action.payload || action.error.message
      })

      .addCase(deleteUnit.pending, (state) => {
        state.deleting = true
        state.error = ''
      })
      .addCase(deleteUnit.fulfilled, (state) => {
        state.deleting = false
        state.error = ''
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearUnitError, setUnitRows } = unitSlice.actions
export default unitSlice.reducer

