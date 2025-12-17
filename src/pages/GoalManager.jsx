import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Settings, Edit, Trash2, Plus } from 'lucide-react';
import {
  createGoal,
  getAllGoals,
  updateGoal,
  updateGoalStatus,
  deleteGoal,
  clearError
} from '../store/goalSlice';

const StatusOptions = () => (
  <>
    <option value="ACTIVE">Active</option>
    <option value="DEACTIVE">Deactive</option>
    <option value="DELETED">Deleted</option>
    <option value="SUSPENDED">Suspended</option>
    <option value="PENDING">Pending</option>
  </>
);

const GoalManager = () => {
  const dispatch = useDispatch();
  const { goals, loading, error } = useSelector(state => state.goals);
  
  const [formData, setFormData] = useState({ name: '', status: 'ACTIVE' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateGoal, setStatusUpdateGoal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteGoalId, setDeleteGoalId] = useState(null);

  useEffect(() => {
    dispatch(getAllGoals());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await dispatch(updateGoal({ goalId: editingId, goalData: formData })).unwrap();
        setEditingId(null);
      } else {
        await dispatch(createGoal(formData)).unwrap();
      }
      setFormData({ name: '', status: 'ACTIVE' });
      setShowForm(false);
      dispatch(getAllGoals());
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = (goal) => {
    setFormData({ name: goal.name || '', status: goal.status || 'ACTIVE' });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleStatusUpdate = (goal) => {
    setStatusUpdateGoal(goal);
    setNewStatus(goal.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (statusUpdateGoal && newStatus) {
      try {
        await dispatch(updateGoalStatus({ goalId: statusUpdateGoal.id, status: newStatus })).unwrap();
        setShowStatusModal(false);
        setStatusUpdateGoal(null);
        setNewStatus('');
        dispatch(getAllGoals());
      } catch (err) {
        console.error('Error updating status:', err);
      }
    }
  };

  const handleDelete = (goalId) => {
    setDeleteGoalId(goalId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteGoalId) {
      try {
        await dispatch(deleteGoal(deleteGoalId)).unwrap();
        setShowDeleteModal(false);
        setDeleteGoalId(null);
        dispatch(getAllGoals());
      } catch (err) {
        console.error('Error deleting goal:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', status: 'ACTIVE' });
    setEditingId(null);
    setShowForm(false);
    dispatch(clearError());
  };

  const handleRefresh = () => {
    dispatch(getAllGoals());
  };

  if (loading && goals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {typeof error === 'string' ? error : error.message || 'An error occurred'}</p>
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
      <div className={`max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-lg ${showForm || showStatusModal || showDeleteModal ? 'blur-sm' : ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Goal Management</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={18} /> Add Goal
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Total Goals: {goals.length}</p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 sm:p-4 text-left text-sm sm:text-base">Name</th>
                <th className="p-2 sm:p-4 text-left text-sm sm:text-base">Status</th>
                <th className="p-2 sm:p-4 text-left text-sm sm:text-base hidden sm:table-cell">Created At</th>
                <th className="p-2 sm:p-4 text-left text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal, index) => (
                <tr key={goal.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-2 sm:p-4 text-sm sm:text-base font-medium">{goal.name}</td>
                  <td className="p-2 sm:p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      goal.status === "ACTIVE" ? "bg-green-100 text-green-800" : 
                      goal.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      goal.status === "SUSPENDED" ? "bg-orange-100 text-orange-800" :
                      goal.status === "DELETED" ? "bg-gray-100 text-gray-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {goal.status}
                    </span>
                  </td>
                  <td className="p-2 sm:p-4 text-sm sm:text-base hidden sm:table-cell">
                    {new Date(goal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 sm:p-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit Goal"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(goal)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Update Status"
                      >
                        <Settings size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Goal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {goals.length === 0 && (
            <div className="p-8 text-center text-gray-500">No goals found</div>
          )}
        </div>
      </div>

      {/* Add/Edit Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Goal' : 'Add New Goal'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                >
                  <StatusOptions />
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && statusUpdateGoal && (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Update Goal Status</h3>
            <p className="text-gray-600 mb-4">
              Update status for: <strong>{statusUpdateGoal.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Status</label>
              <select
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
                  setStatusUpdateGoal(null);
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
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Delete Goal</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this goal? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteGoalId(null);
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalManager;