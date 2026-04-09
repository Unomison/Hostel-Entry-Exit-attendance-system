import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';

const StudentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/student/history?page=${page}&limit=20`);
      setHistory(response.data.history);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
      setLoading(false);
    } catch (err) {
      setError('Failed to load history');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="IN/OUT History" />

      <div className="max-w-md mx-auto p-4 mt-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-400 text-sm">
            {total > 0 ? `${total} total scans` : 'No scans yet'}
          </p>
          <Link to="/student/dashboard" className="text-blue-400 hover:underline text-sm">
            ← Back
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-300 font-medium">No scan history yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Your IN/OUT records will appear here after your first scan
            </p>
          </div>
        )}

        {/* History List */}
        {!loading && history.length > 0 && (
          <div className="space-y-3">
            {history.map((log, index) => (
              <div
                key={log._id}
                className="bg-slate-800 rounded-xl p-4 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  {/* Action Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    log.action === 'OUT'
                      ? 'bg-red-900/60 text-red-300 border border-red-700'
                      : 'bg-green-900/60 text-green-300 border border-green-700'
                  }`}>
                    {log.action === 'OUT' ? '🔴 Exited' : '🟢 Entered'}
                  </span>

                  {/* Time */}
                  <span className="text-white font-semibold text-sm">
                    {formatTime(log.scannedAt)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  {/* Date */}
                  <span className="text-slate-400 text-xs">
                    📅 {formatDate(log.scannedAt)}
                  </span>

                  {/* Gate & Guard */}
                  <span className="text-slate-500 text-xs">
                    {log.gate} • {log.guardId?.name || 'Guard'}
                  </span>
                </div>

                {/* Status arrow */}
                <div className="mt-2 text-slate-500 text-xs">
                  {log.previousStatus} → {log.newStatus}
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
        )}
      </div>
    </div>
  );
};

export default StudentHistory;