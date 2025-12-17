import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Settings, Edit, Trash2, Plus } from 'lucide-react';
import {
  createGoal,
  getAllGoals,
  updateGoal,
  updateGoalStatus,
  deleteGoal,
  clearError,
} from '../store/goalSlice';

/* =====================
   STATIC DATA
===================== */

const GOAL_STATUSES = ['ACTIVE', 'DEACTIVE', 'DELETED', 'SUSPENDED', 'PENDING'];

/* =====================
   UI HELPERS
===================== */

const StatusPill = ({ value }) => {
  const map = {
    ACTIVE: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    SUSPENDED: 'bg-orange-100 text-orange-800',
    DELETED: 'bg-gray-100 text-gray-800',
    DEACTIVE: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${map[value]}`}>
      {value}
    </span>
  );
};

StatusPill.propTypes = { value: PropTypes.string.isRequired };

const OverlayModal = ({ open, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

OverlayModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/* =====================
   MAIN COMPONENT
===================== */

const GoalManager = () => {
  const dispatch = useDispatch();
  const { goals, loading, error } = useSelector((s) => s.goals);

  const [form, setForm] = useState({ name: '', status: 'ACTIVE' });
  const [editId, setEditId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [currentGoal, setCurrentGoal] = useState(null);
  const [statusValue, setStatusValue] = useState('');

  /* =====================
     DATA
  ===================== */

  useEffect(() => {
    dispatch(getAllGoals());
  }, [dispatch]);

  /* =====================
     FORM
  ===================== */

  const reset = () => {
    setForm({ name: '', status: 'ACTIVE' });
    setEditId(null);
    setShowForm(false);
    dispatch(clearError());
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await dispatch(updateGoal({ goalId: editId, goalData: form })).unwrap();
      } else {
        await dispatch(createGoal(form)).unwrap();
      }
      reset();
      dispatch(getAllGoals());
    } catch {}
  };

  /* =====================
     STATUS
  ===================== */

  const changeStatus = async () => {
    await dispatch(
      updateGoalStatus({
        goalId: currentGoal.id,
        status: statusValue,
      }),
    ).unwrap();

    setShowStatus(false);
    setCurrentGoal(null);
    dispatch(getAllGoals());
  };

  /* =====================
     DELETE
  ===================== */

  const confirmDelete = async () => {
    await dispatch(deleteGoal(currentGoal.id)).unwrap();
    setShowDelete(false);
    setCurrentGoal(null);
    dispatch(getAllGoals());
  };

  /* =====================
     STATES
  ===================== */

  if (loading && !goals.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => dispatch(getAllGoals())}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* =====================
     UI
  ===================== */

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div
        className={`max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 ${
          showForm || showStatus || showDelete ? 'blur-sm' : ''
        }`}
      >
        <header className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold">Goal Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex gap-2"
            >
              <Plus size={18} /> Add Goal
            </button>
            <button
              onClick={() => dispatch(getAllGoals())}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </header>

        <p className="text-gray-600 mb-4">Total Goals: {goals.length}</p>

        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left hidden sm:table-cell">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g, i) => (
              <tr key={g.id} className={i % 2 ? 'bg-gray-50' : ''}>
                <td className="p-3">{g.name}</td>
                <td className="p-3">
                  <StatusPill value={g.status} />
                </td>
                <td className="p-3 hidden sm:table-cell">
                  {new Date(g.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    className="text-blue-600"
                    onClick={() => {
                      setEditId(g.id);
                      setForm({ name: g.name, status: g.status });
                      setShowForm(true);
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-green-600"
                    onClick={() => {
                      setCurrentGoal(g);
                      setStatusValue(g.status);
                      setShowStatus(true);
                    }}
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => {
                      setCurrentGoal(g);
                      setShowDelete(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FORM */}
      <OverlayModal open={showForm} title={editId ? 'Edit Goal' : 'Add Goal'}>
        <form onSubmit={submitForm}>
          <input
            className="w-full border p-2 mb-4 rounded"
            placeholder="Goal Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            className="w-full border p-2 mb-4 rounded"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {GOAL_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="flex-1 bg-gray-500 text-white p-2 rounded">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-blue-500 text-white p-2 rounded">
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </OverlayModal>

      {/* STATUS */}
      <OverlayModal open={showStatus} title="Update Status">
        <select
          className="w-full border p-2 mb-4 rounded"
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value)}
        >
          {GOAL_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button onClick={() => setShowStatus(false)} className="flex-1 bg-gray-500 text-white p-2 rounded">
            Cancel
          </button>
          <button onClick={changeStatus} className="flex-1 bg-blue-500 text-white p-2 rounded">
            Update
          </button>
        </div>
      </OverlayModal>

      {/* DELETE */}
      <OverlayModal open={showDelete} title="Delete Goal">
        <p className="mb-4 text-gray-600">Are you sure?</p>
        <div className="flex gap-2">
          <button onClick={() => setShowDelete(false)} className="flex-1 bg-gray-500 text-white p-2 rounded">
            Cancel
          </button>
          <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white p-2 rounded">
            Delete
          </button>
        </div>
      </OverlayModal>
    </div>
  );
};

export default GoalManager;
