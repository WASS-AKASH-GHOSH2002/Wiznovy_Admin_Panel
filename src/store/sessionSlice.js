import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchSessions = createAsyncThunk(
  'sessions/fetchSessions',
  async ({ limit = 10, offset = 0, status = '', date = '', sessionType = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (status) params.status = status;
    if (date) params.date = date;
    if (sessionType) params.sessionType = sessionType;

    const response = await api.get('/sessions/admin/all', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const fetchSessionDetails = createAsyncThunk(
  'sessions/fetchSessionDetails',
  async (sessionId) => {
    const response = await api.get(`/sessions/admin/${sessionId}`);
    return response.data;
  }
);

const sessionSlice = createSlice({
  name: 'sessions',
  initialState: {
    sessions: [],
    total: 0,
    loading: false,
    error: null,
    selectedSession: null,
    detailsLoading: false,
    filters: {
      status: '',
      date: '',
      sessionType: ''
    }
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setDateFilter: (state, action) => {
      state.filters.date = action.payload;
    },
    setSessionTypeFilter: (state, action) => {
      state.filters.sessionType = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        date: '',
        sessionType: ''
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchSessionDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchSessionDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedSession = action.payload;
      })
      .addCase(fetchSessionDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.error.message;
      });
  }
});

export const { setStatusFilter, setDateFilter, setSessionTypeFilter, clearFilters, clearError } = sessionSlice.actions;
export default sessionSlice.reducer;
