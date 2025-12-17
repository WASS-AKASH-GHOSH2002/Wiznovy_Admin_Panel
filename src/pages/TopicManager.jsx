import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, RefreshCw, Settings, Edit } from "lucide-react";
import {
  createTopic,
  getAllTopics,
  updateTopic,
  updateTopicStatus,
  deleteTopic,
  clearError
} from '../store/topicSlice';

const TopicManager = () => {
  const dispatch = useDispatch();
  const { topics, loading, error } = useSelector(state => state.topics);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateTopic, setStatusUpdateTopic] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: 'ACTIVE' });

  useEffect(() => {
    dispatch(getAllTopics());
  }, [dispatch]);

  const handleStatusUpdate = (topic) => {
    setStatusUpdateTopic(topic);
    setNewStatus(topic.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = () => {
    if (statusUpdateTopic && newStatus) {
      dispatch(updateTopicStatus({ topicId: statusUpdateTopic.id, status: newStatus }));
      setShowStatusModal(false);
      setStatusUpdateTopic(null);
      setNewStatus('');
      dispatch(getAllTopics());
    }
  };

  const handleEdit = (topic) => {
    setEditTopic(topic);
    setFormData({ name: topic.name, status: topic.status });
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setFormData({ name: '', status: 'ACTIVE' });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTopic) {
        await dispatch(updateTopic({ topicId: editTopic.id, topicData: formData })).unwrap();
        setShowEditModal(false);
        setEditTopic(null);
      } else {
        await dispatch(createTopic(formData)).unwrap();
        setShowAddModal(false);
      }
      setFormData({ name: '', status: 'ACTIVE' });
      dispatch(getAllTopics());
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleRefresh = () => {
    dispatch(getAllTopics());
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className={`max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-lg ${showStatusModal || showAddModal || showEditModal ? 'blur-sm' : ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Topic Management</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleAdd}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              Add Topic
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Total Topics: {topics.length}</p>

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
              {topics.map((topic, index) => (
                <tr key={topic.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-2 sm:p-4 text-sm sm:text-base font-medium">{topic.name}</td>
                  <td className="p-2 sm:p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      topic.status === "ACTIVE" ? "bg-green-100 text-green-800" : 
                      topic.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      topic.status === "SUSPENDED" ? "bg-orange-100 text-orange-800" :
                      topic.status === "DELETED" ? "bg-gray-100 text-gray-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {topic.status}
                    </span>
                  </td>
                  <td className="p-2 sm:p-4 text-sm sm:text-base hidden sm:table-cell">
                    {new Date(topic.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 sm:p-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit Topic"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(topic)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Update Status"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topic Form Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editTopic ? 'Edit Topic' : 'Add New Topic'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic Name</label>
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
                  <option value="ACTIVE">Active</option>
                  <option value="DEACTIVE">Deactive</option>
                  <option value="DELETED">Deleted</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditTopic(null);
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  {editTopic ? 'Update Topic' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && statusUpdateTopic && (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Update Topic Status</h3>
            <p className="text-gray-600 mb-4">
              Update status for: <strong>{statusUpdateTopic.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg"
              >
                <option value="ACTIVE">Active</option>
                <option value="DEACTIVE">Deactive</option>
                <option value="DELETED">Deleted</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicManager;