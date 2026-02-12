import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchAdminLogs = createAsyncThunk(
  'adminLogs/fetchAdminLogs',
  async ({ limit = 10, offset = 0, targetId = '', targetType = '', adminId = '', date = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (targetId) params.targetId = targetId;
    if (targetType) params.targetType = targetType;
    if (adminId) params.adminId = adminId;
    if (date) params.date = date;

    const response = await api.get('/admin-action-logs', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

const adminLogSlice = createSlice({
  name: 'adminLogs',
  initialState: {
    logs: [],
    total: 0,
    loading: false,
    error: null,
    filters: {
      targetType: '',
      date: ''
    }
  },
  reducers: {
    setTargetTypeFilter: (state, action) => {
      state.filters.targetType = action.payload;
    },
    setDateFilter: (state, action) => {
      state.filters.date = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        targetType: '',
        date: ''
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchAdminLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setTargetTypeFilter, setDateFilter, clearFilters, clearError } = adminLogSlice.actions;
export default adminLogSlice.reducer;
