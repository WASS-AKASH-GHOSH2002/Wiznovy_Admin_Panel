import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const createVideoLecture = createAsyncThunk(
  'videoLecture/createVideoLecture',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/video-lecture/admin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVideoLecture = createAsyncThunk(
  'videoLecture/updateVideoLecture',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/video-lecture/admin/${id}`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVideoThumbnail = createAsyncThunk(
  'videoLecture/updateVideoThumbnail',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.put(`/video-lecture/thumbnail/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVideoFile = createAsyncThunk(
  'videoLecture/updateVideoFile',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.put(`/video-lecture/admin/video/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const videoLectureSlice = createSlice({
  name: 'videoLecture',
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVideoLecture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVideoLecture.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createVideoLecture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateVideoLecture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideoLecture.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateVideoLecture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateVideoThumbnail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideoThumbnail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateVideoThumbnail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateVideoFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideoFile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateVideoFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = videoLectureSlice.actions;
export default videoLectureSlice.reducer;