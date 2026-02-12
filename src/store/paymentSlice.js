import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async ({ limit = 10, offset = 0, purchaseType = '', paymentStatus = '', date = '', keyword = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (purchaseType) params.purchaseType = purchaseType;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (date) params.date = date;
    if (keyword) params.keyword = keyword;

    const response = await api.get('/payment/admin/all-payments', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const fetchPaymentDetails = createAsyncThunk(
  'payments/fetchPaymentDetails',
  async (paymentId) => {
    const response = await api.get(`/payment/purchase/${paymentId}`);
    return response.data;
  }
);

export const downloadInvoice = createAsyncThunk(
  'payments/downloadInvoice',
  async (purchaseId) => {
    const response = await api.get(`/payment/admin/invoice/download/${purchaseId}`, {
      responseType: 'blob'
    });
    return { blob: response.data, purchaseId };
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    payments: [],
    total: 0,
    loading: false,
    error: null,
    selectedPayment: null,
    detailsLoading: false,
    filters: {
      purchaseType: '',
      paymentStatus: '',
      date: '',
      search: ''
    }
  },
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setPurchaseTypeFilter: (state, action) => {
      state.filters.purchaseType = action.payload;
    },
    setPaymentStatusFilter: (state, action) => {
      state.filters.paymentStatus = action.payload;
    },
    setDateFilter: (state, action) => {
      state.filters.date = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        purchaseType: '',
        paymentStatus: '',
        date: '',
        search: ''
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPaymentDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedPayment = action.payload;
      })
      .addCase(fetchPaymentDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.error.message;
      });
  }
});

export const { setSearch, setPurchaseTypeFilter, setPaymentStatusFilter, setDateFilter, clearFilters, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
