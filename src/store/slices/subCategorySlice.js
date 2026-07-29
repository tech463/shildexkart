import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createSubCategoryAPI,
  deleteSubCategoryAPI,
  fetchSubCategoriesAPI,
  setSubCategoryStatusAPI,
  updateSubCategoryAPI,
} from '../../services/subCategoryService'

const toErrorMessage = (error) => {
  const payload = error?.response?.data
  return (
    payload?.message ||
    payload?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

export const fetchSubCategories = createAsyncThunk(
  'subCategory/fetchAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await fetchSubCategoriesAPI({ page, limit })
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const createSubCategory = createAsyncThunk(
  'subCategory/create',
  async (payload, { rejectWithValue }) => {
    try {
      const formData = payload instanceof FormData ? payload : new FormData()

      if (!(payload instanceof FormData)) {
        const {
          categoryId,
          category_id,
          name,
          icon,
          sortOrder,
          image,
        } = payload || {}

        const cid = categoryId ?? category_id
        formData.append('category_id', String(cid ?? '').trim())
        formData.append('name', String(name ?? '').trim())
        formData.append('icon', String(icon?.id ?? icon?.label ?? icon ?? '').trim())
        formData.append('sort_order', String(sortOrder ?? 0))
        if (image instanceof File) formData.append('image', image)
      }

      const data = await createSubCategoryAPI(formData)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const updateSubCategory = createAsyncThunk(
  'subCategory/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const formData = payload instanceof FormData ? payload : new FormData()

      if (!(payload instanceof FormData)) {
        const {
          categoryId,
          category_id,
          name,
          icon,
          sortOrder,
          image,
          keepImage,
        } = payload || {}

        const cid = categoryId ?? category_id
        formData.append('category_id', String(cid ?? '').trim())
        formData.append('name', String(name ?? '').trim())
        formData.append('icon', String(icon?.id ?? icon?.label ?? icon ?? '').trim())
        formData.append('sort_order', String(sortOrder ?? 0))

        if (image instanceof File) formData.append('image', image)
        if (!keepImage && image === null) {
          formData.append('image', '')
        }
      }

      const data = await updateSubCategoryAPI(id, formData)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const toggleSubCategoryStatus = createAsyncThunk(
  'subCategory/toggleStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const data = await setSubCategoryStatusAPI(id, isActive)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

export const deleteSubCategory = createAsyncThunk(
  'subCategory/delete',
  async (id, { rejectWithValue }) => {
    try {
      const data = await deleteSubCategoryAPI(id)
      return data?.data ?? data
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  }
)

const subCategorySlice = createSlice({
  name: 'subCategory',
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
    clearSubCategoryError: (state) => {
      state.error = ''
    },
    setSubCategoryRows: (state, action) => {
      state.rows = action.payload ?? []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubCategories.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.loading = false
        state.error = ''
        state.rows = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })

      .addCase(createSubCategory.pending, (state) => {
        state.creating = true
        state.error = ''
      })
      .addCase(createSubCategory.fulfilled, (state) => {
        state.creating = false
        state.error = ''
      })
      .addCase(createSubCategory.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload || action.error.message
      })

      .addCase(updateSubCategory.pending, (state) => {
        state.updating = true
        state.error = ''
      })
      .addCase(updateSubCategory.fulfilled, (state) => {
        state.updating = false
        state.error = ''
      })
      .addCase(updateSubCategory.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload || action.error.message
      })

      .addCase(toggleSubCategoryStatus.pending, (state) => {
        state.toggling = true
        state.error = ''
      })
      .addCase(toggleSubCategoryStatus.fulfilled, (state) => {
        state.toggling = false
        state.error = ''
      })
      .addCase(toggleSubCategoryStatus.rejected, (state, action) => {
        state.toggling = false
        state.error = action.payload || action.error.message
      })

      .addCase(deleteSubCategory.pending, (state) => {
        state.deleting = true
        state.error = ''
      })
      .addCase(deleteSubCategory.fulfilled, (state) => {
        state.deleting = false
        state.error = ''
      })
      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearSubCategoryError, setSubCategoryRows } = subCategorySlice.actions
export default subCategorySlice.reducer

