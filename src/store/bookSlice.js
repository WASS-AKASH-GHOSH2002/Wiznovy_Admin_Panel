import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../config/axios';

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async ({ limit = 10, offset = 0, keyword = '', status = '', subjectId = '', languageId = '' } = {}) => {
    const params = {
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
      offset: Math.max(Number(offset) || 0, 0)
    };
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;
    if (subjectId) params.subjectId = subjectId;
    if (languageId) params.languageId = languageId;

    const response = await api.get('/books/list', { params });
    return {
      result: response.data.result || [],
      total: response.data.total || 0
    };
  }
);

export const createBook = createAsyncThunk(
  'books/createBook',
  async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  }
);

export const updateBookStatus = createAsyncThunk(
  'books/updateBookStatus',
  async ({ bookId, status }) => {
    const response = await api.put(`/books/status/${bookId}`, { status });
    return response.data;
  }
);

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ bookId, bookData }) => {
    const response = await api.patch(`/books/${bookId}`, bookData);
    return response.data;
  }
);

export const uploadBookCoverImage = createAsyncThunk(
  'books/uploadCoverImage',
  async ({ bookId, coverImageFile }) => {
    const formData = new FormData();
    formData.append('file', coverImageFile);
    const response = await api.put(`/books/cover-image/${bookId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);

export const uploadBookImages = createAsyncThunk(
  'books/uploadBookImages',
  async ({ bookId, bookImagesFiles }) => {
    const formData = new FormData();
    for (const file of bookImagesFiles) {
      formData.append('files', file);
    }
    const response = await api.post(`/books/add/images/${bookId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);

export const updateBookImages = createAsyncThunk(
  'books/updateBookImages',
  async ({ bookId, bookImagesFiles }) => {
    const formData = new FormData();
    for (const file of bookImagesFiles) {
      formData.append('files', file);
    }
    const response = await api.put(`/books/images/${bookId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);

export const uploadBookPdf = createAsyncThunk(
  'books/uploadPdf',
  async ({ bookId, pdfFile }) => {
    const formData = new FormData();
    formData.append('file', pdfFile);
    const response = await api.put(`/books/pdf/${bookId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);


export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (bookId) => {
    const response = await api.get(`/books/${bookId}`);
    return response.data;
  }
);

export const bulkUpdateBookStatus = createAsyncThunk(
  'books/bulkUpdateBookStatus',
  async ({ ids, status }) => {
    const response = await api.put('/books/bulk-status', { ids, status });
    return response.data;
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState: {
    books: [],
    selectedBook: null,
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
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.result;
        state.total = action.payload.total;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.books.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateBookStatus.fulfilled, (state, action) => {
        const book = state.books.find(b => b.id === action.payload.id);
        if (book) {
          book.status = action.payload.status;
        }
        if (state.selectedBook && state.selectedBook.id === action.payload.id) {
          state.selectedBook.status = action.payload.status;
        }
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const index = state.books.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      })
      .addCase(uploadBookCoverImage.fulfilled, (state, action) => {
        const index = state.books.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
        if (state.selectedBook && state.selectedBook.id === action.payload.id) {
          state.selectedBook = action.payload;
        }
      })
      .addCase(updateBookImages.fulfilled, (state, action) => {
        const index = state.books.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
        if (state.selectedBook && state.selectedBook.id === action.payload.id) {
          state.selectedBook = action.payload;
        }
      })
      .addCase(uploadBookPdf.fulfilled, (state, action) => {
        const index = state.books.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
        if (state.selectedBook && state.selectedBook.id === action.payload.id) {
          state.selectedBook = action.payload;
        }
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.selectedBook = action.payload;
      });
  }
});

export const { setSearch, setStatusFilter, clearError } = bookSlice.actions;
export default bookSlice.reducer;
