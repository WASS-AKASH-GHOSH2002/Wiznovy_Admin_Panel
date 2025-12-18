import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

/* =====================
   ASYNC THUNKS
===================== */

export const fetchLanguages = createAsyncThunk(
  'languages/fetchLanguages',
  async (params, { rejectWithValue }) => {
    try {
      const { limit = 50, offset = 0, keyword = '', status = '' } = params || {};

      const queryParams = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
        ...(keyword && { keyword }),
        ...(status && { status }),
      });

      const response = await api.get(`/languages/all?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createLanguage = createAsyncThunk(
  'languages/createLanguage',
  async (languageData, { rejectWithValue }) => {
    try {
      const response = await api.post('/languages', languageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateLanguageStatus = createAsyncThunk(
  'languages/updateLanguageStatus',
  async ({ languageId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/languages/${languageId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* =====================
   REDUCER HELPERS
===================== */

const createAsyncReducers = (entityName) => ({
  pending: (state) => {
    state.loading = true;
    state.error = null;
  },
  rejected: (state, action) => {
    state.loading = false;
    state.error = action.payload || action.error?.message;
  },
  fulfilled: (state) => {
    state.loading = false;
  }
});

const updateById = (list, payload) => {
  const index = list.findIndex(item => item.id === payload.id);
  if (index !== -1) {
    list[index] = payload;
  }
};

/* =====================
   SLICE
===================== */

const languageSlice = createSlice({
  name: 'languages',
  initialState: {
    languages: [],
    total: 0,
    loading: false,
    error: null,
    filters: {
      search: '',
      status: '',
    },
  },
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    const asyncReducers = createAsyncReducers('languages');
    
    builder
      /* FETCH LANGUAGES */
      .addCase(fetchLanguages.pending, asyncReducers.pending)
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        asyncReducers.fulfilled(state);
        state.languages = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchLanguages.rejected, asyncReducers.rejected)

      /* CREATE LANGUAGE */
      .addCase(createLanguage.pending, asyncReducers.pending)
      .addCase(createLanguage.fulfilled, (state, action) => {
        asyncReducers.fulfilled(state);
        state.languages.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createLanguage.rejected, asyncReducers.rejected)

      /* UPDATE LANGUAGE STATUS */
      .addCase(updateLanguageStatus.pending, asyncReducers.pending)
      .addCase(updateLanguageStatus.fulfilled, (state, action) => {
        asyncReducers.fulfilled(state);
        updateById(state.languages, action.payload);
      })
      .addCase(updateLanguageStatus.rejected, asyncReducers.rejected);
  },
});

export const { setSearch, setStatusFilter } = languageSlice.actions;
export default languageSlice.reducer;
