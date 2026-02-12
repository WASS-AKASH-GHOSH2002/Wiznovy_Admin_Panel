import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchContactCategories = createAsyncThunk(
  'contactCategories/fetchContactCategories',
  async ({ limit = 10, offset = 0, keyword = '', status = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;

    const response = await api.get('/contact-us-category/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createContactCategory = createAsyncThunk(
  'contactCategories/createContactCategory',
  async (categoryData) => {
    const response = await api.post('/contact-us-category', categoryData);
    return response.data;
  }
);

export const updateContactCategoryStatus = createAsyncThunk(
  'contactCategories/updateContactCategoryStatus',
  async ({ categoryId, status }) => {
    const response = await api.put(`/contact-us-category/status/${categoryId}`, { status });
    return response.data;
  }
);

export const updateContactCategory = createAsyncThunk(
  'contactCategories/updateContactCategory',
  async ({ categoryId, title }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/contact-us-category/${categoryId}`, { title });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateContactCategoryStatus = createAsyncThunk(
  'contactCategories/bulkUpdateContactCategoryStatus',
  async ({ ids, status }) => {
    await api.put('/contact-us-category/bulk-status', { ids, status });
    return { ids, status };
  }
);

const contactCategorySlice = createSlice({
  name: 'contactCategories',
  initialState: {
    categories: [],
    total: 0,
    loading: false,
    error: null,
    filters: {
      search: '',
      status: ''
    }
  },
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchContactCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createContactCategory.fulfilled, (state, action) => {
        state.categories.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateContactCategoryStatus.fulfilled, (state) => {
        // Don't update local state - let the refresh API call handle it
      })
      .addCase(updateContactCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(bulkUpdateContactCategoryStatus.fulfilled, (state) => {
        // Don't update local state - let the refresh API call handle it
      });
  }
});

export const { setSearch, setStatusFilter, clearError } = contactCategorySlice.actions;
export default contactCategorySlice.reducer;
