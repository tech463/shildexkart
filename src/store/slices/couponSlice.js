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
  const name = String(payload.name ?? payload.code ?? '').trim().toUpperCase()
  if (!name) return { error: 'Please enter coupon code.' }

  const discountType = String(payload.discountType || payload.amountType || payload.amount_type || 'Percent')
  const amountTypeMap = {
    Percent: 'percent',
    Fixed: 'fixed',
    Shipping: 'shipping',
    percent: 'percent',
    fixed: 'fixed',
    shipping: 'shipping',
  }
  const amount_type = amountTypeMap[discountType] || 'percent'

  let amount = Number(payload.amount ?? payload.discountValue ?? 0)
  if (amount_type === 'shipping') amount = 0
  else if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Please enter a valid discount amount.' }
  }

  const unlimited = Boolean(payload.unlimited ?? payload.isUnlimited ?? payload.is_unlimited)
  const body = {
    name,
    description: String(payload.description || '').trim(),
    amount,
    amount_type,
    min_order: Number(payload.minOrder ?? payload.min_order ?? 0) || 0,
    is_unlimited: unlimited,
    start_date: payload.startDate || payload.start_date || null,
    end_date: unlimited ? null : (payload.endDate || payload.end_date || null),
    usage_limit: Number(payload.usageLimit ?? payload.usage_limit ?? 0) || 0,
  }

  if (payload.usage !== undefined || payload.usage_count !== undefined || payload.usageCount !== undefined) {
    const usageCount = Number(payload.usage ?? payload.usage_count ?? payload.usageCount)
    if (Number.isFinite(usageCount) && usageCount >= 0) {
      body.usage_count = Math.floor(usageCount)
    }
  }

  const isActive = payload.isActive ?? payload.is_active
  if (isActive !== undefined) body.is_active = Boolean(isActive)
  if (payload.status !== undefined) body.is_active = String(payload.status).toLowerCase() === 'active'

  return { body }
}

export const fetchCoupons = createAsyncThunk(
  'coupon/fetchAll',
  async ({ page = 1, limit = 50, search = '', date_from = '', date_to = '' } = {}, { rejectWithValue }) => {
    try {
      const data = await fetchCouponsAPI({ page, limit, search, date_from, date_to })
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
