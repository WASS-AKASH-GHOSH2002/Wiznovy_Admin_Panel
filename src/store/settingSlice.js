import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchsettings = createAsyncThunk(
  'setting/fetchsettings',
  async () => {
    const response = await api.get('/settings');
    return response.data;
  }
);

export const updatesettings = createAsyncThunk(
  'setting/updatesettings',
  async ({ id, field, value }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/settings/${id}`, { [field]: value });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update setting');
    }
  }
);

const settingSlice = createSlice({
  name: 'setting',
  initialState: {
    setting: null,
    total: 0,
    loading: false,
    error: null,
    filters: {
      search: ''
    }
  },
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchsettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchsettings.fulfilled, (state, action) => {
        state.loading = false;
        state.setting = action.payload;
        state.total = Object.keys(action.payload || {}).length;
      })
      .addCase(fetchsettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updatesettings.fulfilled, (state, action) => {
        state.setting = action.payload;
      })
      .addCase(updatesettings.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  }
});

export const { setSearch, clearError } = settingSlice.actions;
export default settingSlice.reducer;
