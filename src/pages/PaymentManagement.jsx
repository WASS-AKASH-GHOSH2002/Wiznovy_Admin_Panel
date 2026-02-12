import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Eye, X, Download } from 'lucide-react';
import { fetchPayments, fetchPaymentDetails, downloadInvoice, setSearch, setPurchaseTypeFilter, setPaymentStatusFilter, setDateFilter, clearFilters as clearPaymentFilters } from '../store/paymentSlice';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

export default function PaymentManagement() {
  const dispatch = useDispatch();
  const { payments, total, loading, error, filters, selectedPayment, detailsLoading } = useSelector(state => state.payments);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoicePdfUrl, setInvoicePdfUrl] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
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
  }, [payments, searchKeyword]);

  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage, 
      offset,
      keyword: filters.search
    };
    if (filters.purchaseType) params.purchaseType = filters.purchaseType;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters.date) params.date = filters.date;
    dispatch(fetchPayments(params));
  }, [dispatch, currentPage, itemsPerPage, filters]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = () => {
    setCurrentPage(1);
    const params = { 
      limit: itemsPerPage, 
      offset: 0,
      keyword: filters.search
    };
    if (filters.purchaseType) params.purchaseType = filters.purchaseType;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters.date) params.date = filters.date;
    dispatch(fetchPayments(params));
    toast.success('Payments refreshed');
  };

  const clearFilters = () => {
    dispatch(clearPaymentFilters());
    setSearchKeyword('');
    setCurrentPage(1);
  };

  const handleViewDetails = async (payment) => {
    setShowViewModal(true);
    await dispatch(fetchPaymentDetails(payment.id));
  };

  const handleDownloadInvoice = async (purchaseId) => {
    try {
      const result = await dispatch(downloadInvoice(purchaseId)).unwrap();
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${purchaseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleViewInvoice = async (purchaseId) => {
    setInvoiceLoading(true);
    setShowInvoiceModal(true);
    try {
      const result = await dispatch(downloadInvoice(purchaseId)).unwrap();
      const url = window.URL.createObjectURL(result.blob);
      setInvoicePdfUrl(url);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice');
      setShowInvoiceModal(false);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleCloseInvoiceModal = () => {
    if (invoicePdfUrl) {
      window.URL.revokeObjectURL(invoicePdfUrl);
      setInvoicePdfUrl(null);
    }
    setShowInvoiceModal(false);
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

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading payments...</p>
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
          <h2 className="text-3xl font-bold text-gray-800">Payment Management</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <p className="text-gray-600 mb-6">Total Payments: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by user name, email, phone..."
            value={searchKeyword}
            onChange={handleKeywordChange}
            className="flex-1 border border-gray-300 p-2.5 rounded-lg"
          />
          <select
            value={filters.purchaseType}
            onChange={(e) => dispatch(setPurchaseTypeFilter(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="COURSE">Course</option>
            <option value="SESSION">Session</option>
          </select>

          <select
            value={filters.paymentStatus}
            onChange={(e) => dispatch(setPaymentStatusFilter(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="FAILED">Failed</option>
          </select>

          <input
            type="date"
            value={filters.date}
            onChange={(e) => dispatch(setDateFilter(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={clearFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300"
          >
            <X size={18} />
            Clear Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-left">User Details</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr key={payment.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800">
                          {payment.account?.userDetail?.name || 'N/A'}
                        </p>
                        <p className="text-gray-600">{payment.account?.email || 'N/A'}</p>
                        <p className="text-gray-500">{payment.account?.phoneNumber || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {payment.purchaseType}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">₹{payment.amount}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          payment.paymentStatus === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : payment.paymentStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : payment.paymentStatus === 'REFUNDED'
                            ? 'bg-blue-100 text-blue-800'
                            : payment.paymentStatus === 'CANCELLED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(payment.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(payment.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Download Invoice"
                        >
                          <Download size={18} />
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} payments
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
          title="Payment Details"
          maxWidth="max-w-2xl"
          position="center"
        >
          {detailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : selectedPayment ? (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment ID</p>
                    <p className="font-semibold text-gray-800">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-800">₹{selectedPayment.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purchase Type</p>
                    <p className="font-semibold text-gray-800">{selectedPayment.purchaseType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        selectedPayment.paymentStatus === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : selectedPayment.paymentStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedPayment.paymentStatus === 'REFUNDED'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedPayment.paymentStatus === 'CANCELLED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedPayment.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Paid At</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedPayment.paidAt)}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-800 mb-2">User Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-semibold text-gray-800">
                        {selectedPayment.account?.userDetail?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800">{selectedPayment.account?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-semibold text-gray-800">
                        {selectedPayment.account?.phoneNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedPayment.course && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-gray-800 mb-2">Course Details</h4>
                    <p className="text-gray-800">{selectedPayment.course.name}</p>
                  </div>
                )}

                {selectedPayment.session && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-gray-800 mb-2">Session Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Session Date</p>
                        <p className="font-semibold text-gray-800">{selectedPayment.session.sessionDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Start Time</p>
                        <p className="font-semibold text-gray-800">{selectedPayment.session.startTime}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleViewInvoice(selectedPayment.id)}
                  className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  View Invoice
                </button>
                <button
                  onClick={() => handleDownloadInvoice(selectedPayment.id)}
                  className="flex-1 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-4">No payment details available</p>
          )}
        </Modal>

        <Modal 
          isOpen={showInvoiceModal} 
          onClose={handleCloseInvoiceModal}
          title="Invoice Preview"
          maxWidth="max-w-4xl"
          position="center"
        >
          {invoiceLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <RefreshCw className="animate-spin h-12 w-12 text-blue-500 mb-4" />
              <p className="text-gray-600">Loading invoice...</p>
            </div>
          ) : invoicePdfUrl ? (
            <div className="space-y-4">
              <div className="border-4 border-gray-200 rounded-lg overflow-hidden shadow-lg">
                <iframe 
                  src={`${invoicePdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-[600px]"
                  title="Invoice PDF"
                  type="application/pdf"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = invoicePdfUrl;
                    link.download = `invoice_${selectedPayment?.id}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Invoice downloaded successfully!');
                  }}
                  className="flex-1 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download Invoice
                </button>
                <button
                  onClick={handleCloseInvoiceModal}
                  className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
