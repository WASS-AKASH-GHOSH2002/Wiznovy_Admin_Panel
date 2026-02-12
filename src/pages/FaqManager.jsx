import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Plus, Eye, Settings, Edit } from 'lucide-react';
import { fetchFaqs, createFaq, updateFaqStatus, updateFaq, bulkUpdateFaqStatus, fetchFaqDetails, setStatusFilter, setTypeFilter, setSearch } from '../store/faqSlice';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

export default function FaqManager() {
  const dispatch = useDispatch();
  const { faqs, total, loading, error, filters, selectedFaq, detailsLoading } = useSelector(state => state.faqs);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedFaqs, setSelectedFaqs] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateFaq, setStatusUpdateFaq] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFaq, setEditFaq] = useState(null);
  const [editData, setEditData] = useState({ question: '', answer: '', type: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', type: 'USER' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

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
  }, [faqs, searchKeyword]);

  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage, 
      offset, 
      keyword: filters.search
    };
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    dispatch(fetchFaqs(params));
  }, [dispatch, currentPage, itemsPerPage, filters.search, filters.status, filters.type]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusUpdate = (faq) => {
    setStatusUpdateFaq(faq);
    setNewStatus(faq.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (statusUpdateFaq && newStatus) {
      try {
        await dispatch(updateFaqStatus({ faqId: statusUpdateFaq.id, status: newStatus })).unwrap();
        toast.success('Status updated successfully!');
        setShowStatusModal(false);
        setStatusUpdateFaq(null);
        setNewStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Status update failed:', error);
        toast.error('Failed to update status');
      }
    }
  };

  const handleSelectFaq = (faqId) => {
    setSelectedFaqs(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFaqs(selectedFaqs.length === faqs.length ? [] : faqs.map(f => f.id));
  };

  const handleBulkStatusUpdate = () => {
    if (selectedFaqs.length > 0) {
      setShowBulkModal(true);
    }
  };

  const confirmBulkStatusUpdate = async () => {
    if (selectedFaqs.length > 0 && bulkStatus) {
      setIsBulkUpdating(true);
      try {
        await dispatch(bulkUpdateFaqStatus({ ids: selectedFaqs, status: bulkStatus })).unwrap();
        toast.success(`${selectedFaqs.length} FAQs updated successfully!`);
        setShowBulkModal(false);
        setSelectedFaqs([]);
        setBulkStatus('');
        handleRefresh();
      } catch (error) {
        console.error('Bulk status update failed:', error);
        toast.error('Failed to update FAQs status');
      } finally {
        setIsBulkUpdating(false);
      }
    }
  };

  const handleViewProfile = async (faq) => {
    setShowProfile(true);
    await dispatch(fetchFaqDetails(faq.id));
  };

  const handleRefresh = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage,
      offset,
      keyword: filters.search
    };
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    dispatch(fetchFaqs(params));
  };

  const handleOpenCreateModal = () => {
    setNewFaq({ question: '', answer: '', type: 'USER' });
    setShowCreateForm(true);
  };

  const handleCreateFaq = async (e) => {
    e.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await dispatch(createFaq(newFaq)).unwrap();
      toast.success('FAQ created successfully!');
      setNewFaq({ question: '', answer: '', type: 'USER' });
      setShowCreateForm(false);
      handleRefresh();
    } catch (error) {
      console.error('FAQ creation failed:', error);
      toast.error('Failed to create FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFaq = (faq) => {
    setEditFaq(faq);
    setEditData({ question: faq.question, answer: faq.answer, type: faq.type });
    setShowEditModal(true);
  };

  const confirmUpdateFaq = async () => {
    if (!editFaq || !editData.question.trim() || !editData.answer.trim()) return;
    
    setIsUpdating(true);
    try {
      await dispatch(updateFaq({ 
        faqId: editFaq.id, 
        question: editData.question.trim(),
        answer: editData.answer.trim(),
        type: editData.type
      })).unwrap();
      
      setShowEditModal(false);
      setEditFaq(null);
      setEditData({ question: '', answer: '', type: '' });
      toast.success('FAQ updated successfully!');
      handleRefresh();
    } catch (error) {
      const errorMessage = error?.message || 'Failed to update FAQ';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && faqs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
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
          <h2 className="text-3xl font-bold text-gray-800">FAQ Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={18} /> Add FAQ
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Total FAQs: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by question or answer..."
            value={searchKeyword}
            onChange={handleKeywordChange}
            className="flex-1 border border-gray-300 p-2.5 rounded-lg"
          />
          <select
            value={filters.type}
            onChange={(e) => {
              dispatch(setTypeFilter(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 p-2.5 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="USER">User</option>
            <option value="TUTOR">Tutor</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => {
              dispatch(setStatusFilter(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 p-2.5 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVE">Deactive</option>
          </select>
          {selectedFaqs.length > 0 && (
            <button
              onClick={handleBulkStatusUpdate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Bulk Update ({selectedFaqs.length})
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
                    checked={selectedFaqs.length === faqs.length && faqs.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left">Question</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq, index) => (
                <tr key={faq.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedFaqs.includes(faq.id)}
                      onChange={() => handleSelectFaq(faq.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4 text-sm text-gray-800 max-w-md truncate">{faq.question}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {faq.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        faq.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {faq.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(faq.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(faq)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(faq)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Update Status"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => handleEditFaq(faq)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit FAQ"
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} FAQs
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
          onClose={() => setShowCreateForm(false)}
          title="Create New FAQ"
          maxWidth="max-w-2xl"
          position="center"
        >
          <form onSubmit={handleCreateFaq} className="space-y-4">
            <div>
              <label htmlFor="create-question" className="block text-sm font-medium text-gray-700 mb-2 text-left">Question *</label>
              <input
                id="create-question"
                type="text"
                placeholder="Enter question"
                value={newFaq.question}
                onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label htmlFor="create-answer" className="block text-sm font-medium text-gray-700 mb-2 text-left">Answer *</label>
              <textarea
                id="create-answer"
                placeholder="Enter answer"
                value={newFaq.answer}
                onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded-lg"
                rows={4}
                required
              />
            </div>
            <div>
              <label htmlFor="create-type" className="block text-sm font-medium text-gray-700 mb-2 text-left">Type *</label>
              <select
                id="create-type"
                value={newFaq.type}
                onChange={(e) => setNewFaq({...newFaq, type: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded-lg"
              >
                <option value="USER">User</option>
                <option value="TUTOR">Tutor</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create FAQ'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal 
          isOpen={showProfile && selectedFaq} 
          onClose={() => setShowProfile(false)}
          title="FAQ Details"
          maxWidth="max-w-2xl"
          position="center"
        >
          {detailsLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 mx-auto text-blue-500" />
              <p className="mt-2 text-gray-600">Loading details...</p>
            </div>
          ) : selectedFaq && (
            <>
              <div className="space-y-4 text-left">
                <div>
                  <p className="text-sm text-gray-500">Question</p>
                  <p className="font-semibold text-gray-800">{selectedFaq.question}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Answer</p>
                  <p className="text-gray-800">{selectedFaq.answer}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {selectedFaq.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        selectedFaq.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedFaq.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="text-gray-800">{new Date(selectedFaq.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Updated At</p>
                    <p className="text-gray-800">{new Date(selectedFaq.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowProfile(false)}
                className="mt-6 w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </>
          )}
        </Modal>

        <Modal 
          isOpen={showStatusModal && statusUpdateFaq} 
          onClose={() => setShowStatusModal(false)}
          title="Update FAQ Status"
          maxWidth="max-w-md"
          position="center"
        >
          {statusUpdateFaq && (
            <>
              <div className="mb-4">
                <p className="text-gray-700 mb-2">FAQ: <strong>{statusUpdateFaq.question}</strong></p>
                <p className="text-sm text-gray-600">Current Status: <strong>{statusUpdateFaq.status}</strong></p>
              </div>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg mb-4"
              >
                <option value="ACTIVE">Active</option>
                <option value="DEACTIVE">Deactive</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStatusModal(false)}
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
          isOpen={showBulkModal} 
          onClose={() => setShowBulkModal(false)}
          title="Bulk Status Update"
          maxWidth="max-w-md"
          position="center"
        >
          <div className="mb-4">
            <p className="text-gray-700 mb-2">Update status for {selectedFaqs.length} selected FAQs</p>
          </div>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg mb-4"
          >
            <option value="">Select Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVE">Deactive</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkModal(false)}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={confirmBulkStatusUpdate}
              disabled={!bulkStatus || isBulkUpdating}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isBulkUpdating ? 'Updating...' : 'Update All'}
            </button>
          </div>
        </Modal>

        <Modal 
          isOpen={showEditModal && editFaq} 
          onClose={() => setShowEditModal(false)}
          title="Edit FAQ"
          maxWidth="max-w-2xl"
          position="center"
        >
          {editFaq && (
            <>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-question" className="block text-sm font-medium text-gray-700 mb-2 text-left">Question *</label>
                  <input
                    id="edit-question"
                    type="text"
                    value={editData.question}
                    onChange={(e) => setEditData({...editData, question: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="edit-answer" className="block text-sm font-medium text-gray-700 mb-2 text-left">Answer *</label>
                  <textarea
                    id="edit-answer"
                    value={editData.answer}
                    onChange={(e) => setEditData({...editData, answer: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    rows={4}
                  />
                </div>
                <div>
                  <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-2 text-left">Type *</label>
                  <select
                    id="edit-type"
                    value={editData.type}
                    onChange={(e) => setEditData({...editData, type: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                  >
                    <option value="USER">User</option>
                    <option value="TUTOR">Tutor</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpdateFaq}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update FAQ'}
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}
