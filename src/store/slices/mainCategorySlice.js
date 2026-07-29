import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createMainCategoryAPI,
  deleteMainCategoryAPI,
  fetchMainCategoriesAPI,
  setMainCategoryStatusAPI,
  updateMainCategoryAPI,
} from '../../services/mainCategoryService'

const toErrorMessage = (error) => {
  const payload = error?.response?.data
  return (
    payload?.message ||
    payload?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

export const fetchMainCategories = createAsyncThunk(
  'mainCategory/fetchAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await fetchMainCategoriesAPI({ page, limit })
      // Expected SS response shape: { success, message, data: [...] }
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const createMainCategory = createAsyncThunk(
  'mainCategory/create',
  async (payload, { rejectWithValue }) => {
    try {
      const formData = payload instanceof FormData ? payload : new FormData()

      // If caller passed a plain object, convert to FormData.
      if (!(payload instanceof FormData)) {
        const {
          name,
          icon,
          sortOrder,
          image,
          active,
          status, // not required by API usually but UI passes it
        } = payload || {}

        formData.append('name', String(name ?? '').trim())
        formData.append('icon', String(icon?.id ?? icon?.label ?? '').trim())
        formData.append('sort_order', String(sortOrder ?? 0))
        if (image instanceof File) formData.append('image', image)
        // Postman SS ke hisaab se create API me is_active/status form-data nahi tha.
      }

      const data = await createMainCategoryAPI(formData)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const updateMainCategory = createAsyncThunk(
  'mainCategory/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const formData = payload instanceof FormData ? payload : new FormData()

      if (!(payload instanceof FormData)) {
        const {
          name,
          icon,
          sortOrder,
          image,
          active,
          status,
          keepImage,
        } = payload || {}

        formData.append('name', String(name ?? '').trim())
        formData.append('icon', String(icon?.id ?? icon?.label ?? '').trim())
        formData.append('sort_order', String(sortOrder ?? 0))

        // If user removed image or kept old, don't send image. Backend should keep existing.
        if (image instanceof File) formData.append('image', image)
        if (!keepImage && image === null) {
          // Some backends accept explicit null/empty; harmless if ignored.
          // eslint-disable-next-line no-useless-concat
          formData.append('image', '')
        }
      }

      const data = await updateMainCategoryAPI(id, formData)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const toggleMainCategoryStatus = createAsyncThunk(
  'mainCategory/toggleStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const data = await setMainCategoryStatusAPI(id, isActive)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const deleteMainCategory = createAsyncThunk(
  'mainCategory/delete',
  async (id, { rejectWithValue }) => {
    try {
      const data = await deleteMainCategoryAPI(id)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

const mainCategorySlice = createSlice({
  name: 'mainCategory',
  initialState: {
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    toggling: false,
    error: '',
    rows: [],
    page: 1,
    limit: 10,
  },
  reducers: {
    clearMainCategoryError: (state) => {
      state.error = ''
    },
    setMainCategoryRows: (state, action) => {
      state.rows = action.payload ?? []
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchMainCategories.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchMainCategories.fulfilled, (state, action) => {
        state.loading = false
        state.error = ''
        state.rows = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchMainCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })

      // create
      .addCase(createMainCategory.pending, (state) => {
        state.creating = true
        state.error = ''
      })
      .addCase(createMainCategory.fulfilled, (state) => {
        state.creating = false
        state.error = ''
      })
      .addCase(createMainCategory.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload || action.error.message
      })

      // update
      .addCase(updateMainCategory.pending, (state) => {
        state.updating = true
        state.error = ''
      })
      .addCase(updateMainCategory.fulfilled, (state) => {
        state.updating = false
        state.error = ''
      })
      .addCase(updateMainCategory.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload || action.error.message
      })

      // toggle
      .addCase(toggleMainCategoryStatus.pending, (state) => {
        state.toggling = true
        state.error = ''
      })
      .addCase(toggleMainCategoryStatus.fulfilled, (state) => {
        state.toggling = false
        state.error = ''
      })
      .addCase(toggleMainCategoryStatus.rejected, (state, action) => {
        state.toggling = false
        state.error = action.payload || action.error.message
      })

      // delete
      .addCase(deleteMainCategory.pending, (state) => {
        state.deleting = true
        state.error = ''
      })
      .addCase(deleteMainCategory.fulfilled, (state) => {
        state.deleting = false
        state.error = ''
      })
      .addCase(deleteMainCategory.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearMainCategoryError, setMainCategoryRows } = mainCategorySlice.actions
export default mainCategorySlice.reducer

