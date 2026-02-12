import React, { useEffect, useState } from "react";
import { api } from "../config/axios";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Eye, Settings, Edit, Plus, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

const AllFaculty = () => {
  const navigate = useNavigate();
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordStaff, setPasswordStaff] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState("");
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusStaff, setStatusStaff] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    loginId: "",
    password: "",
    name: "",
    email: "",
    dob: "",
    gender: "",
    city: "",
    state: "",
    country: "",
    pin: ""
  });
  const [addFormErrors, setAddFormErrors] = useState({});

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const res = await api.get(
        `/account/stafflist?status=${statusFilter}&limit=${itemsPerPage}&offset=${offset}`
      );
      setStaffs(res.data.result || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch staff');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaffs();
  }, [statusFilter, currentPage, itemsPerPage]);

  const handleRefresh = () => {
    fetchStaffs();
    toast.success('Staff list refreshed');
  };

  const handleViewDetails = (staff) => {
    setSelectedStaff(staff);
    setShowViewModal(true);
  };

  const handleOpenPasswordModal = (staff) => {
    setPasswordStaff(staff);
    setNewPassword("");
    setPasswordErrors("");
    setShowPasswordModal(true);
  };

  const handleOpenStatusModal = (staff) => {
    setStatusStaff(staff);
    setNewStatus(staff.status === "ACTIVE" ? "DEACTIVE" : "ACTIVE");
    setShowStatusModal(true);
  };

  const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters long";
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return "Password must contain both uppercase and lowercase letters";
    if (!/\d/.test(password)) return "Password must contain at least one number";
    return "";
  };

  const confirmPasswordUpdate = async () => {
    if (!passwordStaff) return;
    const error = validatePassword(newPassword);
    if (error) {
      setPasswordErrors(error);
      return;
    }
    
    try {
      await api.patch(`/account/staff/password/${passwordStaff.id}`, { password: newPassword });
      toast.success('Password updated successfully');
      setShowPasswordModal(false);
      setPasswordStaff(null);
      setNewPassword("");
      setPasswordErrors("");
    } catch (err) {
      console.error(err);
      toast.error('Failed to update password');
    }
  };

  const confirmStatusUpdate = async () => {
    if (!statusStaff || !newStatus) return;
    try {
      await api.put(`/account/staff/status/${statusStaff.id}`, { status: newStatus });
      toast.success('Status updated successfully');
      setShowStatusModal(false);
      setStatusStaff(null);
      fetchStaffs();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const goToMenuPermissions = (accountId) => {
    navigate(`/menu-permission/${accountId}`);
  };

  const handleOpenAddModal = () => {
    setAddFormData({
      loginId: "",
      password: "",
      name: "",
      email: "",
      dob: "",
      gender: "",
      city: "",
      state: "",
      country: "",
      pin: ""
    });
    setAddFormErrors({});
    setShowAddModal(true);
  };

  const validateAddForm = () => {
    const errors = {};
    if (!addFormData.loginId.trim()) errors.loginId = "Login ID is required";
    if (!addFormData.password) errors.password = "Password is required";
    if (!addFormData.name.trim()) errors.name = "Name is required";
    return errors;
  };

  const confirmAddStaff = async () => {
    const errors = validateAddForm();
    if (Object.keys(errors).length > 0) {
      setAddFormErrors(errors);
      return;
    }
    
    try {
      await api.post('/account/add-staff', addFormData);
      toast.success('Staff added successfully');
      setShowAddModal(false);
      fetchStaffs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add staff');
    }
  };

  const filteredStaffs = staffs.filter(staff => 
    staff.staffDetail?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.staffDetail?.[0]?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && staffs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Admin & Staff Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleOpenAddModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
            >
              <Plus size={18} /> Add Staff
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>

        <p className="text-gray-600 mb-6">Total Staff: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 p-2.5 rounded-lg"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 p-2.5 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVE">Deactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Login ID</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaffs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No staff found
                  </td>
                </tr>
              ) : (
                filteredStaffs.map((staff, index) => (
                  <tr key={staff.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4">{staff.staffDetail?.[0]?.name || "N/A"}</td>
                    <td className="p-4">{staff.staffDetail?.[0]?.email || "N/A"}</td>
                    <td className="p-4">{staff.phoneNumber}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        staff.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(staff)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenStatusModal(staff)}
                          className="text-green-600 hover:text-green-800"
                          title="Update Status"
                        >
                          <Settings size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenPasswordModal(staff)}
                          className="text-orange-600 hover:text-orange-800"
                          title="Change Password"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => goToMenuPermissions(staff.id)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Menu Permissions"
                        >
                          <ShieldCheck size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} staff
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
          isOpen={showViewModal && selectedStaff} 
          onClose={() => setShowViewModal(false)}
          title="Staff Details"
          maxWidth="max-w-md"
          position="center"
        >
          {selectedStaff && (
            <div className="space-y-2 text-left">
              <p><strong>Name:</strong> {selectedStaff.staffDetail?.[0]?.name || "N/A"}</p>
              <p><strong>Email:</strong> {selectedStaff.staffDetail?.[0]?.email || "N/A"}</p>
              <p><strong>Login ID:</strong> {selectedStaff.phoneNumber}</p>
              <p><strong>Role:</strong> {selectedStaff.roles}</p>
              <p><strong>Status:</strong> {selectedStaff.status}</p>
            </div>
          )}
          <button
            onClick={() => setShowViewModal(false)}
            className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </Modal>

        <Modal 
          isOpen={showPasswordModal && passwordStaff} 
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordStaff(null);
            setNewPassword("");
            setPasswordErrors("");
          }}
          title="Change Password"
          maxWidth="max-w-md"
          position="center"
        >
          {passwordStaff && (
            <>
              <p className="text-gray-600 mb-4">
                Change password for: <strong>{passwordStaff.staffDetail?.[0]?.name}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordErrors("");
                  }}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                  placeholder="Enter new password"
                />
                {passwordErrors && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters with uppercase, lowercase, and numbers
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordStaff(null);
                    setNewPassword("");
                    setPasswordErrors("");
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPasswordUpdate}
                  disabled={!newPassword}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Update Password
                </button>
              </div>
            </>
          )}
        </Modal>

        <Modal 
          isOpen={showStatusModal && statusStaff} 
          onClose={() => {
            setShowStatusModal(false);
            setStatusStaff(null);
            setNewStatus("");
          }}
          title="Update Staff Status"
          maxWidth="max-w-md"
          position="center"
        >
          {statusStaff && (
            <>
              <p className="text-gray-600 mb-4">
                Update status for: <strong>{statusStaff.staffDetail?.[0]?.name}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Select Status</label>
                <select
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
                    setStatusStaff(null);
                    setNewStatus("");
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
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)}
          title="Add New Staff"
          maxWidth="max-w-2xl"
          position="center"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Login ID *</label>
              <input
                type="text"
                value={addFormData.loginId}
                onChange={(e) => setAddFormData({...addFormData, loginId: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
                placeholder="Enter login ID"
              />
              {addFormErrors.loginId && <p className="text-red-500 text-sm mt-1">{addFormErrors.loginId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Password *</label>
              <input
                type="password"
                value={addFormData.password}
                onChange={(e) => setAddFormData({...addFormData, password: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
                placeholder="Enter password"
              />
              {addFormErrors.password && <p className="text-red-500 text-sm mt-1">{addFormErrors.password}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Full Name *</label>
              <input
                type="text"
                value={addFormData.name}
                onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
                placeholder="Enter full name"
              />
              {addFormErrors.name && <p className="text-red-500 text-sm mt-1">{addFormErrors.name}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Email</label>
              <input
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData({...addFormData, email: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Date of Birth</label>
              <input
                type="date"
                value={addFormData.dob}
                onChange={(e) => setAddFormData({...addFormData, dob: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Gender</label>
              <select
                value={addFormData.gender}
                onChange={(e) => setAddFormData({...addFormData, gender: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">City</label>
              <input
                type="text"
                value={addFormData.city}
                onChange={(e) => setAddFormData({...addFormData, city: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">State</label>
              <input
                type="text"
                value={addFormData.state}
                onChange={(e) => setAddFormData({...addFormData, state: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
                placeholder="Enter state"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Country</label>
              <input
                type="text"
                value={addFormData.country}
                onChange={(e) => setAddFormData({...addFormData, country: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
                placeholder="Enter country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">PIN Code</label>
              <input
                type="text"
                value={addFormData.pin}
                onChange={(e) => setAddFormData({...addFormData, pin: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
                placeholder="Enter PIN code"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={confirmAddStaff}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Create Staff
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AllFaculty;
