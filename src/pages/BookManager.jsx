import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Settings, RefreshCw, Plus, Upload, Edit,  } from "lucide-react";
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import { fetchSubjects } from '../store/subjectSlice';
import { fetchLanguages } from '../store/languageSlice';
import { fetchBooks, setSearch, setStatusFilter, createBook, uploadBookCoverImage, uploadBookImages, uploadBookPdf, fetchBookById, updateBookStatus, updateBook, updateBookImages, bulkUpdateBookStatus } from '../store/bookSlice';

const BookManager = () => {
  const dispatch = useDispatch();
  
  
  const { books, total, loading, error, filters } = useSelector(state => state.books);
  const { subjects = [] } = useSelector(state => state.subjectsManagement || {});
  const languages = useSelector(state => state.languages?.languages || []);

  
  const [selectedBook, setSelectedBook] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showCoverUploadModal, setShowCoverUploadModal] = useState(false);
  const [showPdfUploadModal, setShowPdfUploadModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  
  const [newBook, setNewBook] = useState({ 
    title: '', 
    description: '',
    authorName: '',
    subject: '',
    language: '',
    numberOfPages: '',
    coverImage: null,
    bookImages: [],
    pdfFile: null
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [createdBookId, setCreatedBookId] = useState(null);
  const [editData, setEditData] = useState({ 
    name: '', 
    authorName: '', 
    description: '',
    subject: '',
    language: ''
  });

  // Status Management
  const [statusUpdateBook, setStatusUpdateBook] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');

 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Image Upload
  const [selectedBookForImage, setSelectedBookForImage] = useState(null);
  const [selectedBookForCover, setSelectedBookForCover] = useState(null);
  const [selectedBookForPdf, setSelectedBookForPdf] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const coverInputRef = useRef(null);
  const pdfInputRef = useRef(null);

 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  

  const [searchKeyword, setSearchKeyword] = useState('');
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);


  const [selectedBooks, setSelectedBooks] = useState([]);
  const [editBook, setEditBook] = useState(null);

  // Debounced search
  const debouncedSearch = useCallback((searchValue) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setSearch(searchValue));
    }, 500);
  }, [dispatch]);

  const handleKeywordChange = (e) => {
    setSearchKeyword(e.target.value);
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    if (searchInputRef.current && document.activeElement !== searchInputRef.current && searchKeyword) {
      const cursorPosition = searchInputRef.current.selectionStart;
      searchInputRef.current.focus();
      searchInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [books, searchKeyword]);

  // Fetch books on mount and when filters change
  useEffect(() => {
    dispatch(fetchSubjects({ limit: 100 }));
    dispatch(fetchLanguages({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    dispatch(fetchBooks({ 
      limit: itemsPerPage, 
      offset, 
      keyword: filters.search, 
      status: filters.status 
    }));
  }, [dispatch, currentPage, itemsPerPage, filters.search, filters.status]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handler functions (will implement these)
  const handleRefresh = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    dispatch(fetchBooks({ 
      limit: itemsPerPage, 
      offset, 
      keyword: filters.search, 
      status: filters.status 
    }));
  };

  const handleOpenCreateModal = () => {
    setNewBook({ 
      title: '', 
      description: '',
      authorName: '',
      subject: '',
      language: '',
      numberOfPages: '',
      coverImage: null,
      bookImages: [],
      pdfFile: null
    });
    setCurrentStep(1);
    setCreatedBookId(null);
    setShowCreateForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    setNewBook(prev => ({ ...prev, [name]: file }));
  };

  const handleMultipleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    setNewBook(prev => ({ ...prev, bookImages: files }));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const requiredFields = ['title', 'authorName', 'description', 'subject', 'language'];
      const isValid = requiredFields.every(field => newBook[field]?.toString().trim());
      
      if (!isValid) {
        toast.error('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      try {
        const selectedSubject = subjects.find(s => s.name === newBook.subject);
        const selectedLanguage = languages.find(l => l.name === newBook.language);
        
        const bookData = {
          name: newBook.title,
          authorName: newBook.authorName,
          description: newBook.description,
          subjectId: selectedSubject?.id,
          languageId: selectedLanguage?.id
        };

        const result = await dispatch(createBook(bookData)).unwrap();
        setCreatedBookId(result.id);
        setCurrentStep(2);
        toast.success('Book created successfully!');
      } catch (error) {
        console.error('Error saving book:', error);
        toast.error(error.message || 'Failed to save book. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 2) {
      if (!newBook.coverImage) {
        toast.error('Please select a cover image');
        return;
      }
      if (!newBook.bookImages || newBook.bookImages.length === 0) {
        toast.error('Please select at least one book image');
        return;
      }

      setIsSubmitting(true);
      try {
        await dispatch(uploadBookCoverImage({ 
          bookId: createdBookId, 
          coverImageFile: newBook.coverImage 
        })).unwrap();
        
        await dispatch(uploadBookImages({ 
          bookId: createdBookId, 
          bookImagesFiles: newBook.bookImages 
        })).unwrap();
        
        setCurrentStep(3);
        toast.success('Images uploaded successfully!');
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error(error.message || 'Failed to upload images. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    
    if (!newBook.pdfFile) {
      toast.error('Please select a PDF file');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await dispatch(uploadBookPdf({ 
        bookId: createdBookId, 
        pdfFile: newBook.pdfFile 
      })).unwrap();
      
      toast.success('Book created successfully!');
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchBooks({ limit: itemsPerPage, offset, keyword: filters.search, status: filters.status }));
      handleCloseCreateModal();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error(error.message || 'Failed to upload PDF. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCreateModal = () => {
    setNewBook({ 
      title: '', 
      description: '',
      authorName: '',
      subject: '',
      language: '',
      numberOfPages: '',
      coverImage: null,
      bookImages: [],
      pdfFile: null
    });
    setCurrentStep(1);
    setCreatedBookId(null);
    setShowCreateForm(false);
  };

  const handleViewProfile = async (book) => {
    try {
      const result = await dispatch(fetchBookById(book.id)).unwrap();
      setSelectedBook(result);
      setShowProfile(true);
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast.error(error.message || 'Failed to load book details');
    }
  };

  const handleStatusUpdate = (book) => {
    setStatusUpdateBook(book);
    setNewStatus(book.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!statusUpdateBook || !newStatus) {
      toast.error('Please select a status');
      return;
    }
    
    setIsUpdating(true);
    try {
      const result = await dispatch(updateBookStatus({ 
        bookId: statusUpdateBook.id, 
        status: newStatus 
      })).unwrap();
      
      toast.success('Book status updated successfully!');
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchBooks({ limit: itemsPerPage, offset, keyword: filters.search, status: filters.status }));
      setShowStatusModal(false);
      setStatusUpdateBook(null);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditBook = (book) => {
    setEditBook(book);
    setEditData({ 
      name: book.name, 
      authorName: book.authorName, 
      description: book.description,
      subject: book.subject?.name || '',
      language: book.language?.name || ''
    });
    setShowEditModal(true);
  };

  const confirmUpdateBook = async () => {
    if (!editBook) return;
    
    setIsUpdating(true);
    try {
      const selectedSubject = subjects.find(s => s.name === editData.subject);
      const selectedLanguage = languages.find(l => l.name === editData.language);
      
      const bookData = {
        name: editData.name,
        authorName: editData.authorName,
        description: editData.description,
        subjectId: selectedSubject?.id,
        languageId: selectedLanguage?.id
      };
      
      await dispatch(updateBook({ bookId: editBook.id, bookData })).unwrap();
      
      toast.success('Book updated successfully!');
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchBooks({ limit: itemsPerPage, offset, keyword: filters.search, status: filters.status }));
      setShowEditModal(false);
      setEditBook(null);
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error(error.message || 'Failed to update book. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = (book) => {
    setSelectedBookForImage(book);
    setShowImageUploadModal(true);
  };

  const handleCoverUpload = (book) => {
    setSelectedBookForCover(book);
    setShowCoverUploadModal(true);
  };

  const handlePdfUpload = (book) => {
    setSelectedBookForPdf(book);
    setShowPdfUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    setSelectedImageFile(files);
  };

  const uploadBookImage = async () => {
    if (!selectedImageFile || selectedImageFile.length === 0) {
      toast.error('Please select images');
      return;
    }
    
    setIsUploading(true);
    try {
      await dispatch(updateBookImages({ 
        bookId: selectedBookForImage.id, 
        bookImagesFiles: selectedImageFile 
      })).unwrap();
      
      toast.success('Images updated successfully!');
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchBooks({ limit: itemsPerPage, offset, keyword: filters.search, status: filters.status }));
      setShowImageUploadModal(false);
      setSelectedImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error updating images:', error);
      toast.error(error.message || 'Failed to update images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadCoverImage = async () => {
    if (!selectedCoverFile) {
      toast.error('Please select a cover image');
      return;
    }
    
    setIsUploading(true);
    try {
      await dispatch(uploadBookCoverImage({ 
        bookId: selectedBookForCover.id, 
        coverImageFile: selectedCoverFile 
      })).unwrap();
      
      toast.success('Cover image updated successfully!');
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchBooks({ limit: itemsPerPage, offset, keyword: filters.search, status: filters.status }));
      setShowCoverUploadModal(false);
      setSelectedCoverFile(null);
      if (coverInputRef.current) coverInputRef.current.value = '';
    } catch (error) {
      console.error('Error updating cover:', error);
      toast.error(error.message || 'Failed to update cover. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadPdf = async () => {
    if (!selectedPdfFile) {
      toast.error('Please select a PDF file');
      return;
    }
    
    setIsUploading(true);
    try {
      await dispatch(uploadBookPdf({ 
        bookId: selectedBookForPdf.id, 
        pdfFile: selectedPdfFile 
      })).unwrap();
      
      toast.success('PDF updated successfully!');
      const offset = (currentPage - 1) * itemsPerPage;
      dispatch(fetchBooks({ limit: itemsPerPage, offset, keyword: filters.search, status: filters.status }));
      setShowPdfUploadModal(false);
      setSelectedPdfFile(null);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    } catch (error) {
      console.error('Error updating PDF:', error);
      toast.error(error.message || 'Failed to update PDF. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectBook = (bookId) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    setSelectedBooks(selectedBooks.length === books.length ? [] : books.map(b => b.id));
  };

  const handleBulkStatusUpdate = () => {
    if (selectedBooks.length > 0) {
      setShowBulkModal(true);
    }
  };

  const confirmBulkStatusUpdate = async () => {
    if (selectedBooks.length > 0 && bulkStatus) {
      setIsBulkUpdating(true);
      try {
        await dispatch(bulkUpdateBookStatus({ ids: selectedBooks, status: bulkStatus })).unwrap();
        toast.success(`${selectedBooks.length} books updated successfully!`);
        setShowBulkModal(false);
        setSelectedBooks([]);
        setBulkStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Bulk status update failed:', error);
        toast.error('Failed to update books status');
      } finally {
        setIsBulkUpdating(false);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Book Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={18} /> Add Book
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Total Books: {total}</p>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by book title or author..."
            value={searchKeyword}
            onChange={handleKeywordChange}
            className="flex-1 border border-gray-300 p-2.5 rounded-lg"
          />
          <select
            value={filters.status}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            className="border border-gray-300 p-2.5 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="DELETED">Deleted</option>
          </select>
          {selectedBooks.length > 0 && (
            <button
              onClick={handleBulkStatusUpdate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Bulk Update ({selectedBooks.length})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBooks.length === books.length && books.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Author</th>
                <th className="p-4 text-left">ISBN</th>
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No books found. Click "Add Book" to create one.
                  </td>
                </tr>
              ) : (
                books.map((book, index) => (
                  <tr key={book.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(book.id)}
                        onChange={() => handleSelectBook(book.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">{book.name}</td>
                    <td className="p-4">{book.authorName}</td>
                    <td className="p-4">{book.isbn || 'N/A'}</td>
                    <td className="p-4">
                      {book.coverImage ? (
                        <img 
                          src={book.coverImage} 
                          alt={book.name} 
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : book.bookImages && book.bookImages.length > 0 ? (
                        <img 
                          src={book.bookImages[0].image} 
                          alt={book.name} 
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        book.status === "ACTIVE" ? "bg-green-100 text-green-800" : 
                        book.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="p-4">{new Date(book.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewProfile(book)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(book)}
                          className="text-green-600 hover:text-green-800"
                          title="Update Status"
                        >
                          <Settings size={18} />
                        </button>
                        <button
                          onClick={() => handleEditBook(book)}
                          className="text-orange-600 hover:text-orange-800"
                          title="Edit Book"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleImageUpload(book)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Upload Images"
                        >
                          <Upload size={18} />
                        </button>
                        <button
                          onClick={() => handleCoverUpload(book)}
                          className="text-pink-600 hover:text-pink-800"
                          title="Upload Cover"
                        >
                          <Upload size={18} />
                        </button>
                        <button
                          onClick={() => handlePdfUpload(book)}
                          className="text-red-600 hover:text-red-800"
                          title="Upload PDF"
                        >
                          <Upload size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6">
          <div className="flex items-center gap-4 justify-between">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 px-2 py-1 rounded text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} books
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-gray-100 rounded">
                Page {currentPage} of {Math.ceil(total / itemsPerPage) || 1}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(total / itemsPerPage)}
                className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showCreateForm}
          onClose={handleCloseCreateModal}
          title={`Create New Book - Step ${currentStep} of 3`}
          maxWidth="max-w-2xl"
          position="center"
          closeOnOutsideClick={false}
        >
          <div className="flex justify-center items-center gap-2 py-4 mb-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  {step}
                </div>
                {step < 3 && <div className={`w-16 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleCreateBook}>
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Book Title *</label>
                  <input type="text" id="title" name="title" value={newBook.title} onChange={handleInputChange} placeholder="Enter book title (Max 100 characters)" required maxLength={100} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div>
                  <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">Author Name *</label>
                  <input type="text" id="authorName" name="authorName" value={newBook.authorName} onChange={handleInputChange} placeholder="Enter author name" required maxLength={60} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea id="description" name="description" value={newBook.description} onChange={handleInputChange} placeholder="Enter book description (Max 200 characters)" rows="4" required maxLength={200} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select id="subject" name="subject" value={newBook.subject} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">Language *</label>
                  <select id="language" name="language" value={newBook.language} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select a language</option>
                    {languages.map((language) => (
                      <option key={language.id} value={language.name}>{language.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="numberOfPages" className="block text-sm font-medium text-gray-700 mb-2">Number of Pages *</label>
                  <input type="number" id="numberOfPages" name="numberOfPages" value={newBook.numberOfPages} onChange={handleInputChange} placeholder="Enter number of pages" required min="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">Cover Image *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input type="file" id="coverImage" name="coverImage" accept="image/*" onChange={handleFileChange} className="hidden" required />
                    <label htmlFor="coverImage" className="cursor-pointer flex flex-col items-center">
                      <Upload size={40} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">{newBook.coverImage ? newBook.coverImage.name : "Click to upload cover image"}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="bookImages" className="block text-sm font-medium text-gray-700 mb-2">Book Images (Max 3) *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input type="file" id="bookImages" name="bookImages" accept="image/*" multiple onChange={handleMultipleFileChange} className="hidden" required />
                    <label htmlFor="bookImages" className="cursor-pointer flex flex-col items-center">
                      <Upload size={40} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">{newBook.bookImages.length > 0 ? `${newBook.bookImages.length} image(s) selected` : "Click to upload book images"}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-2">Upload PDF *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input type="file" id="pdfFile" name="pdfFile" accept=".pdf" onChange={handleFileChange} className="hidden" required />
                  <label htmlFor="pdfFile" className="cursor-pointer flex flex-col items-center">
                    <Upload size={40} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">{newBook.pdfFile ? newBook.pdfFile.name : "Click to upload PDF file"}</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={handleCloseCreateModal} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" disabled={isSubmitting}>
                Cancel
              </button>
              {currentStep < 3 ? (
                <button type="button" onClick={handleNext} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {isSubmitting ? (currentStep === 1 ? 'Creating...' : 'Uploading...') : 'Continue'}
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Uploading PDF...' : 'Complete'}
                </button>
              )}
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={showPdfUploadModal}
          onClose={() => {
            setShowPdfUploadModal(false);
            setSelectedPdfFile(null);
          }}
          title="Update PDF File"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Update PDF for: <strong>{selectedBookForPdf?.name}</strong></p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedPdfFile(e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="w-full flex flex-col items-center"
              >
                <Upload size={40} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {selectedPdfFile ? selectedPdfFile.name : "Click to select PDF file"}
                </span>
              </button>
            </div>
            {selectedPdfFile && (
              <p className="text-xs text-green-600">✓ {selectedPdfFile.name} ({(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowPdfUploadModal(false);
                  setSelectedPdfFile(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={uploadPdf}
                disabled={!selectedPdfFile || isUploading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Update PDF'}
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showCoverUploadModal}
          onClose={() => {
            setShowCoverUploadModal(false);
            setSelectedCoverFile(null);
          }}
          title="Update Cover Image"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Update cover image for: <strong>{selectedBookForCover?.name}</strong></p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedCoverFile(e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="w-full flex flex-col items-center"
              >
                <Upload size={40} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {selectedCoverFile ? selectedCoverFile.name : "Click to select cover image"}
                </span>
              </button>
            </div>
            {selectedCoverFile && (
              <p className="text-xs text-green-600">✓ {selectedCoverFile.name}</p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowCoverUploadModal(false);
                  setSelectedCoverFile(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={uploadCoverImage}
                disabled={!selectedCoverFile || isUploading}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Update Cover'}
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showImageUploadModal}
          onClose={() => {
            setShowImageUploadModal(false);
            setSelectedImageFile(null);
          }}
          title="Update Book Images"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Update images for: <strong>{selectedBookForImage?.name}</strong></p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center"
              >
                <Upload size={40} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {selectedImageFile && selectedImageFile.length > 0 
                    ? `${selectedImageFile.length} image(s) selected` 
                    : "Click to select images (max 3)"}
                </span>
              </button>
            </div>
            {selectedImageFile && selectedImageFile.length > 0 && (
              <div className="space-y-1">
                {Array.from(selectedImageFile).map((file) => (
                  <p key={file.name} className="text-xs text-green-600">✓ {file.name}</p>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowImageUploadModal(false);
                  setSelectedImageFile(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={uploadBookImage}
                disabled={!selectedImageFile || selectedImageFile.length === 0 || isUploading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Update Images'}
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showProfile && selectedBook}
          onClose={() => setShowProfile(false)}
          title="Book Details"
          maxWidth="max-w-4xl"
        >
          {selectedBook && (
            <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {/* Book Cover and Basic Info Section */}
              <div className="flex gap-6">
                {/* Cover Image */}
                <div className="flex-shrink-0">
                  {selectedBook.coverImage ? (
                    <img src={selectedBook.coverImage} alt={selectedBook.name} className="w-48 h-72 object-cover rounded-lg shadow-lg" />
                  ) : (
                    <div className="w-48 h-72 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg shadow-lg flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">No Cover</span>
                    </div>
                  )}
                </div>
                
                {/* Book Info */}
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedBook.name || 'N/A'}</h3>
                  <p className="text-lg text-gray-600">by {selectedBook.authorName || 'N/A'}</p>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 block">ISBN</span>
                      <span className="font-semibold">{selectedBook.isbn || 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 block">Status</span>
                      <span className={`font-semibold ${selectedBook.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedBook.status || 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 block">Subject</span>
                      <span className="font-semibold">{selectedBook.subject?.name || 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 block">Language</span>
                      <span className="font-semibold">{selectedBook.language?.name || 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 block">Rating</span>
                      <span className="font-semibold text-yellow-600">⭐ {selectedBook.averageRating || 'N/A'} ({selectedBook.totalRatings || 0})</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 block">Published</span>
                      <span className="font-semibold">{selectedBook.createdAt ? new Date(selectedBook.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Description</h4>
                <p className="text-gray-700 break-words leading-relaxed">{selectedBook.description || 'N/A'}</p>
              </div>

              {/* Book Images Gallery */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Book Images</h4>
                {selectedBook.bookImages && selectedBook.bookImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {selectedBook.bookImages.slice(0, 3).map((img) => (
                      <img key={img.id || img.image} src={img.image} alt={`Book ${img.id}`} className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow" />
                    ))}
                    {selectedBook.bookImages.length < 3 && Array.from({ length: 3 - selectedBook.bookImages.length }, (_, idx) => `empty-${selectedBook.bookImages.length + idx}`).map((key) => (
                      <div key={key} className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">No Image</div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 3 }, (_, idx) => `placeholder-${idx}`).map((key) => (
                      <div key={key} className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">No Image</div>
                    ))}
                  </div>
                )}
              </div>

              {/* PDF Viewer */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Book Preview</h4>
                {selectedBook.pdfFile ? (
                  <>
                    <div className="border-4 border-gray-200 rounded-lg overflow-hidden shadow-lg">
                      <iframe 
                        src={`${selectedBook.pdfFile}#toolbar=1&navpanes=1&scrollbar=1`}
                        className="w-full h-[500px]"
                        title="Book PDF"
                        type="application/pdf"
                      />
                    </div>
                    <a href={selectedBook.pdfFile} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">📖 Open Full PDF</a>
                  </>
                ) : (
                  <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500">No PDF Available</div>
                )}
              </div>
            </div>
          )}
          <button onClick={() => setShowProfile(false)} className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded-lg">Close</button>
        </Modal>

        <Modal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setStatusUpdateBook(null);
            setNewStatus('');
          }}
          title="Update Book Status"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Update status for: <strong>{statusUpdateBook?.name}</strong></p>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Select Status *</label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="DELETED">Deleted</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusUpdateBook(null);
                  setNewStatus('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStatusUpdate}
                disabled={!newStatus || isUpdating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditBook(null);
          }}
          title="Edit Book"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-2">Book Title *</label>
              <input
                type="text"
                id="editName"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="editAuthor" className="block text-sm font-medium text-gray-700 mb-2">Author Name *</label>
              <input
                type="text"
                id="editAuthor"
                value={editData.authorName}
                onChange={(e) => setEditData(prev => ({ ...prev, authorName: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                id="editDescription"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>
            <div>
              <label htmlFor="editSubject" className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select
                id="editSubject"
                value={editData.subject}
                onChange={(e) => setEditData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="editLanguage" className="block text-sm font-medium text-gray-700 mb-2">Language *</label>
              <select
                id="editLanguage"
                value={editData.language}
                onChange={(e) => setEditData(prev => ({ ...prev, language: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a language</option>
                {languages.map((language) => (
                  <option key={language.id} value={language.name}>{language.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditBook(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUpdateBook}
                disabled={isUpdating}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Book'}
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showBulkModal}
          onClose={() => {
            setShowBulkModal(false);
            setBulkStatus('');
          }}
          title="Bulk Status Update"
          maxWidth="max-w-md"
          position="center"
        >
          <div className="relative">
            {isBulkUpdating && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-sm text-gray-600">Updating...</p>
                </div>
              </div>
            )}
            <p className="text-gray-600 mb-4">
              Update status for <strong>{selectedBooks.length}</strong> selected books
            </p>
            <div className="mb-4">
              <label htmlFor="bulkStatusSelect" className="block text-sm font-medium text-gray-700 mb-2 text-left">Select Status</label>
              <select
                id="bulkStatusSelect"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
              >
                <option value="">Select Status</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="DELETED">Deleted</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkStatus('');
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkStatusUpdate}
                disabled={!bulkStatus || isBulkUpdating}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isBulkUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BookManager;
