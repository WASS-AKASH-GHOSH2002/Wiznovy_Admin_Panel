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

const updateTopicById = (state, updatedTopic) => {
  const index = state.topics.findIndex((t) => t.id === updatedTopic.id);
  if (index !== -1) {
    state.topics[index] = updatedTopic;
  }
  if (state.currentTopic?.id === updatedTopic.id) {
    state.currentTopic = updatedTopic;
  }
};

/* =====================
   ASYNC THUNKS
===================== */

export const createTopic = createAsyncThunk(
  'topics/create',
  async (topicData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/topic`,
        topicData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAllTopics = createAsyncThunk(
  'topics/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/topic/all`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getTopicById = createAsyncThunk(
  'topics/getById',
  async (topicId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/topic/${topicId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTopic = createAsyncThunk(
  'topics/update',
  async ({ topicId, topicData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/topic/${topicId}`,
        topicData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTopicStatus = createAsyncThunk(
  'topics/updateStatus',
  async ({ topicId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/topic/status/${topicId}`,
        { status },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTopic = createAsyncThunk(
  'topics/delete',
  async (topicId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/topic/${topicId}`,
        { headers: getAuthHeaders() }
      );
      return topicId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* =====================
   SLICE
===================== */

const topicSlice = createSlice({
  name: 'topics',
  initialState: {
    topics: [],
    currentTopic: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTopic: (state) => {
      state.currentTopic = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* CREATE */
      .addCase(createTopic.pending, pendingReducer)
      .addCase(createTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(action.payload);
      })
      .addCase(createTopic.rejected, rejectedReducer)

      /* GET ALL */
      .addCase(getAllTopics.pending, pendingReducer)
      .addCase(getAllTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload.result || action.payload;
      })
      .addCase(getAllTopics.rejected, rejectedReducer)

      /* GET BY ID */
      .addCase(getTopicById.pending, pendingReducer)
      .addCase(getTopicById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTopic = action.payload;
      })
      .addCase(getTopicById.rejected, rejectedReducer)

      /* UPDATE */
      .addCase(updateTopic.pending, pendingReducer)
      .addCase(updateTopic.fulfilled, (state, action) => {
        state.loading = false;
        updateTopicById(state, action.payload);
      })
      .addCase(updateTopic.rejected, rejectedReducer)

      /* UPDATE STATUS */
      .addCase(updateTopicStatus.pending, pendingReducer)
      .addCase(updateTopicStatus.fulfilled, (state, action) => {
        state.loading = false;
        updateTopicById(state, action.payload);
      })
      .addCase(updateTopicStatus.rejected, rejectedReducer)

      /* DELETE */
      .addCase(deleteTopic.pending, pendingReducer)
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = state.topics.filter(
          (topic) => topic.id !== action.payload
        );
        if (state.currentTopic?.id === action.payload) {
          state.currentTopic = null;
        }
      })
      .addCase(deleteTopic.rejected, rejectedReducer);
  },
});

export const { clearError, clearCurrentTopic } = topicSlice.actions;
export default topicSlice.reducer;
