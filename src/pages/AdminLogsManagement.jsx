import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, X } from 'lucide-react';
import { fetchAdminLogs, setTargetTypeFilter, setDateFilter, clearFilters as clearAdminFilters } from '../store/adminLogSlice';
import { toast } from 'react-toastify';

export default function AdminLogsManagement() {
  const dispatch = useDispatch();
  const { logs, total, loading, error, filters } = useSelector(state => state.adminLogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage, 
      offset
    };
    if (filters.targetType) params.targetType = filters.targetType;
    if (filters.date) params.date = filters.date;
    dispatch(fetchAdminLogs(params));
  }, [dispatch, currentPage, itemsPerPage, filters]);

  const handleRefresh = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    const params = { 
      limit: itemsPerPage, 
      offset
    };
    if (filters.targetType) params.targetType = filters.targetType;
    if (filters.date) params.date = filters.date;
    dispatch(fetchAdminLogs(params));
    toast.success('Admin logs refreshed');
  };

  const clearFilters = () => {
    dispatch(clearAdminFilters());
    setCurrentPage(1);
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

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading admin logs...</p>
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
          <h2 className="text-3xl font-bold text-gray-800">Admin Logs</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <p className="text-gray-600 mb-6">Total Logs: {total}</p>

        <div className="flex gap-4 mb-6">
          <select
            value={filters.targetType}
            onChange={(e) => dispatch(setTargetTypeFilter(e.target.value))}
            className="border border-gray-300 p-2.5 rounded-lg"
          >
            <option value="">All Target Types</option>
            <option value="COURSE">Course</option>
            <option value="PAYOUT">Payout</option>
            <option value="USER">User</option>
            <option value="TUTOR">Tutor</option>
            <option value="STAFF">Staff</option>
            <option value="SESSION">Session</option>
          </select>

          <div>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => dispatch(setDateFilter(e.target.value))}
              className="border border-gray-300 p-2.5 rounded-lg"
              placeholder="Select Date"
            />
          </div>

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
                <th className="p-4 text-left">Admin Details</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">IP Address</th>
                <th className="p-4 text-left">User Agent</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800">
                          {log.admin?.email || 'N/A'}
                        </p>
                        <p className="text-gray-600">{log.admin?.roles || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-800">{log.description}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {log.actionType}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            {log.targetType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{log.ipAddress}</td>
                    <td className="p-4">
                      <div className="max-w-xs truncate text-sm text-gray-600">
                        {log.userAgent}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(log.createdAt)}</td>
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} logs
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
    </div>
  );
}
