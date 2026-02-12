import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Settings, RefreshCw, Plus, Upload, Edit } from "lucide-react";
import { fetchBanners, createBanner, updateBannerStatus, updateBanner, uploadBannerImage, bulkUpdateBannerStatus, setSearch, setStatusFilter, setBannerTypeFilter } from "../store/bannerSlice";
import { validateImageFile } from '../utils/fileValidation';
import { normalizeImageUrl } from '../utils/imageUtils';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

const BannerType = {
  TUTOR_APP: 'TUTOR_APP',
  USER_APP: 'USER_APP',
  USER_WEBSITE: 'USER_WEBSITE',
  TUTOR_WEBSITE: 'TUTOR_WEBSITE',
};

const BannerManagement = () => {
  const dispatch = useDispatch();
  const { banners, total, loading, error, filters } = useSelector(state => state.banners);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBanner, setNewBanner] = useState({ file: null, bannerType: 'TUTOR_APP' });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateBanner, setStatusUpdateBanner] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedBannerForImage, setSelectedBannerForImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const createFileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [editData, setEditData] = useState({ bannerType: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [createImagePreview, setCreateImagePreview] = useState(null);

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
  }, [banners, searchKeyword]);

  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage, 
      offset, 
      keyword: filters.search
    };
    if (filters.status) params.status = filters.status;
    if (filters.bannerType) params.bannerType = filters.bannerType;
    dispatch(fetchBanners(params));
  }, [dispatch, currentPage, itemsPerPage, filters.search, filters.status, filters.bannerType]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusUpdate = (banner) => {
    setStatusUpdateBanner(banner);
    setNewStatus(banner.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (statusUpdateBanner && newStatus) {
      try {
        await dispatch(updateBannerStatus({ bannerId: statusUpdateBanner.id, status: newStatus })).unwrap();
        toast.success('Status updated successfully!');
        setShowStatusModal(false);
        setStatusUpdateBanner(null);
        setNewStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Status update failed:', error);
        const errorMessage = error?.message || error || 'Failed to update status';
        toast.error(errorMessage);
      }
    }
  };

  const handleViewProfile = (banner) => {
    setSelectedBanner(banner);
    setShowProfile(true);
  };

  const handleRefresh = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage,
      offset,
      keyword: filters.search
    };
    if (filters.status) params.status = filters.status;
    if (filters.bannerType) params.bannerType = filters.bannerType;
    dispatch(fetchBanners(params));
  };

  const handleOpenCreateModal = () => {
    setNewBanner({ file: null, bannerType: 'TUTOR_APP' });
    setCreateImagePreview(null);
    setShowCreateForm(true);
  };

  const handleCreateFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validation = validateImageFile(file, 5);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    
    setNewBanner(prev => ({ ...prev, file }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCreateImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!newBanner.file || !newBanner.bannerType) {
      toast.error('Please select an image and banner type');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dispatch(createBanner(newBanner)).unwrap();
      toast.success('Banner created successfully!');
      setNewBanner({ file: null, bannerType: 'TUTOR_APP' });
      setCreateImagePreview(null);
      setShowCreateForm(false);
      if (createFileInputRef.current) {
        createFileInputRef.current.value = '';
      }
      handleRefresh();
    } catch (error) {
      console.error('Banner creation failed:', error);
      toast.error('Failed to create banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (banner) => {
    setSelectedBannerForImage(banner);
    setShowImageUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validation = validateImageFile(file, 5);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    
    setSelectedImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadBannerImageHandler = async () => {
    if (!selectedImageFile || !selectedBannerForImage) return;
    setIsUploading(true);
    
    try {
      await dispatch(uploadBannerImage({ 
        bannerId: selectedBannerForImage.id, 
        file: selectedImageFile 
      })).unwrap();
      
      setShowImageUploadModal(false);
      setSelectedBannerForImage(null);
      setSelectedImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Image updated successfully!');
      handleRefresh();
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditBanner = (banner) => {
    setEditBanner(banner);
    setEditData({ bannerType: banner.bannerType });
    setShowEditModal(true);
  };

  const confirmUpdateBanner = async () => {
    if (!editBanner || !editData.bannerType) return;
    
    setIsUpdating(true);
    try {
      await dispatch(updateBanner({ 
        bannerId: editBanner.id, 
        bannerType: editData.bannerType
      })).unwrap();
      
      setShowEditModal(false);
      setEditBanner(null);
      setEditData({ bannerType: '' });
      toast.success('Banner updated successfully!');
      handleRefresh();
    // } catch (error) {
    //   const errorMessage = error?.message || 'Failed to update banner';
    //   toast.error(errorMessage);
    }catch(error){
    console.error('Status update failed:', error);
        const errorMessage = error?.message || error || 'Failed to update status';
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
          <p className="mt-4 text-gray-600">Loading banners...</p>
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
          <h2 className="text-3xl font-bold text-gray-800">Banner Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={18} /> Add Banner
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Total Banners: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search banners..."
            value={searchKeyword}
            onChange={handleKeywordChange}
            className="flex-1 border border-gray-300 p-2.5 rounded-lg"
          />
          <select
            value={filters.bannerType}
            onChange={(e) => dispatch(setBannerTypeFilter(e.target.value))}
            className="border border-gray-300 p-2.5 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="TUTOR_APP">Tutor App</option>
            <option value="USER_APP">User App</option>
            <option value="USER_WEBSITE">User Website</option>
            <option value="TUTOR_WEBSITE">Tutor Website</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            className="border border-gray-300 p-2.5 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVE">Deactive</option>
          </select>
          
        </div>


        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Banner Type</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner, index) => (
                <tr key={banner.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4">
                    {banner.image ? (
                      <img 
                        src={normalizeImageUrl(banner.image)} 
                        alt="Banner" 
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">{banner.bannerType}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      banner.status === "ACTIVE" ? "bg-green-100 text-green-800" : 
                      "bg-red-100 text-red-800"
                    }`}>
                      {banner.status}
                    </span>
                  </td>
                  <td className="p-4">{new Date(banner.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(banner)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(banner)}
                        className="text-green-600 hover:text-green-800"
                        title="Update Status"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => handleEditBanner(banner)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Edit Banner"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleImageUpload(banner)}
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} banners
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
            setNewBanner({ file: null, bannerType: 'TUTOR_APP' });
            setCreateImagePreview(null);
            if (createFileInputRef.current) {
              createFileInputRef.current.value = '';
            }
          }}
          title="Add New Banner"
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
            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div>
                <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 mb-2 text-left">Banner Image *</label>
                <input
                  id="bannerImage"
                  type="file"
                  onChange={handleCreateFileSelect}
                  accept="image/*"
                  ref={createFileInputRef}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                {createImagePreview && (
                  <img src={createImagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />
                )}
              </div>
              <div>
                <label htmlFor="bannerType" className="block text-sm font-medium text-gray-700 mb-2 text-left">Banner Type *</label>
                <select
                  id="bannerType"
                  value={newBanner.bannerType}
                  onChange={(e) => setNewBanner({...newBanner, bannerType: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  required
                >
                  <option value="TUTOR_APP">Tutor App</option>
                  <option value="USER_APP">User App</option>
                  <option value="USER_WEBSITE">User Website</option>
                  <option value="TUTOR_WEBSITE">Tutor Website</option>
                </select>
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
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewBanner({ file: null, bannerType: 'TUTOR_APP' });
                    setCreateImagePreview(null);
                    if (createFileInputRef.current) {
                      createFileInputRef.current.value = '';
                    }
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>


        <Modal 
          isOpen={showProfile && selectedBanner} 
          onClose={() => setShowProfile(false)}
          title="Banner Details"
          maxWidth="max-w-md"
          position="center"
        >
          {selectedBanner && (
            <div className="space-y-2 text-left">
              <p><strong>Banner Type:</strong> {selectedBanner.bannerType}</p>
              <p><strong>Status:</strong> {selectedBanner.status}</p>
              <p><strong>Created:</strong> {new Date(selectedBanner.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(selectedBanner.updatedAt).toLocaleDateString()}</p>
              {selectedBanner.image && (
                <div>
                  <strong>Image:</strong>
                  <img 
                    src={normalizeImageUrl(selectedBanner.image)} 
                    alt="Banner" 
                    className="w-full h-48 object-cover rounded-lg mt-2"
                  />
                </div>
              )}
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
          isOpen={showImageUploadModal && selectedBannerForImage} 
          onClose={() => {
            setShowImageUploadModal(false);
            setSelectedBannerForImage(null);
            setSelectedImageFile(null);
            setImagePreview(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          title="Upload Banner Image"
          maxWidth="max-w-md"
          position="center"
        >
          {selectedBannerForImage && (
            <>
              <p className="text-gray-600 mb-4 text-left">
                Upload image for: <strong>{selectedBannerForImage.bannerType}</strong>
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
                    setSelectedBannerForImage(null);
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
                  onClick={uploadBannerImageHandler}
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


        <Modal 
          isOpen={showStatusModal && statusUpdateBanner} 
          onClose={() => {
            setShowStatusModal(false);
            setStatusUpdateBanner(null);
            setNewStatus('');
          }}
          title="Update Banner Status"
          maxWidth="max-w-md"
          position="center"
        >
          {statusUpdateBanner && (
            <>
              <p className="text-gray-600 mb-4">
                Update status for: <strong>{statusUpdateBanner.bannerType}</strong>
              </p>
              <div className="mb-4">
                <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700 mb-2 text-left">Select Status</label>
                <select
                  id="statusSelect"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DEACTIVE">Deactive</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setStatusUpdateBanner(null);
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

        <Modal 
          isOpen={showEditModal && editBanner} 
          onClose={() => {
            setShowEditModal(false);
            setEditBanner(null);
            setEditData({ bannerType: '' });
          }}
          title="Edit Banner"
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
            {editBanner && (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="editBannerType" className="block text-sm font-medium text-gray-700 mb-2 text-left">Banner Type *</label>
                    <select
                      id="editBannerType"
                      value={editData.bannerType}
                      onChange={(e) => setEditData({ bannerType: e.target.value })}
                      className="w-full border border-gray-300 p-2.5 rounded-lg"
                    >
                      <option value="TUTOR_APP">Tutor App</option>
                      <option value="USER_APP">User App</option>
                      <option value="USER_WEBSITE">User Website</option>
                      <option value="TUTOR_WEBSITE">Tutor Website</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditBanner(null);
                      setEditData({ bannerType: '' });
                    }}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUpdateBanner}
                    disabled={!editData.bannerType || isUpdating}
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
    </div>
  );
};

export default BannerManagement;
