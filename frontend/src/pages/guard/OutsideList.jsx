import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';

const OutsideList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [blocks, setBlocks] = useState(['ALL']);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchOutsideStudents();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOutsideStudents();
    }, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchOutsideStudents = async () => {
    try {
      const url = filter === 'ALL'
        ? '/guard/outside-list'
        : `/guard/outside-list?block=${filter}`;

      const response = await api.get(url);
      setStudents(response.data.students);
      setLastRefresh(new Date());

      // Extract unique hostel blocks for filter
      if (filter === 'ALL') {
        const uniqueBlocks = ['ALL', ...new Set(
          response.data.students.map(s => s.hostelBlock)
        ).values()].sort();
        setBlocks(uniqueBlocks);
      }

      setLoading(false);
      setError('');
    } catch (err) {
      setError('Failed to load outside students');
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  const formatRefreshTime = () => {
    return lastRefresh.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Students Outside" />

      <div className="max-w-md mx-auto p-4 mt-4 space-y-4">

        {/* Header Stats */}
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-red-300 text-sm font-medium">Currently Outside</p>
            <p className="text-white text-3xl font-bold">{students.length}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-xs">Last updated</p>
            <p className="text-slate-400 text-xs">{formatRefreshTime()}</p>
            <button
              onClick={fetchOutsideStudents}
              className="text-blue-400 text-xs hover:underline mt-1"
            >
              Refresh now
            </button>
          </div>
        </div>

        {/* Block Filter */}
        {blocks.length > 2 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {blocks.map(block => (
              <button
                key={block}
                onClick={() => setFilter(block)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === block
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {block === 'ALL' ? 'All Blocks' : `Block ${block}`}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
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
        {!loading && !error && students.length === 0 && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
            <div className="text-4xl mb-3">🏠</div>
            <p className="text-slate-300 font-medium">All students are inside</p>
            <p className="text-slate-500 text-sm mt-2">
              {filter !== 'ALL' ? `No students from Block ${filter} are outside` : 'No students are currently outside the hostel'}
            </p>
          </div>
        )}

        {/* Student List */}
        {!loading && students.length > 0 && (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student._id}
                className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-3"
              >
                {/* Photo */}
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-red-500 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0 border-2 border-slate-600">
                    👤
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{student.name}</p>
                  <p className="text-slate-400 text-xs">{student.rollNo}</p>
                  <p className="text-slate-400 text-xs">
                    Block {student.hostelBlock} — Room {student.roomNo}
                  </p>
                  <p className="text-slate-500 text-xs">📱 {student.phone}</p>
                </div>

                {/* Exit Time */}
                <div className="text-right flex-shrink-0">
                  <span className="bg-red-900/60 text-red-300 text-xs px-2 py-0.5 rounded-full border border-red-700">
                    OUT
                  </span>
                  <p className="text-slate-500 text-xs mt-1">
                    since {formatTime(student.lastScanTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Link */}
        <Link
          to="/guard/dashboard"
          className="block text-center text-slate-400 hover:text-white text-sm transition-colors py-2"
        >
          ← Back to Scanner
        </Link>

      </div>
    </div>
  );
};

export default OutsideList;