import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Eye, CheckCircle, XCircle } from 'lucide-react';
import { fetchTutorPayouts, fetchPayoutDetails, setStatusFilter, setSearch, approveTutorPayout, rejectTutorPayout } from '../store/tutorPayoutSlice';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import { normalizeImageUrl } from '../utils/imageUtils';

export default function TutorPayoutManagement() {
  const dispatch = useDispatch();
  const { payouts, total, loading, error, filters, selectedPayout, detailsLoading } = useSelector(state => state.tutorPayouts);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    status: 'APPROVED',
    transactionId: '',
    notes: '',
    paymentMethod: 'BANK_TRANSFER',
    paidAt: new Date().toISOString()
  });
  const [isApproving, setIsApproving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
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
  }, [payouts, searchKeyword]);

  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage, 
      offset,
      keyword: filters.search
    };
    if (filters.status) params.status = filters.status;
    dispatch(fetchTutorPayouts(params));
  }, [dispatch, currentPage, itemsPerPage, filters.search, filters.status]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage, 
      offset,
      keyword: filters.search
    };
    if (filters.status) params.status = filters.status;
    dispatch(fetchTutorPayouts(params));
  };

  const handleViewDetails = async (payout) => {
    setShowViewModal(true);
    await dispatch(fetchPayoutDetails(payout.id));
  };

  const handleApproveClick = (payout) => {
    setShowViewModal(false);
    dispatch(fetchPayoutDetails(payout.id)).then(() => {
      setApprovalData({
        status: 'APPROVED',
        transactionId: '',
        notes: '',
        paymentMethod: 'BANK_TRANSFER',
        paidAt: new Date().toISOString()
      });
      setShowApproveModal(true);
    });
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approvalData.transactionId.trim()) {
      toast.error('Transaction ID is required');
      return;
    }

    setIsApproving(true);
    try {
      await dispatch(approveTutorPayout({ 
        payoutId: selectedPayout.id, 
        approvalData 
      })).unwrap();
      toast.success('Payout approved successfully!');
      setShowApproveModal(false);
      handleRefresh();
    } catch (error) {
      console.error('Approval failed:', error);
      toast.error('Failed to approve payout');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectClick = (payout) => {
    setShowViewModal(false);
    dispatch(fetchPayoutDetails(payout.id)).then(() => {
      setRejectionReason('');
      setShowRejectModal(true);
    });
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    setIsRejecting(true);
    try {
      await dispatch(rejectTutorPayout({ 
        payoutId: selectedPayout.id, 
        rejectionReason 
      })).unwrap();
      toast.success('Payout rejected successfully!');
      setShowRejectModal(false);
      handleRefresh();
    } catch (error) {
      console.error('Rejection failed:', error);
      toast.error('Failed to reject payout');
    } finally {
      setIsRejecting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && payouts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading payouts...</p>
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
const getStatusClass = (status) => {
  if (status === 'APPROVED') {
    return 'bg-green-100 text-green-800';
  }
  if (status === 'PENDING') {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-red-100 text-red-800';
};

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Tutor Payout Management</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <p className="text-gray-600 mb-6">Total Payouts: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by tutor name or email..."
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
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-left">Tutor Details</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Created Date</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No payouts found
                  </td>
                </tr>
              ) : (
                payouts.map((payout, index) => (
                  <tr key={payout.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {payout.tutor?.tutorDetail?.profileImage ? (
                          <img 
                            src={normalizeImageUrl(payout.tutor.tutorDetail.profileImage)} 
                            alt={payout.tutor.tutorDetail.name} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Img</span>
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="font-semibold text-gray-800">
                            {payout.tutor?.tutorDetail?.name || 'N/A'}
                          </p>
                          <p className="text-gray-600">{payout.tutor?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">₹{payout.amount}</td>
                    <td className="p-4">
                  <span
  className={`px-3 py-1 text-xs rounded-full ${getStatusClass(payout.status)}`}
>
  {payout.status}
</span>

                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(payout.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(payout)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {payout.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveClick(payout)}
                              className="text-green-600 hover:text-green-800"
                              title="Approve Payout"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectClick(payout)}
                              className="text-red-600 hover:text-red-800"
                              title="Reject Payout"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} payouts
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
          isOpen={showViewModal} 
          onClose={() => setShowViewModal(false)}
          title="Payout Details"
          maxWidth="max-w-3xl"
          position="center"
        >
          {detailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : selectedPayout ? (
            <>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payout ID</p>
                    <p className="font-semibold text-gray-800 text-sm break-all">{selectedPayout.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-800">₹{selectedPayout.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-semibold text-gray-800">{selectedPayout.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                  <span
  className={`px-3 py-1 text-xs rounded-full ${getStatusClass(selectedPayout.status)}`}
>
  {selectedPayout.status}
</span>

                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-semibold text-gray-800">{selectedPayout.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedPayout.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Approved At</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedPayout.approvedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Paid At</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedPayout.paidAt)}</p>
                  </div>
                </div>

                {selectedPayout.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-semibold text-gray-800">{selectedPayout.notes}</p>
                  </div>
                )}

                {selectedPayout.rejectionReason && (
                  <div>
                    <p className="text-sm text-gray-500">Rejection Reason</p>
                    <p className="font-semibold text-red-600">{selectedPayout.rejectionReason}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-800 mb-3">Tutor Details</h4>
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-2">Tutor ID</p>
                    <p className="font-semibold text-gray-800 text-sm break-all">{selectedPayout.tutor?.id}</p>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {selectedPayout.tutor?.tutorDetail?.profileImage ? (
                      <img 
                        src={normalizeImageUrl(selectedPayout.tutor.tutorDetail.profileImage)} 
                        alt={selectedPayout.tutor.tutorDetail.name} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Img</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedPayout.tutor?.tutorDetail?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">{selectedPayout.tutor?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {selectedPayout.approver && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-gray-800 mb-3">Approver Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Approver ID</p>
                        <p className="font-semibold text-gray-800 text-sm break-all">{selectedPayout.approver.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold text-gray-800">{selectedPayout.approver.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayout.bankDetail && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-gray-800 mb-3">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Account Holder</p>
                        <p className="font-semibold text-gray-800">{selectedPayout.bankDetail.accountHolderName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Number</p>
                        <p className="font-semibold text-gray-800">{selectedPayout.bankDetail.accountNo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">IFSC Code</p>
                        <p className="font-semibold text-gray-800">{selectedPayout.bankDetail.ifscCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-semibold text-gray-800">{selectedPayout.bankDetail.bankName}</p>
                      </div>
                      {selectedPayout.bankDetail.swiftCode && (
                        <div>
                          <p className="text-sm text-gray-500">SWIFT Code</p>
                          <p className="font-semibold text-gray-800">{selectedPayout.bankDetail.swiftCode}</p>
                        </div>
                      )}
                      {selectedPayout.bankDetail.branchName && (
                        <div>
                          <p className="text-sm text-gray-500">Branch Name</p>
                          <p className="font-semibold text-gray-800">{selectedPayout.bankDetail.branchName}</p>
                        </div>
                      )}
                      {selectedPayout.bankDetail.passbookFile && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500 mb-2">Passbook File</p>
                          <a 
                            href={normalizeImageUrl(selectedPayout.bankDetail.passbookFile)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Passbook
                          </a>
                        </div>
                      )}
                      {selectedPayout.bankDetail.documentFile && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500 mb-2">Document File</p>
                          <a 
                            href={normalizeImageUrl(selectedPayout.bankDetail.documentFile)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Document
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="mt-6 w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </>
          ) : (
            <p className="text-center text-gray-500 py-4">No payout details available</p>
          )}
        </Modal>

        <Modal 
          isOpen={showApproveModal && selectedPayout} 
          onClose={() => setShowApproveModal(false)}
          title="Approve Payout"
          maxWidth="max-w-md"
          position="center"
        >
          {selectedPayout && (
            <div className="relative">
              {isApproving && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    <p className="mt-2 text-sm text-gray-600">Approving...</p>
                  </div>
                </div>
              )}
              <form onSubmit={handleApproveSubmit} className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Tutor: <strong>{selectedPayout.tutor?.tutorDetail?.name}</strong></p>
                  <p className="text-sm text-gray-600">Amount: <strong>₹{selectedPayout.amount}</strong></p>
                </div>

                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2 text-left">Transaction ID *</label>
                  <input
                    id="transactionId"
                    type="text"
                    placeholder="Enter transaction ID"
                    value={approvalData.transactionId}
                    onChange={(e) => setApprovalData({...approvalData, transactionId: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2 text-left">Payment Method *</label>
                  <select
                    id="paymentMethod"
                    value={approvalData.paymentMethod}
                    onChange={(e) => setApprovalData({...approvalData, paymentMethod: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2 text-left">Notes</label>
                  <textarea
                    id="notes"
                    placeholder="Add any notes (optional)"
                    value={approvalData.notes}
                    onChange={(e) => setApprovalData({...approvalData, notes: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isApproving}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {isApproving ? 'Approving...' : 'Approve Payout'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </Modal>

        <Modal 
          isOpen={showRejectModal && selectedPayout} 
          onClose={() => setShowRejectModal(false)}
          title="Reject Payout"
          maxWidth="max-w-md"
          position="center"
        >
          {selectedPayout && (
            <div className="relative">
              {isRejecting && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    <p className="mt-2 text-sm text-gray-600">Rejecting...</p>
                  </div>
                </div>
              )}
              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Tutor: <strong>{selectedPayout.tutor?.tutorDetail?.name}</strong></p>
                  <p className="text-sm text-gray-600">Amount: <strong>₹{selectedPayout.amount}</strong></p>
                </div>

                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2 text-left">Rejection Reason *</label>
                  <textarea
                    id="rejectionReason"
                    placeholder="Enter reason for rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRejecting}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    {isRejecting ? 'Rejecting...' : 'Reject Payout'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
