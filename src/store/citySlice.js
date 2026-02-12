import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchCities = createAsyncThunk(
  'cities/fetchCities',
  async ({ limit = 20, offset = 0, keyword = '', status = '', stateId = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;
    if (stateId) params.stateId = stateId;

    const response = await api.get('/city/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createCity = createAsyncThunk(
  'cities/createCity',
  async ({ name, code, stateId }) => {
    const response = await api.post('/city', { name,  stateId });
    return response.data;
  }
);

export const updateCityStatus = createAsyncThunk(
  'cities/updateCityStatus',
  async ({ cityId, status }) => {
    await api.put(`/city/status/${cityId}`, { status });
    return { cityId, status };
  }
);

export const updateCity = createAsyncThunk(
  'cities/updateCity',
  async ({ cityId, name, code, stateId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/city/${cityId}`, { name, code, stateId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateCityStatus = createAsyncThunk(
  'cities/bulkUpdateCityStatus',
  async ({ ids, status }) => {
    await api.put('/city/bulk-status', { ids, status });
    return { ids, status };
  }
);

const citySlice = createSlice({
  name: 'cities',
  initialState: {
    cities: [],
    total: 0,
    loading: false,
    error: null,
    filters: {
      search: '',
      status: '',
      stateId: ''
    }
  },
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setStateFilter: (state, action) => {
      state.filters.stateId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCity.fulfilled, (state, action) => {
        state.cities.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateCityStatus.fulfilled, (state, action) => {
        // Don't update local state - let the refresh API call handle it
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        const index = state.cities.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.cities[index] = action.payload;
        }
      })
      .addCase(bulkUpdateCityStatus.fulfilled, (state, action) => {
        // Don't update local state - let the refresh API call handle it
      });
  }
});

export const { setSearch, setStatusFilter, setStateFilter, clearError } = citySlice.actions;
export default citySlice.reducer;
