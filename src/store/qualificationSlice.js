import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchQualifications = createAsyncThunk(
  'qualifications/fetchQualifications',
  async ({ limit = 20, offset = 0, keyword = '', status = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;

    const response = await api.get('/qualification/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createQualification = createAsyncThunk(
  'qualifications/createQualification',
  async ({ name }) => {
    const response = await api.post('/qualification', { name });
    return response.data;
  }
);

export const updateQualificationStatus = createAsyncThunk(
  'qualifications/updateQualificationStatus',
  async ({ qualificationId, status }) => {
    await api.put(`/qualification/status/${qualificationId}`, { status });
    return { qualificationId, status };
  }
);

export const updateQualification = createAsyncThunk(
  'qualifications/updateQualification',
  async ({ qualificationId, name }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/qualification/${qualificationId}`, { name });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateQualificationStatus = createAsyncThunk(
  'qualifications/bulkUpdateQualificationStatus',
  async ({ ids, status }) => {
    await api.put('/qualification/bulk-status', { ids, status });
    return { ids, status };
  }
);

const qualificationSlice = createSlice({
  name: 'qualifications',
  initialState: {
    qualifications: [],
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
      .addCase(fetchQualifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQualifications.fulfilled, (state, action) => {
        state.loading = false;
        state.qualifications = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchQualifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createQualification.fulfilled, (state, action) => {
        state.qualifications.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateQualificationStatus.fulfilled, (state, action) => {
        // Don't update local state - let the refresh API call handle it
      })
      .addCase(updateQualification.fulfilled, (state, action) => {
        const index = state.qualifications.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.qualifications[index] = action.payload;
        }
      })
      .addCase(bulkUpdateQualificationStatus.fulfilled, (state, action) => {
        // Don't update local state - let the refresh API call handle it
      });
  }
});

export const { setSearch, setStatusFilter, clearError } = qualificationSlice.actions;
export default qualificationSlice.reducer;
