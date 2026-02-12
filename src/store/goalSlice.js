import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async ({ limit = 10, offset = 0, keyword = '', status = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;

    const response = await api.get('/goal/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData) => {
    const response = await api.post('/goal', goalData);
    return response.data;
  }
);

export const updateGoalStatus = createAsyncThunk(
  'goals/updateGoalStatus',
  async ({ goalId, status }) => {
    const response = await api.put(`/goal/status/${goalId}`, { status });
    return response.data;
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ goalId, name }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/goal/${goalId}`, { name });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateGoalStatus = createAsyncThunk(
  'goals/bulkUpdateGoalStatus',
  async ({ ids, status }) => {
    await api.put('/goal/bulk-status', { ids, status });
    return { ids, status };
  }
);

const goalSlice = createSlice({
  name: 'goals',
  initialState: {
    goals: [],
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
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateGoalStatus.fulfilled, (state) => {
        // Don't update local state - let the refresh API call handle it
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(bulkUpdateGoalStatus.fulfilled, (state) => {
        // Don't update local state - let the refresh API call handle it
      });
  }
});

export const { setSearch, setStatusFilter, clearError } = goalSlice.actions;
export default goalSlice.reducer;
