import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Eye } from 'lucide-react';
import { fetchSessions, fetchSessionDetails, setStatusFilter, setDateFilter, setSessionTypeFilter } from '../store/sessionSlice';
import Modal from '../components/Modal';
import { normalizeImageUrl } from '../utils/imageUtils';

export default function SessionManagement() {
  const dispatch = useDispatch();
  const { sessions, total, loading, error, filters, selectedSession, detailsLoading } = useSelector(state => state.sessions);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage, 
      offset
    };
    if (filters.status) params.status = filters.status;
    if (filters.date) params.date = filters.date;
    if (filters.sessionType) params.sessionType = filters.sessionType;
    dispatch(fetchSessions(params));
  }, [dispatch, currentPage, itemsPerPage, filters.status, filters.date, filters.sessionType]);

  const handleRefresh = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage, 
      offset
    };
    if (filters.status) params.status = filters.status;
    if (filters.date) params.date = filters.date;
    if (filters.sessionType) params.sessionType = filters.sessionType;
    dispatch(fetchSessions(params));
  };

  const handleViewDetails = async (session) => {
    setShowViewModal(true);
    await dispatch(fetchSessionDetails(session.id));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading sessions...</p>
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
          <h2 className="text-3xl font-bold text-gray-800">Session Management</h2>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">Total Sessions: {total}</p>

        <div className="flex gap-4 mb-6">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => dispatch(setDateFilter(e.target.value))}
            className="border border-gray-300 p-2.5 rounded-lg"
          />
          <select
            value={filters.status}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            className="border border-gray-300 p-2.5 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={filters.sessionType}
            onChange={(e) => dispatch(setSessionTypeFilter(e.target.value))}
            className="border border-gray-300 p-2.5 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="REGULAR">Regular</option>
            <option value="TRIAL">Trial</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-left">Session Date</th>
                <th className="p-4 text-left">Duration</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No sessions found
                  </td>
                </tr>
              ) : (
                sessions.map((session, index) => (
                  <tr key={session.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4 text-sm text-gray-800">{formatDate(session.sessionDate)}</td>
                    <td className="p-4 text-sm text-gray-800">{session.duration} min</td>
                    <td className="p-4 font-semibold text-gray-800">₹{session.amount}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          session.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : session.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        {session.sessionType}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleViewDetails(session)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} sessions
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
          title="Session Details"
          maxWidth="max-w-3xl"
          position="center"
        >
          {detailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : selectedSession ? (
            <>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Session ID</p>
                    <p className="font-semibold text-gray-800 text-sm break-all">{selectedSession.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purchase ID</p>
                    <p className="font-semibold text-gray-800 text-sm break-all">{selectedSession.purchaseId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Session Date</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedSession.sessionDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-800">{selectedSession.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Time</p>
                    <p className="font-semibold text-gray-800">{selectedSession.startTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Time</p>
                    <p className="font-semibold text-gray-800">{selectedSession.endTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-800">₹{selectedSession.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        selectedSession.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : selectedSession.status === 'SCHEDULED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedSession.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      {selectedSession.sessionType}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedSession.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Updated At</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedSession.updatedAt)}</p>
                  </div>
                  {selectedSession.cancelledAt && (
                    <div>
                      <p className="text-sm text-gray-500">Cancelled At</p>
                      <p className="font-semibold text-gray-800">{formatDate(selectedSession.cancelledAt)}</p>
                    </div>
                  )}
                  {selectedSession.cancelledBy && (
                    <div>
                      <p className="text-sm text-gray-500">Cancelled By</p>
                      <p className="font-semibold text-gray-800">{selectedSession.cancelledBy}</p>
                    </div>
                  )}
                </div>

                {selectedSession.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-semibold text-gray-800">{selectedSession.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-800 mb-3">User Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-semibold text-gray-800 text-sm break-all">{selectedSession.userId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-semibold text-gray-800">
                        {selectedSession.user?.userDetail?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800">{selectedSession.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-800 mb-3">Tutor Details</h4>
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-2">Tutor ID</p>
                    <p className="font-semibold text-gray-800 text-sm break-all">{selectedSession.tutorId}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedSession.tutor?.tutorDetail?.profileImage ? (
                      <img 
                        src={normalizeImageUrl(selectedSession.tutor.tutorDetail.profileImage)} 
                        alt={selectedSession.tutor.tutorDetail.name} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Img</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedSession.tutor?.tutorDetail?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">{selectedSession.tutor?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {selectedSession.zoomMeeting && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-gray-800 mb-3">Zoom Meeting Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Meeting ID</p>
                        <p className="font-semibold text-gray-800">{selectedSession.zoomMeeting.meetingId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Join URL</p>
                        <a 
                          href={selectedSession.zoomMeeting.joinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all block"
                        >
                          {selectedSession.zoomMeeting.joinUrl}
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Start URL</p>
                        <a 
                          href={selectedSession.zoomMeeting.startUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all block"
                        >
                          {selectedSession.zoomMeeting.startUrl}
                        </a>
                      </div>
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
            <p className="text-center text-gray-500 py-4">No session details available</p>
          )}
        </Modal>
      </div>
    </div>
  );
}
