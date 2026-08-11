import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createCouponAPI,
  deleteCouponAPI,
  fetchCouponByIdAPI,
  fetchCouponsAPI,
  setCouponStatusAPI,
  updateCouponAPI,
} from '../../services/couponService'

const toErrorMessage = (error) => {
  const payload = error?.response?.data
  return (
    payload?.message ||
    payload?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

const buildCouponBody = (payload = {}) => {
  const name = String(payload.name ?? '').trim()
  const amountRaw = payload.amount
  const amountType = String(payload.amountType ?? payload.amount_type ?? 'percent').trim()

  if (!name) return { error: 'Please enter coupon name.' }
  if (amountRaw === '' || amountRaw === null || amountRaw === undefined) {
    return { error: 'Please enter amount.' }
  }

  const amount = Number(amountRaw)
  if (Number.isNaN(amount)) return { error: 'Amount must be a number.' }
  if (!amountType) return { error: 'Please select amount type.' }

  const body = { name, amount, amount_type: amountType }

  const isActive = payload.isActive ?? payload.is_active
  if (isActive !== undefined) body.is_active = Boolean(isActive)

  return { body }
}

export const fetchCoupons = createAsyncThunk(
  'coupon/fetchAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await fetchCouponsAPI({ page, limit })
      return {
        rows: data?.data ?? [],
        totalRecords: data?.totalRecords ?? 0,
        currentPage: data?.currentPage ?? page,
        totalPages: data?.totalPages ?? 1,
      }
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const fetchCouponById = createAsyncThunk(
  'coupon/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchCouponByIdAPI(id)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const createCoupon = createAsyncThunk(
  'coupon/create',
  async (payload, { rejectWithValue }) => {
    const { body, error } = buildCouponBody(payload)
    if (error) return rejectWithValue(error)

    try {
      const data = await createCouponAPI(body)
      return data?.data ?? data
    } catch (err) {
      return rejectWithValue(toErrorMessage(err))
    }
  }
)

export const updateCoupon = createAsyncThunk(
  'coupon/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const { body, error } = buildCouponBody(payload)
    if (error) return rejectWithValue(error)

    try {
      const data = await updateCouponAPI(id, body)
      return data?.data ?? data
    } catch (err) {
      return rejectWithValue(toErrorMessage(err))
    }
  }
)

export const toggleCouponStatus = createAsyncThunk(
  'coupon/toggleStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const data = await setCouponStatusAPI(id, isActive)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const deleteCoupon = createAsyncThunk(
  'coupon/delete',
  async (id, { rejectWithValue }) => {
    try {
      const data = await deleteCouponAPI(id)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

const couponSlice = createSlice({
  name: 'coupon',
  initialState: {
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    toggling: false,
    error: '',
    rows: [],
    selected: null,
    totalRecords: 0,
    currentPage: 1,
    totalPages: 1,
  },
  reducers: {
    clearCouponError: (state) => {
      state.error = ''
    },
    clearSelectedCoupon: (state) => {
      state.selected = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false
        state.error = ''
        state.rows = Array.isArray(action.payload?.rows) ? action.payload.rows : []
        state.totalRecords = action.payload?.totalRecords ?? 0
        state.currentPage = action.payload?.currentPage ?? 1
        state.totalPages = action.payload?.totalPages ?? 1
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })

      .addCase(fetchCouponById.fulfilled, (state, action) => {
        state.selected = action.payload ?? null
      })
      .addCase(fetchCouponById.rejected, (state, action) => {
        state.error = action.payload || action.error.message
      })

      .addCase(createCoupon.pending, (state) => {
        state.creating = true
        state.error = ''
      })
      .addCase(createCoupon.fulfilled, (state) => {
        state.creating = false
        state.error = ''
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload || action.error.message
      })

      .addCase(updateCoupon.pending, (state) => {
        state.updating = true
        state.error = ''
      })
      .addCase(updateCoupon.fulfilled, (state) => {
        state.updating = false
        state.error = ''
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload || action.error.message
      })

      .addCase(toggleCouponStatus.pending, (state) => {
        state.toggling = true
        state.error = ''
      })
      .addCase(toggleCouponStatus.fulfilled, (state) => {
        state.toggling = false
        state.error = ''
      })
      .addCase(toggleCouponStatus.rejected, (state, action) => {
        state.toggling = false
        state.error = action.payload || action.error.message
      })

      .addCase(deleteCoupon.pending, (state) => {
        state.deleting = true
        state.error = ''
      })
      .addCase(deleteCoupon.fulfilled, (state) => {
        state.deleting = false
        state.error = ''
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearCouponError, clearSelectedCoupon } = couponSlice.actions
export default couponSlice.reducer
