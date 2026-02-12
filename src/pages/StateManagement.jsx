import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Settings, RefreshCw, Plus, Edit } from "lucide-react";
import { fetchStates, createState, updateStateStatus, updateState, bulkUpdateStateStatus, setSearch, setStatusFilter, setCountryFilter } from "../store/stateSlice";
import { fetchCountries } from "../store/countrySlice";
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

const StateManagement = () => {
  const dispatch = useDispatch();
  const { states, total, loading, error, filters } = useSelector(state => state.states);
  const { countries } = useSelector(state => state.countries);
  const [selectedState, setSelectedState] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newState, setNewState] = useState({ name: '', code: '', countryId: '' });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateState, setStatusUpdateState] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editState, setEditState] = useState(null);
  const [editData, setEditData] = useState({ name: '', code: '', countryId: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStates, setSelectedStates] = useState([]);
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
  }, [states, searchKeyword]);

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
    if (filters.countryId) {
      params.countryId = filters.countryId;
    }
    dispatch(fetchStates(params));
  }, [dispatch, currentPage, itemsPerPage, filters.search, filters.status, filters.countryId]);

  useEffect(() => {
    dispatch(fetchCountries({ limit: 100, offset: 0, status: 'ACTIVE' }));
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusUpdate = (state) => {
    setStatusUpdateState(state);
    setNewStatus(state.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (statusUpdateState && newStatus) {
      try {
        await dispatch(updateStateStatus({ stateId: statusUpdateState.id, status: newStatus })).unwrap();
        toast.success('Status updated successfully!');
        setShowStatusModal(false);
        setStatusUpdateState(null);
        setNewStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Status update failed:', error);
        toast.error('Failed to update status');
      }
    }
  };

  const handleSelectState = (stateId) => {
    setSelectedStates(prev => 
      prev.includes(stateId) 
        ? prev.filter(id => id !== stateId)
        : [...prev, stateId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStates(selectedStates.length === states.length ? [] : states.map(s => s.id));
  };

  const handleBulkStatusUpdate = () => {
    if (selectedStates.length > 0) {
      setShowBulkModal(true);
    }
  };

  const confirmBulkStatusUpdate = async () => {
    if (selectedStates.length > 0 && bulkStatus) {
      setIsBulkUpdating(true);
      try {
        await dispatch(bulkUpdateStateStatus({ ids: selectedStates, status: bulkStatus })).unwrap();
        toast.success(`${selectedStates.length} states updated successfully!`);
        setShowBulkModal(false);
        setSelectedStates([]);
        setBulkStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Bulk status update failed:', error);
        toast.error('Failed to update states status');
      } finally {
        setIsBulkUpdating(false);
      }
    }
  };

  const handleViewProfile = (state) => {
    setSelectedState(state);
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
    if (filters.countryId) {
      params.countryId = filters.countryId;
    }
    dispatch(fetchStates(params));
  };

  const handleOpenCreateModal = () => {
    setNewState({ name: '', code: '', countryId: '' });
    setShowCreateForm(true);
  };

  const handleCreateState = async (e) => {
    e.preventDefault();
    if (!newState.name.trim() || !newState.code.trim() || !newState.countryId) return;
    
    const existingState = states.find(state => 
      state.name.toLowerCase() === newState.name.trim().toLowerCase() ||
      state.code.toLowerCase() === newState.code.trim().toLowerCase()
    );
    
    if (existingState) {
      if (existingState.name.toLowerCase() === newState.name.trim().toLowerCase()) {
        toast.error('A state with this name already exists');
      } else {
        toast.error('A state with this code already exists');
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dispatch(createState(newState)).unwrap();
      toast.success('State created successfully!');
      setNewState({ name: '', code: '', countryId: '' });
      setShowCreateForm(false);
      handleRefresh();
    } catch (error) {
      console.error('State creation failed:', error);
      toast.error('Failed to create state');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditState = (state) => {
    setEditState(state);
    setEditData({ name: state.name, code: state.code, countryId: state.country?.id || state.countryId });
    setShowEditModal(true);
  };

  const confirmUpdateState = async () => {
    if (!editState || !editData.name.trim() || !editData.code.trim() || !editData.countryId) return;
    
    setIsUpdating(true);
    try {
      await dispatch(updateState({ 
        stateId: editState.id, 
        name: editData.name.trim(), 
        code: editData.code.trim().toUpperCase(),
        countryId: editData.countryId
      })).unwrap();
      
      setShowEditModal(false);
      setEditState(null);
      setEditData({ name: '', code: '', countryId: '' });
      toast.success('State updated successfully!');
      handleRefresh();
    } catch (error) {
      const errorMessage = error?.message || 'Failed to update state';
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
          <p className="mt-4 text-gray-600">Loading states...</p>
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
          <h2 className="text-3xl font-bold text-gray-800">State Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={18} /> Add State
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Total States: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by state name..."
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
          <select
            value={filters.countryId}
            onChange={(e) => dispatch(setCountryFilter(e.target.value))}
            className="border border-gray-300 p-2.5 rounded-lg"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {selectedStates.length > 0 && (
            <button
              onClick={handleBulkStatusUpdate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Bulk Update ({selectedStates.length})
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
                    checked={selectedStates.length === states.length && states.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Code</th>
                <th className="p-4 text-left">Country</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {states.map((state, index) => (
                <tr key={state.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(state.id)}
                      onChange={() => handleSelectState(state.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">{state.name}</td>
                  <td className="p-4">{state.code}</td>
                  <td className="p-4">{state.country?.name || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      state.status === "ACTIVE" ? "bg-green-100 text-green-800" : 
                      "bg-red-100 text-red-800"
                    }`}>
                      {state.status}
                    </span>
                  </td>
                  <td className="p-4">{new Date(state.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(state)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(state)}
                        className="text-green-600 hover:text-green-800"
                        title="Update Status"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => handleEditState(state)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Edit State"
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} states
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
            setNewState({ name: '', code: '', countryId: '' });
          }}
          title="Add New State"
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
            <form onSubmit={handleCreateState} className="space-y-4">
              <div>
                <label htmlFor="stateName" className="block text-sm font-medium text-gray-700 mb-2 text-left">State Name *</label>
                <input
                  id="stateName"
                  type="text"
                  placeholder="State Name"
                  value={newState.name}
                  onChange={(e) => setNewState({...newState, name: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label htmlFor="stateCode" className="block text-sm font-medium text-gray-700 mb-2 text-left">State Code *</label>
                <input
                  id="stateCode"
                  type="text"
                  placeholder="State Code"
                  value={newState.code}
                  onChange={(e) => setNewState({...newState, code: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label htmlFor="stateCountry" className="block text-sm font-medium text-gray-700 mb-2 text-left">Country *</label>
                <select
                  id="stateCountry"
                  value={newState.countryId}
                  onChange={(e) => setNewState({...newState, countryId: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
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
          isOpen={showProfile && selectedState} 
          onClose={() => setShowProfile(false)}
          title="State Details"
          maxWidth="max-w-md"
          position="center"
        >
          {selectedState && (
            <div className="space-y-2 text-left">
              <p><strong>Name:</strong> {selectedState.name}</p>
              <p><strong>Code:</strong> {selectedState.code}</p>
              <p><strong>Country:</strong> {selectedState.country?.name || 'N/A'}</p>
              <p><strong>Status:</strong> {selectedState.status}</p>
              <p><strong>Created:</strong> {new Date(selectedState.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(selectedState.updatedAt).toLocaleDateString()}</p>
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
          isOpen={showStatusModal && statusUpdateState} 
          onClose={() => {
            setShowStatusModal(false);
            setStatusUpdateState(null);
            setNewStatus('');
          }}
          title="Update State Status"
          maxWidth="max-w-md"
          position="center"
        >
          {statusUpdateState && (
            <>
              <p className="text-gray-600 mb-4">
                Update status for: <strong>{statusUpdateState.name}</strong>
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
                    setStatusUpdateState(null);
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
            Update status for <strong>{selectedStates.length}</strong> selected states
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
        isOpen={showEditModal && editState} 
        onClose={() => {
          setShowEditModal(false);
          setEditState(null);
          setEditData({ name: '', code: '', countryId: '' });
        }}
        title="Edit State"
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
          {editState && (
            <>
            <div className="space-y-4">
              <div>
                <label htmlFor="editStateName" className="block text-sm font-medium text-gray-700 mb-2 text-left">State Name *</label>
                <input
                  id="editStateName"
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                  placeholder="Enter state name"
                />
              </div>
              <div>
                <label htmlFor="editStateCode" className="block text-sm font-medium text-gray-700 mb-2 text-left">State Code *</label>
                <input
                  id="editStateCode"
                  type="text"
                  value={editData.code}
                  onChange={(e) => setEditData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                  placeholder="Enter state code"
                />
              </div>
              <div>
                <label htmlFor="editStateCountry" className="block text-sm font-medium text-gray-700 mb-2 text-left">Country *</label>
                <select
                  id="editStateCountry"
                  value={editData.countryId}
                  onChange={(e) => setEditData(prev => ({ ...prev, countryId: e.target.value }))}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditState(null);
                  setEditData({ name: '', code: '', countryId: '' });
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateState}
                disabled={!editData.name.trim() || !editData.code.trim() || !editData.countryId || isUpdating}
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

export default StateManagement;
