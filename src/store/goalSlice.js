import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/* =====================
   AXIOS HELPER
===================== */

const authRequest = async (method, url, data) => {
  const token = localStorage.getItem('token');

  const response = await axios({
    method,
    url: `${API_BASE_URL}${url}`,
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/* =====================
   THUNKS
===================== */

export const createGoal = createAsyncThunk(
  'goals/create',
  async (goalData, { rejectWithValue }) => {
    try {
      return await authRequest('post', '/goal', goalData);
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  },
);

export const getAllGoals = createAsyncThunk(
  'goals/getAll',
  async (_, { rejectWithValue }) => {
    try {
      return await authRequest('get', '/goal/all');
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  },
);

export const getGoalById = createAsyncThunk(
  'goals/getById',
  async (goalId, { rejectWithValue }) => {
    try {
      return await authRequest('get', `/goal/${goalId}`);
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  },
);

export const updateGoal = createAsyncThunk(
  'goals/update',
  async ({ goalId, goalData }, { rejectWithValue }) => {
    try {
      return await authRequest('patch', `/goal/${goalId}`, goalData);
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  },
);

export const updateGoalStatus = createAsyncThunk(
  'goals/updateStatus',
  async ({ goalId, status }, { rejectWithValue }) => {
    try {
      return await authRequest('patch', `/goal/status/${goalId}`, { status });
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  },
);

export const deleteGoal = createAsyncThunk(
  'goals/delete',
  async (goalId, { rejectWithValue }) => {
    try {
      await authRequest('delete', `/goal/${goalId}`);
      return goalId;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  },
);

/* =====================
   REDUCER HELPERS
===================== */

const pending = (state) => {
  state.loading = true;
  state.error = null;
};

const rejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

/* =====================
   SLICE
===================== */

const goalSlice = createSlice({
  name: 'goals',
  initialState: {
    goals: [],
    currentGoal: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGoal: (state) => {
      state.currentGoal = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* CREATE */
      .addCase(createGoal.pending, pending)
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.push(action.payload);
      })
      .addCase(createGoal.rejected, rejected)

      /* GET ALL */
      .addCase(getAllGoals.pending, pending)
      .addCase(getAllGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload?.result || action.payload;
      })
      .addCase(getAllGoals.rejected, rejected)

      /* GET BY ID */
      .addCase(getGoalById.pending, pending)
      .addCase(getGoalById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGoal = action.payload;
      })
      .addCase(getGoalById.rejected, rejected)

      /* UPDATE */
      .addCase(updateGoal.pending, pending)
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        const i = state.goals.findIndex(g => g.id === action.payload.id);
        if (i !== -1) state.goals[i] = action.payload;
        if (state.currentGoal?.id === action.payload.id) {
          state.currentGoal = action.payload;
        }
      })
      .addCase(updateGoal.rejected, rejected)

      /* UPDATE STATUS */
      .addCase(updateGoalStatus.pending, pending)
      .addCase(updateGoalStatus.fulfilled, (state, action) => {
        state.loading = false;
        const i = state.goals.findIndex(g => g.id === action.payload.id);
        if (i !== -1) state.goals[i] = action.payload;
        if (state.currentGoal?.id === action.payload.id) {
          state.currentGoal = action.payload;
        }
      })
      .addCase(updateGoalStatus.rejected, rejected)

      /* DELETE */
      .addCase(deleteGoal.pending, pending)
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.filter(g => g.id !== action.payload);
        if (state.currentGoal?.id === action.payload) {
          state.currentGoal = null;
        }
      })
      .addCase(deleteGoal.rejected, rejected);
  },
});

export const { clearError, clearCurrentGoal } = goalSlice.actions;
export default goalSlice.reducer;
