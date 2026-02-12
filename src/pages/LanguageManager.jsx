import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Settings, RefreshCw, Plus, Edit } from "lucide-react";
import { fetchLanguages, createLanguage, updateLanguageStatus, updateLanguage, bulkUpdateLanguageStatus, setSearch, setStatusFilter } from "../store/languageSlice";
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

const LanguageManager = () => {
  const dispatch = useDispatch();
  const { languages, total, loading, error, filters } = useSelector(state => state.languages);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLanguage, setNewLanguage] = useState({ name: '' });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateLanguage, setStatusUpdateLanguage] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLanguage, setEditLanguage] = useState(null);
  const [editData, setEditData] = useState({ name: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

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
  }, [languages, searchKeyword]);

  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage, 
      offset, 
      keyword: filters.search
    };
    if (filters.status) {
      params.status = filters.status;
    }
    dispatch(fetchLanguages(params));
  }, [dispatch, currentPage, itemsPerPage, filters.search, filters.status]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusUpdate = (language) => {
    setStatusUpdateLanguage(language);
    setNewStatus(language.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (statusUpdateLanguage && newStatus) {
      try {
        await dispatch(updateLanguageStatus({ languageId: statusUpdateLanguage.id, status: newStatus })).unwrap();
        toast.success('Status updated successfully!');
        setShowStatusModal(false);
        setStatusUpdateLanguage(null);
        setNewStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Status update failed:', error);
        toast.error('Failed to update status');
      }
    }
  };

  const handleSelectLanguage = (languageId) => {
    setSelectedLanguages(prev => 
      prev.includes(languageId) 
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  };

  const handleSelectAll = () => {
    setSelectedLanguages(selectedLanguages.length === languages.length ? [] : languages.map(l => l.id));
  };

  const handleBulkStatusUpdate = () => {
    if (selectedLanguages.length > 0) {
      setShowBulkModal(true);
    }
  };

  const confirmBulkStatusUpdate = async () => {
    if (selectedLanguages.length > 0 && bulkStatus) {
      setIsBulkUpdating(true);
      try {
        const result = await dispatch(bulkUpdateLanguageStatus({ ids: selectedLanguages, status: bulkStatus })).unwrap();
        toast.success(`${selectedLanguages.length} languages updated successfully!`);
        setShowBulkModal(false);
        setSelectedLanguages([]);
        setBulkStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Bulk status update failed:', error);
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to update languages status';
        toast.error(errorMessage);
      } finally {
        setIsBulkUpdating(false);
      }
    }
  };

  const handleViewProfile = (language) => {
    setSelectedLanguage(language);
    setShowProfile(true);
  };

  const handleRefresh = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage,
      offset,
      keyword: filters.search
    };
    if (filters.status) {
      params.status = filters.status;
    }
    dispatch(fetchLanguages(params));
  };

  const handleOpenCreateModal = () => {
    setNewLanguage({ name: '' });
    setShowCreateForm(true);
  };

  const handleCreateLanguage = async (e) => {
    e.preventDefault();
    if (!newLanguage.name.trim()) return;
    
    const existingLanguage = languages.find(language => 
      language.name.toLowerCase() === newLanguage.name.trim().toLowerCase()
    );
    
    if (existingLanguage) {
      toast.error('A language with this name already exists');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dispatch(createLanguage(newLanguage)).unwrap();
      toast.success('Language created successfully!');
      setNewLanguage({ name: '' });
      setShowCreateForm(false);
      handleRefresh();
    } catch (error) {
      console.error('Language creation failed:', error);
      toast.error('Failed to create language');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLanguage = (language) => {
    setEditLanguage(language);
    setEditData({ name: language.name });
    setShowEditModal(true);
  };

  const confirmUpdateLanguage = async () => {
    if (!editLanguage || !editData.name.trim()) return;
    
    setIsUpdating(true);
    try {
      await dispatch(updateLanguage({ 
        languageId: editLanguage.id, 
        name: editData.name.trim()
      })).unwrap();
      
      setShowEditModal(false);
      setEditLanguage(null);
      setEditData({ name: '' });
      toast.success('Language updated successfully!');
      handleRefresh();
    } catch (error) {
      const errorMessage = error?.message || 'Failed to update language';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading languages...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Language Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={18} /> Add Language
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Total Languages: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by language name..."
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
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVE">Deactive</option>
          </select>
          {selectedLanguages.length > 0 && (
            <button
              onClick={handleBulkStatusUpdate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Bulk Update ({selectedLanguages.length})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.length === languages.length && languages.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((language, index) => (
                <tr key={language.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(language.id)}
                      onChange={() => handleSelectLanguage(language.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">{language.name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      language.status === "ACTIVE" ? "bg-green-100 text-green-800" : 
                      "bg-red-100 text-red-800"
                    }`}>
                      {language.status}
                    </span>
                  </td>
                  <td className="p-4">{new Date(language.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(language)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(language)}
                        className="text-green-600 hover:text-green-800"
                        title="Update Status"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => handleEditLanguage(language)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Edit Language"
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} languages
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
                Page {currentPage} of {Math.ceil(total / itemsPerPage)}
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
          onClose={() => {
            setShowCreateForm(false);
            setNewLanguage({ name: '' });
          }}
          title="Add New Language"
          maxWidth="max-w-md"
          position="center"
        >
          <div className="relative">
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  <p className="mt-2 text-sm text-gray-600">Creating...</p>
                </div>
              </div>
            )}
            <form onSubmit={handleCreateLanguage} className="space-y-4">
              <div>
                <label htmlFor="languageName" className="block text-sm font-medium text-gray-700 mb-2 text-left">Language Name *</label>
                <input
                  id="languageName"
                  type="text"
                  placeholder="Language Name"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({...newLanguage, name: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal 
          isOpen={showProfile && selectedLanguage} 
          onClose={() => setShowProfile(false)}
          title="Language Details"
          maxWidth="max-w-md"
          position="center"
        >
          {selectedLanguage && (
            <div className="space-y-2 text-left">
              <p><strong>Name:</strong> {selectedLanguage.name}</p>
              <p><strong>Status:</strong> {selectedLanguage.status}</p>
              <p><strong>Created:</strong> {new Date(selectedLanguage.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(selectedLanguage.updatedAt).toLocaleDateString()}</p>
            </div>
          )}
          <button
            onClick={() => setShowProfile(false)}
            className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </Modal>

        <Modal 
          isOpen={showStatusModal && statusUpdateLanguage} 
          onClose={() => {
            setShowStatusModal(false);
            setStatusUpdateLanguage(null);
            setNewStatus('');
          }}
          title="Update Language Status"
          maxWidth="max-w-md"
          position="center"
        >
          {statusUpdateLanguage && (
            <>
              <p className="text-gray-600 mb-4">
                Update status for: <strong>{statusUpdateLanguage.name}</strong>
              </p>
              <div className="mb-4">
                <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700 mb-2 text-left">Select Status</label>
                <select
                  id="statusSelect"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DEACTIVE">Deactive</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setStatusUpdateLanguage(null);
                    setNewStatus('');
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Update Status
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>

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
            Update status for <strong>{selectedLanguages.length}</strong> selected languages
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
              <option value="ACTIVE">Active</option>
              <option value="DEACTIVE">Deactive</option>
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

      <Modal 
        isOpen={showEditModal && editLanguage} 
        onClose={() => {
          setShowEditModal(false);
          setEditLanguage(null);
          setEditData({ name: '' });
        }}
        title="Edit Language"
        maxWidth="max-w-md"
        position="center"
      >
        <div className="relative">
          {isUpdating && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-sm text-gray-600">Updating...</p>
              </div>
            </div>
          )}
          {editLanguage && (
            <>
            <div className="space-y-4">
              <div>
                <label htmlFor="editLanguageName" className="block text-sm font-medium text-gray-700 mb-2 text-left">Language Name *</label>
                <input
                  id="editLanguageName"
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                  placeholder="Enter language name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditLanguage(null);
                  setEditData({ name: '' });
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateLanguage}
                disabled={!editData.name.trim() || isUpdating}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </>
        )}
        </div>
      </Modal>
    </div>
  );
};

export default LanguageManager;
