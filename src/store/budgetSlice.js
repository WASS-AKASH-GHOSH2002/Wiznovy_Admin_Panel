import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async ({ limit = 20, offset = 0, keyword = '', status = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;

    const response = await api.get('/budget/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async ({ min, max }) => {
    const response = await api.post('/budget', { min, max });
    return response.data;
  }
);

export const updateBudgetStatus = createAsyncThunk(
  'budgets/updateBudgetStatus',
  async ({ budgetId, status }) => {
    await api.put(`/budget/status/${budgetId}`, { status });
    return { budgetId, status };
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ budgetId, min, max }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/budget/${budgetId}`, { min, max });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateBudgetStatus = createAsyncThunk(
  'budgets/bulkUpdateBudgetStatus',
  async ({ ids, status }) => {
    await api.put('/budget/bulk-status', { ids, status });
    return { ids, status };
  }
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState: {
    budgets: [],
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
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateBudgetStatus.fulfilled, (state, action) => {
        
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(bulkUpdateBudgetStatus.fulfilled, (state, action) => {
        
      });
  }
});

export const { setSearch, setStatusFilter, clearError } = budgetSlice.actions;
export default budgetSlice.reducer;
