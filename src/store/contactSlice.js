import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async ({ limit = 20, offset = 0 } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };

    const response = await api.get('/contact-us/all', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const fetchContactDetails = createAsyncThunk(
  'contacts/fetchContactDetails',
  async (contactId) => {
    const response = await api.get(`/contact-us/${contactId}`);
    return response.data;
  }
);

const contactSlice = createSlice({
  name: 'contacts',
  initialState: {
    contacts: [],
    total: 0,
    loading: false,
    error: null,
    selectedContact: null,
    detailsLoading: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchContactDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchContactDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedContact = action.payload;
      })
      .addCase(fetchContactDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearError } = contactSlice.actions;
export default contactSlice.reducer;
