import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async ({ limit = 10, offset = 0, keyword = '', status = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;

    const response = await api.get('/subjects/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createSubject = createAsyncThunk(
  'subjects/createSubject',
  async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  }
);


export const updateSubjectStatus = createAsyncThunk(
  'subjects/updateSubjectStatus',
  async ({ subjectId, status }) => {
    await api.put(`/subjects/status/${subjectId}`, { status });
    return { subjectId, status };
  }
);

export const updateSubject = createAsyncThunk(
  'subjects/updateSubject',
  async ({ subjectId, name }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/subjects/${subjectId}`, { name });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateSubjectStatus = createAsyncThunk(
  'subjects/bulkUpdateSubjectStatus',
  async ({ ids, status }) => {
    await api.put('/subjects/bulk-status', { ids, status });
    return { ids, status };
  }
);

const subjectSlice = createSlice({
  name: 'subjects',
  initialState: {
    subjects: [],
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
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.subjects.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateSubjectStatus.fulfilled, (state, action) => {
    
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        const index = state.subjects.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.subjects[index] = action.payload;
        }
      })
      .addCase(bulkUpdateSubjectStatus.fulfilled, (state, action) => {
       
      });
  }
});

export const { setSearch, setStatusFilter, clearError } = subjectSlice.actions;
export default subjectSlice.reducer;