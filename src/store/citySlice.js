import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/* =====================
   HELPERS
===================== */

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const pendingReducer = (state) => {
  state.loading = true;
  state.error = null;
};

const rejectedReducer = (state, action) => {
  state.loading = false;
  state.error = action.payload || action.error?.message;
};

const updateCityById = (cities, updatedCity) => {
  const index = cities.findIndex((c) => c.id === updatedCity.id);
  if (index !== -1) {
    cities[index] = updatedCity;
  }
};

/* =====================
   ASYNC THUNKS
===================== */

export const createCity = createAsyncThunk(
  'cities/create',
  async (cityData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/city`,
        cityData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCities = createAsyncThunk(
  'cities/fetchCities',
  async (
    { limit = 20, offset = 0, keyword = '', status = '', stateId = '' } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = {
        limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
        offset: Math.max(Number(offset) || 0, 0),
        ...(keyword && { keyword }),
        ...(status && { status }),
        ...(stateId && { stateId }),
      };

      const response = await axios.get(
        `${API_BASE_URL}/city/list`,
        {
          headers: getAuthHeaders(),
          params,
        }
      );

      return {
        result: response.data.result || [],
        total: response.data.total || 0,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCity = createAsyncThunk(
  'cities/update',
  async ({ cityId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/city/${cityId}`,
        data,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCityStatus = createAsyncThunk(
  'cities/updateStatus',
  async ({ cityId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/city/${cityId}`,
        { status },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* =====================
   SLICE
===================== */

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
      stateId: '',
    },
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
    },
  },
  extraReducers: (builder) => {
    builder

      /* CREATE */
      .addCase(createCity.pending, pendingReducer)
      .addCase(createCity.fulfilled, (state, action) => {
        state.loading = false;
        state.cities.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createCity.rejected, rejectedReducer)

      /* FETCH */
      .addCase(fetchCities.pending, pendingReducer)
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchCities.rejected, rejectedReducer)

      /* UPDATE */
      .addCase(updateCity.pending, pendingReducer)
      .addCase(updateCity.fulfilled, (state, action) => {
        state.loading = false;
        updateCityById(state.cities, action.payload);
      })
      .addCase(updateCity.rejected, rejectedReducer)

      /* UPDATE STATUS */
      .addCase(updateCityStatus.pending, pendingReducer)
      .addCase(updateCityStatus.fulfilled, (state, action) => {
        state.loading = false;
        updateCityById(state.cities, action.payload);
      })
      .addCase(updateCityStatus.rejected, rejectedReducer);
  },
});

export const {
  setSearch,
  setStatusFilter,
  setStateFilter,
  clearError,
} = citySlice.actions;

export default citySlice.reducer;
