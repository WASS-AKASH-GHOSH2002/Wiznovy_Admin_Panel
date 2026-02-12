import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchTopics = createAsyncThunk(
  'topics/fetchTopics',
  async ({ limit = 20, offset = 0, keyword = '', status = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;

    const response = await api.get('/topic/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createTopic = createAsyncThunk(
  'topics/createTopic',
  async ({ name }) => {
    const response = await api.post('/topic', { name });
    return response.data;
  }
);

export const updateTopicStatus = createAsyncThunk(
  'topics/updateTopicStatus',
  async ({ topicId, status }) => {
    const response = await api.put(`/topic/status/${topicId}`, { status });
    return response.data;
  }
);

export const updateTopic = createAsyncThunk(
  'topics/updateTopic',
  async ({ topicId, name }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/topic/${topicId}`, { name });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateTopicStatus = createAsyncThunk(
  'topics/bulkUpdateTopicStatus',
  async ({ ids, status }) => {
    await api.put('/topic/bulk-status', { ids, status });
    return { ids, status };
  }
);

const topicSlice = createSlice({
  name: 'topics',
  initialState: {
    topics: [],
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
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.topics.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateTopicStatus.fulfilled, (state, action) => {
        // Don't update local state - let the refresh API call handle it
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        const index = state.topics.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
      })
      .addCase(bulkUpdateTopicStatus.fulfilled, (state, action) => {
        // Don't update local state - let the refresh API call handle it
      });
  }
});

export const { setSearch, setStatusFilter, clearError } = topicSlice.actions;
export default topicSlice.reducer;
