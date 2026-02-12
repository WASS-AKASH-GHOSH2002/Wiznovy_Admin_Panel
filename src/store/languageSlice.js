import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchLanguages = createAsyncThunk(
  'languages/fetchLanguages',
  async ({ limit = 20, offset = 0, keyword = '', status = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;

    const response = await api.get('/languages/all', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createLanguage = createAsyncThunk(
  'languages/createLanguage',
  async ({ name }) => {
    const response = await api.post('/languages', { name });
    return response.data;
  }
);

export const updateLanguageStatus = createAsyncThunk(
  'languages/updateLanguageStatus',
  async ({ languageId, status }) => {
    await api.put(`/languages/status/${languageId}`, { status });
    return { languageId, status };
  }
);

export const updateLanguage = createAsyncThunk(
  'languages/updateLanguage',
  async ({ languageId, name }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/languages/${languageId}`, { name });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateLanguageStatus = createAsyncThunk(
  'languages/bulkUpdateLanguageStatus',
  async ({ ids, status }) => {
    await api.put('/languages/bulk-status', { ids, status });
    return { ids, status };
  }
);

const languageSlice = createSlice({
  name: 'languages',
  initialState: {
    languages: [],
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
      .addCase(fetchLanguages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.loading = false;
        state.languages = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createLanguage.fulfilled, (state, action) => {
        state.languages.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateLanguageStatus.fulfilled, (state, action) => {
       
      })
      .addCase(updateLanguage.fulfilled, (state, action) => {
        const index = state.languages.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.languages[index] = action.payload;
        }
      })
      .addCase(bulkUpdateLanguageStatus.fulfilled, (state, action) => {
        // Don't update local state - let the refresh API call handle it
      })
      .addCase(bulkUpdateLanguageStatus.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  }
});

export const { setSearch, setStatusFilter, clearError } = languageSlice.actions;
export default languageSlice.reducer;
