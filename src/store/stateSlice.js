import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

/* =====================
   ASYNC THUNKS
===================== */

export const fetchStates = createAsyncThunk(
  'states/fetchStates',
  async (
    { limit = 20, offset = 0, keyword = '', status = '', countryId = '' } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = {
        limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
        offset: Math.max(Number(offset) || 0, 0),
        ...(keyword && { keyword }),
        ...(status && { status }),
        ...(countryId && { countryId }),
      };

      const response = await api.get('/state', { params });

      return {
        result: response.data.result || [],
        total: response.data.total || 0,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createState = createAsyncThunk(
  'states/createState',
  async (stateData, { rejectWithValue }) => {
    try {
      const response = await api.post('/state', stateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStateStatus = createAsyncThunk(
  'states/updateStateStatus',
  async ({ stateId, status }, { rejectWithValue }) => {
    try {
      await api.put(`/state/status/${stateId}`, { status });
      return { stateId, status };
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

const updateStatusById = (list, { stateId, status }) => {
  const item = list.find((s) => s.id === stateId);
  if (item) {
    item.status = status;
  }
};

/* =====================
   SLICE
===================== */

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
      countryId: '',
    },
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
    },
  },
  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchStates.pending, pendingReducer)
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchStates.rejected, rejectedReducer)

      /* CREATE */
      .addCase(createState.pending, pendingReducer)
      .addCase(createState.fulfilled, (state, action) => {
        state.loading = false;
        state.states.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createState.rejected, rejectedReducer)

      /* UPDATE STATUS */
      .addCase(updateStateStatus.pending, pendingReducer)
      .addCase(updateStateStatus.fulfilled, (state, action) => {
        state.loading = false;
        updateStatusById(state.states, action.payload);
      })
      .addCase(updateStateStatus.rejected, rejectedReducer);
  },
});

export const {
  setSearch,
  setStatusFilter,
  setCountryFilter,
  clearError,
} = stateSlice.actions;

export default stateSlice.reducer;
