import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Settings, RefreshCw, Plus, Edit } from "lucide-react";
import { fetchQualifications, createQualification, updateQualificationStatus, updateQualification, bulkUpdateQualificationStatus, setSearch, setStatusFilter } from "../store/qualificationSlice";
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

const EducationalLevelManager = () => {
  const dispatch = useDispatch();
  const { qualifications, total, loading, error, filters } = useSelector(state => state.qualifications);
  const [selectedQualification, setSelectedQualification] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQualification, setNewQualification] = useState({ name: '' });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateQualification, setStatusUpdateQualification] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQualification, setEditQualification] = useState(null);
  const [editData, setEditData] = useState({ name: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
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
  }, [qualifications, searchKeyword]);

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
    dispatch(fetchQualifications(params));
  }, [dispatch, currentPage, itemsPerPage, filters.search, filters.status]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusUpdate = (qualification) => {
    setStatusUpdateQualification(qualification);
    setNewStatus(qualification.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (statusUpdateQualification && newStatus) {
      try {
        await dispatch(updateQualificationStatus({ qualificationId: statusUpdateQualification.id, status: newStatus })).unwrap();
        toast.success('Status updated successfully!');
        setShowStatusModal(false);
        setStatusUpdateQualification(null);
        setNewStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Status update failed:', error);
        toast.error('Failed to update status');
      }
    }
  };

  const handleSelectQualification = (qualificationId) => {
    setSelectedQualifications(prev => 
      prev.includes(qualificationId) 
        ? prev.filter(id => id !== qualificationId)
        : [...prev, qualificationId]
    );
  };

  const handleSelectAll = () => {
    setSelectedQualifications(selectedQualifications.length === qualifications.length ? [] : qualifications.map(q => q.id));
  };

  const handleBulkStatusUpdate = () => {
    if (selectedQualifications.length > 0) {
      setShowBulkModal(true);
    }
  };

  const confirmBulkStatusUpdate = async () => {
    if (selectedQualifications.length > 0 && bulkStatus) {
      setIsBulkUpdating(true);
      try {
        await dispatch(bulkUpdateQualificationStatus({ ids: selectedQualifications, status: bulkStatus })).unwrap();
        toast.success(`${selectedQualifications.length} educational levels updated successfully!`);
        setShowBulkModal(false);
        setSelectedQualifications([]);
        setBulkStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Bulk status update failed:', error);
        toast.error('Failed to update educational levels status');
      } finally {
        setIsBulkUpdating(false);
      }
    }
  };

  const handleViewProfile = (qualification) => {
    setSelectedQualification(qualification);
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
    dispatch(fetchQualifications(params));
  };

  const handleOpenCreateModal = () => {
    setNewQualification({ name: '' });
    setShowCreateForm(true);
  };

  const handleCreateQualification = async (e) => {
    e.preventDefault();
    if (!newQualification.name.trim()) return;
    
    const existingQualification = qualifications.find(qualification => 
      qualification.name.toLowerCase() === newQualification.name.trim().toLowerCase()
    );
    
    if (existingQualification) {
      toast.error('An educational level with this name already exists');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dispatch(createQualification(newQualification)).unwrap();
      toast.success('Educational level created successfully!');
      setNewQualification({ name: '' });
      setShowCreateForm(false);
      handleRefresh();
    } catch (error) {
      console.error('Educational level creation failed:', error);
      toast.error('Failed to create educational level');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQualification = (qualification) => {
    setEditQualification(qualification);
    setEditData({ name: qualification.name });
    setShowEditModal(true);
  };

  const confirmUpdateQualification = async () => {
    if (!editQualification || !editData.name.trim()) return;
    
    setIsUpdating(true);
    try {
      await dispatch(updateQualification({ 
        qualificationId: editQualification.id, 
        name: editData.name.trim()
      })).unwrap();
      
      setShowEditModal(false);
      setEditQualification(null);
      setEditData({ name: '' });
      toast.success('Educational level updated successfully!');
      handleRefresh();
    } catch (error) {
      const errorMessage = error?.message || 'Failed to update educational level';
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
          <p className="mt-4 text-gray-600">Loading educational levels...</p>
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
          <h2 className="text-3xl font-bold text-gray-800">Educational Level Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={18} /> Add Educational Level
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Total Educational Levels: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by educational level name..."
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
          {selectedQualifications.length > 0 && (
            <button
              onClick={handleBulkStatusUpdate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Bulk Update ({selectedQualifications.length})
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
                    checked={selectedQualifications.length === qualifications.length && qualifications.length > 0}
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
              {qualifications.map((qualification, index) => (
                <tr key={qualification.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedQualifications.includes(qualification.id)}
                      onChange={() => handleSelectQualification(qualification.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">{qualification.name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      qualification.status === "ACTIVE" ? "bg-green-100 text-green-800" : 
                      "bg-red-100 text-red-800"
                    }`}>
                      {qualification.status}
                    </span>
                  </td>
                  <td className="p-4">{qualification.createdAt ? new Date(qualification.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(qualification)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(qualification)}
                        className="text-green-600 hover:text-green-800"
                        title="Update Status"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => handleEditQualification(qualification)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Edit Educational Level"
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} educational levels
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
            setNewQualification({ name: '' });
          }}
          title="Add New Educational Level"
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
            <form onSubmit={handleCreateQualification} className="space-y-4">
              <div>
                <label htmlFor="qualificationName" className="block text-sm font-medium text-gray-700 mb-2 text-left">Educational Level Name *</label>
                <input
                  id="qualificationName"
                  type="text"
                  placeholder="Educational Level Name (e.g., B.Tech, M.Tech, PhD)"
                  value={newQualification.name}
                  onChange={(e) => setNewQualification({...newQualification, name: e.target.value})}
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
          isOpen={showProfile && selectedQualification} 
          onClose={() => setShowProfile(false)}
          title="Educational Level Details"
          maxWidth="max-w-md"
          position="center"
        >
          {selectedQualification && (
            <div className="space-y-2 text-left">
              <p><strong>Name:</strong> {selectedQualification.name}</p>
              <p><strong>Status:</strong> {selectedQualification.status}</p>
              <p><strong>Created:</strong> {selectedQualification.createdAt ? new Date(selectedQualification.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Updated:</strong> {selectedQualification.updatedAt ? new Date(selectedQualification.updatedAt).toLocaleDateString() : 'N/A'}</p>
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
          isOpen={showStatusModal && statusUpdateQualification} 
          onClose={() => {
            setShowStatusModal(false);
            setStatusUpdateQualification(null);
            setNewStatus('');
          }}
          title="Update Educational Level Status"
          maxWidth="max-w-md"
          position="center"
        >
          {statusUpdateQualification && (
            <>
              <p className="text-gray-600 mb-4">
                Update status for: <strong>{statusUpdateQualification.name}</strong>
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
                    setStatusUpdateQualification(null);
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
            Update status for <strong>{selectedQualifications.length}</strong> selected educational levels
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
        isOpen={showEditModal && editQualification} 
        onClose={() => {
          setShowEditModal(false);
          setEditQualification(null);
          setEditData({ name: '' });
        }}
        title="Edit Educational Level"
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
          {editQualification && (
            <>
            <div className="space-y-4">
              <div>
                <label htmlFor="editQualificationName" className="block text-sm font-medium text-gray-700 mb-2 text-left">Educational Level Name *</label>
                <input
                  id="editQualificationName"
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                  placeholder="Enter educational level name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditQualification(null);
                  setEditData({ name: '' });
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateQualification}
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

export default EducationalLevelManager;
