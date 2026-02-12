import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Settings, RefreshCw, Plus, Edit, Upload } from "lucide-react";
import { fetchSubjects, createSubject, updateSubjectStatus, updateSubject, bulkUpdateSubjectStatus, setSearch, setStatusFilter } from "../store/subjectSlice";
import { validateImageFile } from '../utils/fileValidation';
import { normalizeImageUrl } from '../utils/imageUtils';
import { api } from '../config/axios';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

const SubjectNew = () => {
  const dispatch = useDispatch();
  const { subjects, total, loading, error, filters } = useSelector(state => state.subjectsManagement);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '' });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateSubject, setStatusUpdateSubject] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [editData, setEditData] = useState({ name: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedSubjectForImage, setSelectedSubjectForImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

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
  }, [subjects, searchKeyword]);

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
    dispatch(fetchSubjects(params));
  }, [dispatch, currentPage, itemsPerPage, filters.search, filters.status]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusUpdate = (subject) => {
    setStatusUpdateSubject(subject);
    setNewStatus(subject.status);
    setShowStatusModal(true);
  };

const confirmStatusUpdate = async () => {
  if (statusUpdateSubject && newStatus) {
    try {
      await dispatch(updateSubjectStatus({
        subjectId: statusUpdateSubject.id,
        status: newStatus
      })).unwrap();

      toast.success('Status updated successfully!');
      setShowStatusModal(false);
      setStatusUpdateSubject(null);
      setNewStatus('');
      handleRefresh();

    } catch (error) {
      console.error('Status update failed:', error);
      toast.error('Failed to update status');
    }
  }
};


  const handleSelectSubject = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSubjects(selectedSubjects.length === subjects.length ? [] : subjects.map(s => s.id));
  };

  const handleBulkStatusUpdate = () => {
    if (selectedSubjects.length > 0) {
      setShowBulkModal(true);
    }
  };

  const confirmBulkStatusUpdate = async () => {
    if (selectedSubjects.length > 0 && bulkStatus) {
      setIsBulkUpdating(true);
      try {
        await dispatch(bulkUpdateSubjectStatus({ ids: selectedSubjects, status: bulkStatus })).unwrap();
        toast.success(`${selectedSubjects.length} subjects updated successfully!`);
        setShowBulkModal(false);
        setSelectedSubjects([]);
        setBulkStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Bulk status update failed:', error);
        toast.error('Failed to update subjects status');
      } finally {
        setIsBulkUpdating(false);
      }
    }
  };

  const handleViewProfile = (subject) => {
    setSelectedSubject(subject);
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
    dispatch(fetchSubjects(params));
  };

  const handleOpenCreateModal = () => {
    setNewSubject({ name: '' });
    setShowCreateForm(true);
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;
    
    const existingSubject = subjects.find(subject => 
      subject.name.toLowerCase() === newSubject.name.trim().toLowerCase()
    );
    
    if (existingSubject) {
      toast.error('A subject with this name already exists');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dispatch(createSubject(newSubject)).unwrap();
      toast.success('Subject created successfully!');
      setNewSubject({ name: '' });
      setShowCreateForm(false);
      handleRefresh();
    } catch (error) {
      console.error('Subject creation failed:', error);
      toast.error('Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubject = (subject) => {
    setEditSubject(subject);
    setEditData({ name: subject.name });
    setShowEditModal(true);
  };

  const confirmUpdateSubject = async () => {
    if (!editSubject || !editData.name.trim()) return;
    
    setIsUpdating(true);
    try {
      await dispatch(updateSubject({ 
        subjectId: editSubject.id, 
        name: editData.name.trim()
      })).unwrap();
      
      setShowEditModal(false);
      setEditSubject(null);
      setEditData({ name: '' });
      toast.success('Subject updated successfully!');
      handleRefresh();
    } catch (error) {
      const errorMessage = error?.message || 'Failed to update subject';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = (subject) => {
    setSelectedSubjectForImage(subject);
    setShowImageUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validation = validateImageFile(file, 5);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }
    
    setSelectedImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadSubjectImage = async () => {
    if (!selectedImageFile || !selectedSubjectForImage) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', selectedImageFile);
    
    try {
      await api.put(`/subjects/update/${selectedSubjectForImage.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      handleRefresh();
      
      setShowImageUploadModal(false);
      setSelectedSubjectForImage(null);
      setSelectedImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Image updated successfully!');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading subjects...</p>
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
          <h2 className="text-3xl font-bold text-gray-800">Subject Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={18} /> Add Subject
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Total Subjects: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by subject name..."
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
          {selectedSubjects.length > 0 && (
            <button
              onClick={handleBulkStatusUpdate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Bulk Update ({selectedSubjects.length})
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
                    checked={selectedSubjects.length === subjects.length && subjects.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={subject.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={() => handleSelectSubject(subject.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">{subject.name}</td>
                  <td className="p-4">
                    {subject.image ? (
                      <img 
                        src={normalizeImageUrl(subject.image)} 
                        alt={subject.name} 
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
                      subject.status === "ACTIVE" ? "bg-green-100 text-green-800" : 
                      "bg-red-100 text-red-800"
                    }`}>
                      {subject.status}
                    </span>
                  </td>
                  <td className="p-4">{new Date(subject.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(subject)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(subject)}
                        className="text-green-600 hover:text-green-800"
                        title="Update Status"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => handleEditSubject(subject)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Edit Subject"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleImageUpload(subject)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Upload Image"
                      >
                        <Upload size={18} />
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} subjects
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
            setNewSubject({ name: '' });
          }}
          title="Add New Subject"
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
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-2 text-left">Subject Name *</label>
                <input
                  id="subjectName"
                  type="text"
                  placeholder="Subject Name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
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
          isOpen={showProfile && selectedSubject} 
          onClose={() => setShowProfile(false)}
          title="Subject Details"
          maxWidth="max-w-md"
          position="center"
        >
          {selectedSubject && (
            <div className="space-y-2 text-left">
              <p><strong>Name:</strong> {selectedSubject.name}</p>
              <p><strong>Status:</strong> {selectedSubject.status}</p>
              <p><strong>Created:</strong> {new Date(selectedSubject.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(selectedSubject.updatedAt).toLocaleDateString()}</p>
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
          isOpen={showStatusModal && statusUpdateSubject} 
          onClose={() => {
            setShowStatusModal(false);
            setStatusUpdateSubject(null);
            setNewStatus('');
          }}
          title="Update Subject Status"
          maxWidth="max-w-md"
          position="center"
        >
          {statusUpdateSubject && (
            <>
              <p className="text-gray-600 mb-4">
                Update status for: <strong>{statusUpdateSubject.name}</strong>
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
                    setStatusUpdateSubject(null);
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
            Update status for <strong>{selectedSubjects.length}</strong> selected subjects
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
        isOpen={showEditModal && editSubject} 
        onClose={() => {
          setShowEditModal(false);
          setEditSubject(null);
          setEditData({ name: '' });
        }}
        title="Edit Subject"
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
          {editSubject && (
            <>
            <div className="space-y-4">
              <div>
                <label htmlFor="editSubjectName" className="block text-sm font-medium text-gray-700 mb-2 text-left">Subject Name *</label>
                <input
                  id="editSubjectName"
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                  placeholder="Enter subject name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditSubject(null);
                  setEditData({ name: '' });
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateSubject}
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

      <Modal 
        isOpen={showImageUploadModal && selectedSubjectForImage} 
        onClose={() => {
          setShowImageUploadModal(false);
          setSelectedSubjectForImage(null);
          setSelectedImageFile(null);
          setImagePreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        title="Upload Subject Image"
        maxWidth="max-w-md"
        position="center"
      >
        {selectedSubjectForImage && (
          <>
            <p className="text-gray-600 mb-4 text-left">
              Upload image for: <strong>{selectedSubjectForImage.name}</strong>
            </p>
            <div className="mb-4">
              <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-2 text-left">Select Image</label>
              <input 
                id="imageUpload"
                type="file" 
                onChange={handleFileSelect}
                accept="image/*"
                ref={fileInputRef}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowImageUploadModal(false);
                  setSelectedSubjectForImage(null);
                  setSelectedImageFile(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={uploadSubjectImage}
                className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
                disabled={!selectedImageFile || isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </div>
                ) : 'Upload Image'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
    
export default SubjectNew;
