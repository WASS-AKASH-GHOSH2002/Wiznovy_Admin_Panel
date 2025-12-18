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

const pendingReducer = (state) => {
  state.loading = true;
  state.error = null;
};

const rejectedReducer = (state, action) => {
  state.loading = false;
  state.error = action.payload || action.error?.message;
};

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
    builder

      /* FETCH LANGUAGES */
      .addCase(fetchLanguages.pending, pendingReducer)
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.loading = false;
        state.languages = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchLanguages.rejected, rejectedReducer)

      /* CREATE LANGUAGE */
      .addCase(createLanguage.pending, pendingReducer)
      .addCase(createLanguage.fulfilled, (state, action) => {
        state.loading = false;
        state.languages.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createLanguage.rejected, rejectedReducer)

      /* UPDATE LANGUAGE STATUS */
      .addCase(updateLanguageStatus.pending, pendingReducer)
      .addCase(updateLanguageStatus.fulfilled, (state, action) => {
        state.loading = false;
        updateById(state.languages, action.payload);
      })
      .addCase(updateLanguageStatus.rejected, rejectedReducer);
  },
});

export const { setSearch, setStatusFilter } = languageSlice.actions;
export default languageSlice.reducer;
