import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Settings, RefreshCw, Plus, Edit } from "lucide-react";
import { fetchTopics, createTopic, updateTopicStatus, updateTopic, bulkUpdateTopicStatus, setSearch, setStatusFilter } from "../store/topicSlice";
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

const TopicManager = () => {
  const dispatch = useDispatch();
  const { topics, total, loading, error, filters } = useSelector(state => state.topics);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '' });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateTopic, setStatusUpdateTopic] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [editData, setEditData] = useState({ name: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
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
  }, [topics, searchKeyword]);

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
    dispatch(fetchTopics(params));
  }, [dispatch, currentPage, itemsPerPage, filters.search, filters.status]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusUpdate = (topic) => {
    setStatusUpdateTopic(topic);
    setNewStatus(topic.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (statusUpdateTopic && newStatus) {
      try {
        await dispatch(updateTopicStatus({ topicId: statusUpdateTopic.id, status: newStatus })).unwrap();
        toast.success('Status updated successfully!');
        setShowStatusModal(false);
        setStatusUpdateTopic(null);
        setNewStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Status update failed:', error);
        toast.error('Failed to update status');
      }
    }
  };

  const handleSelectTopic = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTopics(selectedTopics.length === topics.length ? [] : topics.map(t => t.id));
  };

  const handleBulkStatusUpdate = () => {
    if (selectedTopics.length > 0) {
      setShowBulkModal(true);
    }
  };

  const confirmBulkStatusUpdate = async () => {
    if (selectedTopics.length > 0 && bulkStatus) {
      setIsBulkUpdating(true);
      try {
        await dispatch(bulkUpdateTopicStatus({ ids: selectedTopics, status: bulkStatus })).unwrap();
        toast.success(`${selectedTopics.length} topics updated successfully!`);
        setShowBulkModal(false);
        setSelectedTopics([]);
        setBulkStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Bulk status update failed:', error);
        toast.error('Failed to update topics status');
      } finally {
        setIsBulkUpdating(false);
      }
    }
  };

  const handleViewProfile = (topic) => {
    setSelectedTopic(topic);
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
    dispatch(fetchTopics(params));
  };

  const handleOpenCreateModal = () => {
    setNewTopic({ name: '' });
    setShowCreateForm(true);
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.name.trim()) return;
    
    const existingTopic = topics.find(topic => 
      topic.name.toLowerCase() === newTopic.name.trim().toLowerCase()
    );
    
    if (existingTopic) {
      toast.error('A topic with this name already exists');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dispatch(createTopic(newTopic)).unwrap();
      toast.success('Topic created successfully!');
      setNewTopic({ name: '' });
      setShowCreateForm(false);
      handleRefresh();
    } catch (error) {
      console.error('Topic creation failed:', error);
      toast.error('Failed to create topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTopic = (topic) => {
    setEditTopic(topic);
    setEditData({ name: topic.name });
    setShowEditModal(true);
  };

  const confirmUpdateTopic = async () => {
    if (!editTopic || !editData.name.trim()) return;
    
    setIsUpdating(true);
    try {
      await dispatch(updateTopic({ 
        topicId: editTopic.id, 
        name: editData.name.trim()
      })).unwrap();
      
      setShowEditModal(false);
      setEditTopic(null);
      setEditData({ name: '' });
      toast.success('Topic updated successfully!');
    } catch (error) {
      const errorMessage = error?.message || 'Failed to update topic';
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
          <p className="mt-4 text-gray-600">Loading topics...</p>
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
          <h2 className="text-3xl font-bold text-gray-800">Topic Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={18} /> Add Topic
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Total Topics: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by topic name..."
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
          {selectedTopics.length > 0 && (
            <button
              onClick={handleBulkStatusUpdate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Bulk Update ({selectedTopics.length})
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
                    checked={selectedTopics.length === topics.length && topics.length > 0}
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
              {topics.map((topic, index) => (
                <tr key={topic.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={() => handleSelectTopic(topic.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">{topic.name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      topic.status === "ACTIVE" ? "bg-green-100 text-green-800" : 
                      "bg-red-100 text-red-800"
                    }`}>
                      {topic.status}
                    </span>
                  </td>
                  <td className="p-4">{new Date(topic.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(topic)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(topic)}
                        className="text-green-600 hover:text-green-800"
                        title="Update Status"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => handleEditTopic(topic)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Edit Topic"
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} topics
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
            setNewTopic({ name: '' });
          }}
          title="Add New Topic"
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
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label htmlFor="topicName" className="block text-sm font-medium text-gray-700 mb-2 text-left">Topic Name *</label>
                <input
                  id="topicName"
                  type="text"
                  placeholder="Topic Name"
                  value={newTopic.name}
                  onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
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
          isOpen={showProfile && selectedTopic} 
          onClose={() => setShowProfile(false)}
          title="Topic Details"
          maxWidth="max-w-md"
          position="center"
        >
          {selectedTopic && (
            <div className="space-y-2 text-left">
              <p><strong>Name:</strong> {selectedTopic.name}</p>
              <p><strong>Status:</strong> {selectedTopic.status}</p>
              <p><strong>Created:</strong> {new Date(selectedTopic.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(selectedTopic.updatedAt).toLocaleDateString()}</p>
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
          isOpen={showStatusModal && statusUpdateTopic} 
          onClose={() => {
            setShowStatusModal(false);
            setStatusUpdateTopic(null);
            setNewStatus('');
          }}
          title="Update Topic Status"
          maxWidth="max-w-md"
          position="center"
        >
          {statusUpdateTopic && (
            <>
              <p className="text-gray-600 mb-4">
                Update status for: <strong>{statusUpdateTopic.name}</strong>
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
                    setStatusUpdateTopic(null);
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
            Update status for <strong>{selectedTopics.length}</strong> selected topics
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
        isOpen={showEditModal && editTopic} 
        onClose={() => {
          setShowEditModal(false);
          setEditTopic(null);
          setEditData({ name: '' });
        }}
        title="Edit Topic"
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
          {editTopic && (
            <>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editTopicName" className="block text-sm font-medium text-gray-700 mb-2 text-left">Topic Name *</label>
                  <input
                    id="editTopicName"
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 p-2.5 rounded-lg"
                    placeholder="Enter topic name"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditTopic(null);
                    setEditData({ name: '' });
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpdateTopic}
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

export default TopicManager;








// 15. 3Sum
// Medium
// Topics
// premium lock icon
// Companies
// Hint
// Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

// Notice that the solution set must not contain duplicate triplets.

 

// Example 1:

// Input: nums = [-1,0,1,2,-1,-4]
// Output: [[-1,-1,2],[-1,0,1]]
// Explanation: 
// nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
// nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
// nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.
// The distinct triplets are [-1,0,1] and [-1,-1,2].
// Notice that the order of the output and the order of the triplets does not matter.
// Example 2:

// Input: nums = [0,1,1]
// Output: []
// Explanation: The only possible triplet does not sum up to 0.
// Example 3:

// Input: nums = [0,0,0]
// Output: [[0,0,0]]
// Explanation: The only possible triplet sums up to 0.
 

// Constraints:

// 3 <= nums.length <= 3000
// -105 <= nums[i] <= 105

