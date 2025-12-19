import React, { useEffect, useState, useRef } from "react";
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from "react-redux";
import { Eye, RefreshCw, Download, Settings, Edit } from "lucide-react";
import { exportUsersToPDF, exportUsersToCSV } from "../utils/downloadUtils";
import { fetchUsers, updateUserStatus, bulkUpdateUserStatus, setSearch, setStatusFilter, updateUserContact } from "../store/userSlice";
import { debounce } from "lodash";
import { toast } from "react-toastify";

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DEACTIVE', label: 'Deactive' },
  { value: 'DELETED', label: 'Deleted' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'PENDING', label: 'Pending' }
];

const getStatusClass = (status) => {
  if (status === "ACTIVE") return "bg-green-100 text-green-800";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-800";
  if (status === "SUSPENDED") return "bg-orange-100 text-orange-800";
  if (status === "DELETED") return "bg-gray-100 text-gray-800";
  return "bg-red-100 text-red-800";
};

const StatusOptions = () => (
  STATUS_OPTIONS.map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  ))
);

const LoadingSpinner = ({ text }) => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
    {text}
  </div>
);

LoadingSpinner.propTypes = {
  text: PropTypes.string.isRequired,
};

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, total, loading, error, filters } = useSelector(state => state.users);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateUser, setStatusUpdateUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateUser, setUpdateUser] = useState(null);
  const [updateData, setUpdateData] = useState({ email: '', phoneNumber: '' });
  const [validationErrors, setValidationErrors] = useState({ email: '', phoneNumber: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');

  // Create debounced function with useRef to maintain stable reference
  const debouncedSearchRef = useRef(
    debounce((searchTerm) => {
      dispatch(setSearch(searchTerm));
    }, 500)
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearchRef.current(value);
  };

  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const fetchParams = { 
      limit: itemsPerPage, 
      offset,
      ...(filters.search && { keyword: filters.search }),
      ...(filters.status && { status: filters.status })
    };
    
    dispatch(fetchUsers(fetchParams));
  }, [dispatch, filters.search, filters.status, currentPage, itemsPerPage]);

  const handleStatusUpdate = (user) => {
    setStatusUpdateUser(user);
    setNewStatus(user.status);
    setShowStatusModal(true);
  };

  // Helper function to refresh users data
  const refreshUsers = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    const fetchParams = { 
      limit: itemsPerPage, 
      offset,
      ...(filters.search && { keyword: filters.search }),
      ...(filters.status && { status: filters.status })
    };
    dispatch(fetchUsers(fetchParams));
  };

  const confirmStatusUpdate = async () => {
    if (statusUpdateUser && newStatus) {
      setIsStatusUpdating(true);
      try {
        const result = await dispatch(updateUserStatus({ userId: statusUpdateUser.id, status: newStatus }));
        if (result.type.endsWith('/fulfilled')) {
          toast.success(`User status updated to ${newStatus}`);
          refreshUsers();
        } else {
          toast.error('Failed to update user status');
        }
        setShowStatusModal(false);
        setStatusUpdateUser(null);
        setNewStatus('');
      } finally {
        setIsStatusUpdating(false);
      }
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.id));
  };

  const handleBulkStatusUpdate = () => {
    if (selectedUsers.length > 0) {
      setShowBulkModal(true);
    }
  };

  const handleUpdateContact = (user) => {
    setUpdateUser(user);
    setUpdateData({ email: user.email, phoneNumber: user.phoneNumber });
    setValidationErrors({ email: '', phoneNumber: '' });
    setShowUpdateModal(true);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value.replaceAll(/[^a-zA-Z.@]/g, '');
    setUpdateData(prev => ({ ...prev, email: value }));
    if (value && !validateEmail(value)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replaceAll(/\D/g, '');
    setUpdateData(prev => ({ ...prev, phoneNumber: value }));
    if (value && value.length < 10) {
      setValidationErrors(prev => ({ ...prev, phoneNumber: 'Phone number must be at least 10 digits' }));
    } else {
      setValidationErrors(prev => ({ ...prev, phoneNumber: '' }));
    }
  };

  const confirmUpdateContact = async () => {
    if (updateUser && updateData.email.trim() && updateData.phoneNumber.trim() && 
        validateEmail(updateData.email) && !validationErrors.email && !validationErrors.phoneNumber) {
      setIsUpdating(true);
      
      try {
        const result = await dispatch(updateUserContact({ 
          id: updateUser.id, 
          email: updateData.email.trim(),
          phoneNumber: updateData.phoneNumber.trim()
        }));
        
        if (result.type.endsWith('/fulfilled')) {
          refreshUsers();
        }
        
        setShowUpdateModal(false);
        setUpdateUser(null);
        setUpdateData({ email: '', phoneNumber: '' });
        setValidationErrors({ email: '', phoneNumber: '' });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const confirmBulkStatusUpdate = async () => {
    if (selectedUsers.length > 0 && bulkStatus) {
      setIsBulkUpdating(true);
      try {
        const result = await dispatch(bulkUpdateUserStatus({ ids: selectedUsers, status: bulkStatus }));
        if (result.type.endsWith('/fulfilled')) {
          toast.success(`Successfully updated ${selectedUsers.length} users to ${bulkStatus}`);
          refreshUsers();
        } else {
          toast.error('Failed to update user status');
        }
        setShowBulkModal(false);
        setSelectedUsers([]);
        setBulkStatus('');
      } finally {
        setIsBulkUpdating(false);
      }
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfile(true);
  };

  const handleRefresh = () => {
    refreshUsers();
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading users...</p>
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className={`max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-lg ${showProfile || showStatusModal || showBulkModal || showUpdateModal ? 'blur-sm' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
          <div className="flex gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <Download size={18} /> Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  <button
                    onClick={() => {
                      exportUsersToPDF(users);
                      setShowExportMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => {
                      exportUsersToCSV(users);
                      setShowExportMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="searchUsers" className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <input
              id="searchUsers"
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full border border-gray-300 p-2.5 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              id="filterStatus"
              value={filters.status}
              onChange={(e) => dispatch(setStatusFilter(e.target.value))}
              className="border border-gray-300 p-2.5 rounded-lg"
            >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVE">Deactive</option>
            <option value="DELETED">Delete</option>
            <option value="SUSPENDED">Suspend</option>
            <option value="PENDING">Pending</option>
            </select>
          </div>
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkStatusUpdate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Bulk Update ({selectedUsers.length})
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
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Gender</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">{user.userDetail?.name || "N/A"}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phoneNumber}</td>
                  <td className="p-4">{user.userDetail?.gender || "N/A"}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(user)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(user)}
                        className="text-green-600 hover:text-green-800"
                        title="Update Status"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => handleUpdateContact(user)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Update Contact"
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} users
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
      </div>

      {/* Profile Modal */}
      {showProfile && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={() => setShowProfile(false)}>
          <div className="bg-white p-8 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">User Profile</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedUser.userDetail?.name || "N/A"}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
              <p><strong>Gender:</strong> {selectedUser.userDetail?.gender || "N/A"}</p>
              <p><strong>Status:</strong> {selectedUser.status}</p>
              <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => setShowProfile(false)}
              className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && statusUpdateUser && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={() => { setShowStatusModal(false); setStatusUpdateUser(null); setNewStatus(''); }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Update User Status</h3>
            <p className="text-gray-600 mb-4">
              Update status for: <strong>{statusUpdateUser.userDetail?.name || statusUpdateUser.email}</strong>
            </p>
            <div className="mb-4">
              <label htmlFor="selectStatus" className="block text-sm font-medium text-gray-700 mb-2">Select Status</label>
              <select
                id="selectStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
              >
                <StatusOptions />
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusUpdateUser(null);
                  setNewStatus('');
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={isStatusUpdating}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isStatusUpdating ? <LoadingSpinner text="Updating..." /> : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={() => { setShowBulkModal(false); setBulkStatus(''); }}>
          <div className="bg-white p-6 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Bulk Status Update</h3>
            <p className="text-gray-600 mb-4">
              Update status for <strong>{selectedUsers.length}</strong> selected users
            </p>
            <div className="mb-4">
              <label htmlFor="bulkStatus" className="block text-sm font-medium text-gray-700 mb-2">Select Status</label>
              <select
                id="bulkStatus"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
              >
                <option value="">Select Status</option>
                <StatusOptions />
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
                {isBulkUpdating ? <LoadingSpinner text="Updating..." /> : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Contact Modal */}
      {showUpdateModal && updateUser && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={() => { setShowUpdateModal(false); setUpdateUser(null); setUpdateData({ email: '', phoneNumber: '' }); setValidationErrors({ email: '', phoneNumber: '' }); }}>
          <div className="bg-white p-6 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Update Contact</h3>
            <p className="text-gray-600 mb-4">
              Update contact for: <strong>{updateUser.userDetail?.name || updateUser.email}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="updateEmail" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  id="updateEmail"
                  type="email"
                  value={updateData.email}
                  onChange={handleEmailChange}
                  className={`w-full border p-2.5 rounded-lg ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter email address (letters, dots, @ only)"
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="updatePhone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  id="updatePhone"
                  type="tel"
                  value={updateData.phoneNumber}
                  onChange={handlePhoneChange}
                  className={`w-full border p-2.5 rounded-lg ${validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter phone number (numbers only)"
                  required
                />
                {validationErrors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUpdateUser(null);
                  setUpdateData({ email: '', phoneNumber: '' });
                  setValidationErrors({ email: '', phoneNumber: '' });
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateContact}
                disabled={!updateData.email.trim() || !updateData.phoneNumber.trim() || validationErrors.email || validationErrors.phoneNumber || !validateEmail(updateData.email) || isUpdating}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isUpdating ? <LoadingSpinner text="Updating..." /> : 'Update Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;