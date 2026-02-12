import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async ({ limit = 10, offset = 0, keyword = '', status = '', bannerType = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;
    if (bannerType) params.bannerType = bannerType;

    const response = await api.get('/banner/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createBanner = createAsyncThunk(
  'banners/createBanner',
  async ({ file, bannerType }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bannerType', bannerType);
    const response = await api.post('/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);

export const updateBannerStatus = createAsyncThunk(
  'banners/updateBannerStatus',
  async ({ bannerId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/banner/status/${bannerId}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update status');
    }
  }
);

export const updateBanner = createAsyncThunk(
  'banners/updateBanner',
  async ({ bannerId, bannerType }) => {
    const response = await api.put(`/banner/type/${bannerId}`, { bannerType });
    return response.data;
  }
);

export const uploadBannerImage = createAsyncThunk(
  'banners/uploadBannerImage',
  async ({ bannerId, file }) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.put(`/banner/image/${bannerId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);

export const bulkUpdateBannerStatus = createAsyncThunk(
  'banners/bulkUpdateBannerStatus',
  async ({ ids, status }) => {
    const response = await api.put('/banner/bulk/status', { ids, status });
    return response.data;
  }
);

const bannerSlice = createSlice({
  name: 'banners',
  initialState: {
    banners: [],
    total: 0,
    loading: false,
    error: null,
    filters: {
      search: '',
      status: '',
      bannerType: ''
    }
  },
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setBannerTypeFilter: (state, action) => {
      state.filters.bannerType = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.banners.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateBannerStatus.fulfilled, (state, action) => {
        const banner = state.banners.find(b => b.id === action.payload.id);
        if (banner) {
          banner.status = action.payload.status;
        }
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        const index = state.banners.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
      })
      .addCase(uploadBannerImage.fulfilled, (state, action) => {
        const index = state.banners.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
      });
  }
});

export const { setSearch, setStatusFilter, setBannerTypeFilter, clearError } = bannerSlice.actions;
export default bannerSlice.reducer;
