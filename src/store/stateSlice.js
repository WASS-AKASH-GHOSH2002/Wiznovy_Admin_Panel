import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchStates = createAsyncThunk(
  'states/fetchStates',
  async ({ limit = 20, offset = 0, keyword = '', status = '', countryId = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;
    if (countryId) params.countryId = countryId;

    const response = await api.get('/state', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createState = createAsyncThunk(
  'states/createState',
  async ({ name, code, countryId }) => {
    const response = await api.post('/state', { name, code, countryId });
    return response.data;
  }
);

export const updateStateStatus = createAsyncThunk(
  'states/updateStateStatus',
  async ({ stateId, status }) => {
    await api.put(`/state/status/${stateId}`, { status });
    return { stateId, status };
  }
);

export const updateState = createAsyncThunk(
  'states/updateState',
  async ({ stateId, name, code, countryId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/state/${stateId}`, { name, code, countryId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateStateStatus = createAsyncThunk(
  'states/bulkUpdateStateStatus',
  async ({ ids, status }) => {
    await api.put('/state/bulk-status', { ids, status });
    return { ids, status };
  }
);

const stateSlice = createSlice({
  name: 'states',
  initialState: {
    states: [],
    total: 0,
    loading: false,
    error: null,
    filters: {
      search: '',
      status: '',
      countryId: ''
    }
  },
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setCountryFilter: (state, action) => {
      state.filters.countryId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createState.fulfilled, (state, action) => {
        state.states.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateStateStatus.fulfilled, (state, action) => {
        // Don't update local state - let the refresh API call handle it
      })
      .addCase(updateState.fulfilled, (state, action) => {
        const index = state.states.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.states[index] = action.payload;
        }
      })
      .addCase(bulkUpdateStateStatus.fulfilled, (state, action) => {
        // Don't update local state - let the refresh API call handle it
      });
  }
});

export const { setSearch, setStatusFilter, setCountryFilter, clearError } = stateSlice.actions;
export default stateSlice.reducer;
