import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [blockFilter, setBlockFilter] = useState('ALL');
  const [blocks, setBlocks] = useState(['ALL']);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, search, statusFilter, blockFilter]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data.students);

      // Extract unique blocks
      const uniqueBlocks = ['ALL', ...new Set(
        response.data.students.map(s => s.hostelBlock)
      )].sort();
      setBlocks(uniqueBlocks);

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...students];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(s => s.currentStatus === statusFilter);
    }

    // Block filter
    if (blockFilter !== 'ALL') {
      result = result.filter(s => s.hostelBlock === blockFilter);
    }

    setFiltered(result);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="All Students" />

{/* Back Button */}
<div className="max-w-2xl mx-auto px-4 pt-4">
  <Link to="/admin/dashboard"
    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors">
    ← Back to Dashboard
  </Link>
</div>

      <div className="max-w-2xl mx-auto p-4 mt-4 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
            <p className="text-white font-bold text-xl">{students.length}</p>
            <p className="text-slate-400 text-xs">Total</p>
          </div>
          <div className="bg-green-900/30 rounded-xl p-3 border border-green-800 text-center">
            <p className="text-green-300 font-bold text-xl">
              {students.filter(s => s.currentStatus === 'IN').length}
            </p>
            <p className="text-slate-400 text-xs">Inside</p>
          </div>
          <div className="bg-red-900/30 rounded-xl p-3 border border-red-800 text-center">
            <p className="text-red-300 font-bold text-xl">
              {students.filter(s => s.currentStatus === 'OUT').length}
            </p>
            <p className="text-slate-400 text-xs">Outside</p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by name, roll number, or email..."
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500"
        />

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'IN', 'OUT'].map(s => (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? s === 'IN' ? 'bg-green-600 text-white'
                    : s === 'OUT' ? 'bg-red-600 text-white'
                    : 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {s === 'ALL' ? 'All Status' : s === 'IN' ? '🟢 Inside' : '🔴 Outside'}
            </button>
          ))}
          {blocks.map(b => (
            b !== 'ALL' && (
              <button key={b}
                onClick={() => setBlockFilter(blockFilter === b ? 'ALL' : b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  blockFilter === b
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Block {b}
              </button>
            )
          ))}
        </div>

        {/* Count */}
        <p className="text-slate-400 text-sm">
          Showing {filtered.length} of {students.length} students
        </p>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Student List */}
        {!loading && filtered.length === 0 && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
            <div className="text-4xl mb-3">👨‍🎓</div>
            <p className="text-slate-300">No students match your filters</p>
          </div>
        )}

        {!loading && filtered.map((student) => (
          <div key={student._id}
            className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-3">

            {/* Photo */}
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.name}
                className={`w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 ${
                  student.currentStatus === 'IN' ? 'border-green-500' : 'border-red-500'
                }`}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                👤
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-semibold">{student.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  student.currentStatus === 'IN'
                    ? 'bg-green-900/60 text-green-300'
                    : 'bg-red-900/60 text-red-300'
                }`}>
                  {student.currentStatus}
                </span>
              </div>
              <p className="text-slate-400 text-xs">{student.rollNo}</p>
              <p className="text-slate-400 text-xs">
                Block {student.hostelBlock} — Room {student.roomNo}
              </p>
             <p className="text-slate-400 text-xs">📱 {student.phone}</p>
<p className="text-slate-500 text-xs">
  Last scan: {formatTime(student.lastScanTime)}
</p>
            </div>

          </div>
        ))}

        

      </div>
    </div>
  );
};

export default AdminStudents;