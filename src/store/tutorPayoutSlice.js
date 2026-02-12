import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchTutorPayouts = createAsyncThunk(
  'tutorPayouts/fetchTutorPayouts',
  async ({ limit = 10, offset = 0, keyword = '', status = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;

    const response = await api.get('/tutor-payout/admin/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const fetchPayoutDetails = createAsyncThunk(
  'tutorPayouts/fetchPayoutDetails',
  async (payoutId) => {
    const response = await api.get(`/tutor-payout/${payoutId}`);
    return response.data;
  }
);

export const approveTutorPayout = createAsyncThunk(
  'tutorPayouts/approveTutorPayout',
  async ({ payoutId, approvalData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tutor-payout/approve/${payoutId}`, approvalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const rejectTutorPayout = createAsyncThunk(
  'tutorPayouts/rejectTutorPayout',
  async ({ payoutId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tutor-payout/reject/${payoutId}`, { rejectionReason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const tutorPayoutSlice = createSlice({
  name: 'tutorPayouts',
  initialState: {
    payouts: [],
    total: 0,
    loading: false,
    error: null,
    selectedPayout: null,
    detailsLoading: false,
    filters: {
      status: '',
      search: ''
    }
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        search: ''
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTutorPayouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTutorPayouts.fulfilled, (state, action) => {
        state.loading = false;
        state.payouts = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchTutorPayouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPayoutDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchPayoutDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedPayout = action.payload;
      })
      .addCase(fetchPayoutDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.error.message;
      });
  }
});

export const { setStatusFilter, setSearch, clearFilters, clearError } = tutorPayoutSlice.actions;
export default tutorPayoutSlice.reducer;
