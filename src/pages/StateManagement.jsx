import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, RefreshCw, Settings, Plus } from "lucide-react";
import {
  fetchStates,
  createState,
  updateStateStatus,
  setSearch,
  setStatusFilter,
  setCountryFilter,
} from "../store/stateSlice";
import { fetchCountries } from "../store/countrySlice";

/* ===================== CONSTANTS ===================== */

const STATUS_OPTIONS = [
  "ACTIVE",
  "DEACTIVE",
  "DELETED",
  "SUSPENDED",
  "PENDING",
];

/* ===================== REUSABLE UI ===================== */

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    SUSPENDED: "bg-orange-100 text-orange-800",
    DELETED: "bg-gray-100 text-gray-800",
    DEACTIVE: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const ModalWrapper = ({ children }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
    {children}
  </div>
);

/* ===================== MAIN ===================== */

const StateManagement = () => {
  const dispatch = useDispatch();
  const { states, total, loading, error, filters } = useSelector(
    (state) => state.states,
  );
  const { countries } = useSelector((state) => state.countries);

  const [selectedState, setSelectedState] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateState, setStatusUpdateState] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    countryId: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const reloadStates = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    dispatch(
      fetchStates({
        countryId: filters.countryId,
        limit: itemsPerPage,
        offset,
      }),
    );
  };

  useEffect(() => {
    reloadStates();
    dispatch(fetchCountries({ limit: 100, status: "ACTIVE" }));
  }, [dispatch, filters.countryId, currentPage, itemsPerPage]);

  const handleStatusUpdate = (state) => {
    setStatusUpdateState(state);
    setNewStatus(state.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = () => {
    dispatch(
      updateStateStatus({
        stateId: statusUpdateState.id,
        status: newStatus,
      }),
    );
    setShowStatusModal(false);
    setStatusUpdateState(null);
    setNewStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createState(formData)).unwrap();
    setShowAddModal(false);
    setFormData({ name: "", code: "", countryId: "" });
    reloadStates();
  };

  const filteredStates = states.filter((state) => {
    const searchMatch =
      !filters.search ||
      state.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      state.code.toLowerCase().includes(filters.search.toLowerCase());
    const statusMatch = !filters.status || state.status === filters.status;
    return searchMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={reloadStates}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold">State Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex gap-2"
            >
              <Plus size={18} /> Add State
            </button>
            <button
              onClick={reloadStates}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>

        <p className="mb-4 text-gray-600">Total States: {total}</p>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <input
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            className="border p-2 rounded"
          />
          <select
            value={filters.status}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            className="border p-2 rounded"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filters.countryId}
            onChange={(e) => dispatch(setCountryFilter(e.target.value))}
            className="border p-2 rounded"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left hidden sm:table-cell">Country</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStates.map((state, i) => (
              <tr key={state.id} className={i % 2 ? "bg-gray-50" : ""}>
                <td className="p-3">{state.name}</td>
                <td className="p-3">{state.code}</td>
                <td className="p-3 hidden sm:table-cell">
                  {state.country?.name || "N/A"}
                </td>
                <td className="p-3">
                  <StatusBadge status={state.status} />
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => setSelectedState(state)}>
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleStatusUpdate(state)}>
                    <Settings size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <ModalWrapper>
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add State</h3>
            <form onSubmit={handleSubmit}>
              <input
                placeholder="Name"
                className="w-full border p-2 mb-3 rounded"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                placeholder="Code"
                className="w-full border p-2 mb-3 rounded"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
              <select
                className="w-full border p-2 mb-3 rounded"
                value={formData.countryId}
                onChange={(e) =>
                  setFormData({ ...formData, countryId: e.target.value })
                }
                required
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-500 text-white p-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white p-2 rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </ModalWrapper>
      )}

      {/* STATUS MODAL */}
      {showStatusModal && statusUpdateState && (
        <ModalWrapper>
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Update Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-gray-500 text-white p-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className="flex-1 bg-blue-500 text-white p-2 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default StateManagement;
