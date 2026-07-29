import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createCategoryAPI,
  deleteCategoryAPI,
  fetchCategoriesAPI,
  setCategoryStatusAPI,
  updateCategoryAPI,
} from '../../services/categoryService'

const toErrorMessage = (error) => {
  const payload = error?.response?.data
  return (
    payload?.message ||
    payload?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

export const fetchCategories = createAsyncThunk(
  'category/fetchAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await fetchCategoriesAPI({ page, limit })
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const createCategory = createAsyncThunk(
  'category/create',
  async (payload, { rejectWithValue }) => {
    try {
      const formData = payload instanceof FormData ? payload : new FormData()

      if (!(payload instanceof FormData)) {
        const {
          mainCategoryId,
          main_category_id,
          name,
          icon,
          sortOrder,
          image,
          active, // not necessarily required by backend; status toggle handled separately
        } = payload || {}

        const mid = mainCategoryId ?? main_category_id
        formData.append('main_category_id', String(mid ?? '').trim())
        formData.append('name', String(name ?? '').trim())
        formData.append('icon', String(icon?.id ?? icon?.label ?? icon ?? '').trim())
        formData.append('sort_order', String(sortOrder ?? 0))
        if (image instanceof File) formData.append('image', image)
      }

      const data = await createCategoryAPI(formData)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const updateCategory = createAsyncThunk(
  'category/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const formData = payload instanceof FormData ? payload : new FormData()

      if (!(payload instanceof FormData)) {
        const {
          mainCategoryId,
          main_category_id,
          name,
          icon,
          sortOrder,
          image,
          keepImage,
        } = payload || {}

        const mid = mainCategoryId ?? main_category_id
        formData.append('main_category_id', String(mid ?? '').trim())
        formData.append('name', String(name ?? '').trim())
        formData.append('icon', String(icon?.id ?? icon?.label ?? icon ?? '').trim())
        formData.append('sort_order', String(sortOrder ?? 0))

        if (image instanceof File) formData.append('image', image)
        if (!keepImage && image === null) {
          // backend me clear image ke liye empty accept ho sakta hai
          formData.append('image', '')
        }
      }

      const data = await updateCategoryAPI(id, formData)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const toggleCategoryStatus = createAsyncThunk(
  'category/toggleStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const data = await setCategoryStatusAPI(id, isActive)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'category/delete',
  async (id, { rejectWithValue }) => {
    try {
      const data = await deleteCategoryAPI(id)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

const categorySlice = createSlice({
  name: 'category',
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
    clearCategoryError: (state) => {
      state.error = ''
    },
    setCategoryRows: (state, action) => {
      state.rows = action.payload ?? []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.error = ''
        state.rows = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })

      .addCase(createCategory.pending, (state) => {
        state.creating = true
        state.error = ''
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.creating = false
        state.error = ''
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload || action.error.message
      })

      .addCase(updateCategory.pending, (state) => {
        state.updating = true
        state.error = ''
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.updating = false
        state.error = ''
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload || action.error.message
      })

      .addCase(toggleCategoryStatus.pending, (state) => {
        state.toggling = true
        state.error = ''
      })
      .addCase(toggleCategoryStatus.fulfilled, (state) => {
        state.toggling = false
        state.error = ''
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.toggling = false
        state.error = action.payload || action.error.message
      })

      .addCase(deleteCategory.pending, (state) => {
        state.deleting = true
        state.error = ''
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.deleting = false
        state.error = ''
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearCategoryError, setCategoryRows } = categorySlice.actions
export default categorySlice.reducer

