import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, [page, dateFilter, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = `/admin/logs?page=${page}&limit=25`;
      if (dateFilter) url += `&date=${dateFilter}`;
      if (actionFilter !== 'ALL') url += `&action=${actionFilter}`;

      const response = await api.get(url);
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleFilterChange = (type, value) => {
    setPage(1); // Reset to page 1 on filter change
    if (type === 'date') setDateFilter(value);
    if (type === 'action') setActionFilter(value);
  };

  const clearFilters = () => {
    setDateFilter('');
    setActionFilter('ALL');
    setPage(1);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Audit Logs" />

<div className="max-w-2xl mx-auto px-4 pt-4">
  <Link to="/admin/dashboard"
    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors">
    ← Back to Dashboard
  </Link>
</div>

      <div className="max-w-2xl mx-auto p-4 mt-4 space-y-4">

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
          <h3 className="text-white font-medium text-sm">Filter Logs</h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Date Filter */}
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Date</label>
              <input
                type="date"
                value={dateFilter}
                max={todayStr}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Action Filter */}
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Actions</option>
                <option value="IN">Entries (IN)</option>
                <option value="OUT">Exits (OUT)</option>
              </select>
            </div>
          </div>

          {/* Quick date buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange('date', todayStr)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                dateFilter === todayStr
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                handleFilterChange('date', yesterday.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 rounded-lg text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              Yesterday
            </button>
            {(dateFilter || actionFilter !== 'ALL') && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 rounded-lg text-xs bg-red-900/40 text-red-300 hover:bg-red-900/60 transition-colors"
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Total */}
        <p className="text-slate-400 text-sm">{total} records found</p>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty */}
        {!loading && logs.length === 0 && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-300">No logs found for these filters</p>
          </div>
        )}

        {/* Logs List */}
        {!loading && logs.map((log) => (
          <div key={log._id}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className={`px-4 py-2 text-xs font-bold ${
              log.action === 'OUT'
                ? 'bg-red-900/40 text-red-300'
                : 'bg-green-900/40 text-green-300'
            }`}>
              {log.action === 'OUT' ? '🔴 EXIT' : '🟢 ENTRY'} — {formatDateTime(log.scannedAt)}
            </div>

            <div className="p-4 flex items-center gap-3">
              {/* Student Photo */}
              {log.studentId?.photoUrl ? (
                <img src={log.studentId.photoUrl} alt=""
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-slate-600" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                  👤
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">
                  {log.studentId?.name || 'Unknown Student'}
                </p>
                <p className="text-slate-400 text-xs">{log.studentId?.rollNo}</p>
                <p className="text-slate-400 text-xs">
                  Block {log.studentId?.hostelBlock} — Room {log.studentId?.roomNo}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-slate-300 text-xs font-medium">
                  {log.guardId?.name || 'Unknown Guard'}
                </p>
                <p className="text-slate-500 text-xs">{log.gate}</p>
                <p className="text-slate-600 text-xs mt-1">
                  {log.previousStatus} → {log.newStatus}
                </p>
                {log.isFlagged && (
                  <span className="text-yellow-400 text-xs">⚠️ Flagged</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg text-sm transition-colors"
            >
              ← Previous
            </button>
            <span className="text-slate-400 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg text-sm transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        

      </div>
    </div>
  );
};

export default AdminLogs;