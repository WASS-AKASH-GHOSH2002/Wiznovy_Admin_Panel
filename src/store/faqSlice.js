import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchFaqs = createAsyncThunk(
  'faqs/fetchFaqs',
  async ({ limit = 10, offset = 0, keyword = '', status = '', type = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;
    if (type) params.type = type;

    const response = await api.get('/faqs/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createFaq = createAsyncThunk(
  'faqs/createFaq',
  async (faqData) => {
    const response = await api.post('/faqs', faqData);
    return response.data;
  }
);

export const updateFaqStatus = createAsyncThunk(
  'faqs/updateFaqStatus',
  async ({ faqId, status }) => {
    const response = await api.put(`/faqs/status/${faqId}`, { status });
    return response.data;
  }
);

export const updateFaq = createAsyncThunk(
  'faqs/updateFaq',
  async ({ faqId, question, answer, type }) => {
    const response = await api.patch(`/faqs/${faqId}`, { question, answer, type });
    return response.data;
  }
);

export const bulkUpdateFaqStatus = createAsyncThunk(
  'faqs/bulkUpdateFaqStatus',
  async ({ ids, status }) => {
    await api.put('/faqs/bulk-status', { ids, status });
    return { ids, status };
  }
);

export const fetchFaqDetails = createAsyncThunk(
  'faqs/fetchFaqDetails',
  async (faqId) => {
    const response = await api.get(`/faqs/${faqId}`);
    return response.data;
  }
);

const faqSlice = createSlice({
  name: 'faqs',
  initialState: {
    faqs: [],
    total: 0,
    loading: false,
    error: null,
    selectedFaq: null,
    detailsLoading: false,
    filters: {
      status: '',
      type: '',
      search: ''
    }
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setTypeFilter: (state, action) => {
      state.filters.type = action.payload;
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        type: '',
        search: ''
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchFaqDetails.pending, (state) => {
        state.detailsLoading = true;
      })
      .addCase(fetchFaqDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedFaq = action.payload;
      })
      .addCase(fetchFaqDetails.rejected, (state) => {
        state.detailsLoading = false;
      });
  }
});

export const { setStatusFilter, setTypeFilter, setSearch, clearFilters, clearError } = faqSlice.actions;
export default faqSlice.reducer;
