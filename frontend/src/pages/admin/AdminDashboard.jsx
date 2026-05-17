import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import api from '../../utils/api';

const StatCard = ({ icon, label, value, color, sublabel }) => (
  <div className={`bg-slate-800 rounded-2xl p-5 border ${color} flex flex-col gap-2`}>
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-white text-3xl font-bold">{value ?? '...'}</p>
    {sublabel && <p className="text-slate-500 text-xs">{sublabel}</p>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
      setRecentScans(response.data.recentScans);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short',
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Admin Dashboard" />

      <div className="max-w-2xl mx-auto p-4 mt-4 space-y-6">

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon="👨‍🎓"
              label="Total Students"
              value={stats?.totalStudents}
              color="border-slate-700"
            />
            <StatCard
              icon="🟢"
              label="Inside Hostel"
              value={stats?.studentsIN}
              color="border-green-800"
              sublabel="Currently IN"
            />
            <StatCard
              icon="🔴"
              label="Outside Hostel"
              value={stats?.studentsOUT}
              color="border-red-800"
              sublabel="Currently OUT"
            />
            <StatCard
              icon="📊"
              label="Scans Today"
              value={stats?.scansToday}
              color="border-blue-800"
              sublabel={`${stats?.totalScans} total`}
            />
            <StatCard
              icon="🛡️"
              label="Active Guards"
              value={stats?.activeGuards}
              color="border-slate-700"
              sublabel={`${stats?.totalGuards} total`}
            />
          </div>
        )}

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 gap-3">
          <Link to="/admin/guards"
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 text-white transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="font-semibold">Manage Guards</p>
                <p className="text-slate-400 text-xs">Create & activate/deactivate accounts</p>
              </div>
            </div>
            <span className="text-slate-400">→</span>
          </Link>

          <Link to="/admin/students"
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 text-white transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👨‍🎓</span>
              <div>
                <p className="font-semibold">All Students</p>
                <p className="text-slate-400 text-xs">View status, search, filter by block</p>
              </div>
            </div>
            <span className="text-slate-400">→</span>
          </Link>

          <Link to="/admin/logs"
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 text-white transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-semibold">Audit Logs</p>
                <p className="text-slate-400 text-xs">Full scan history with date filters</p>
              </div>
            </div>
            <span className="text-slate-400">→</span>
          </Link>
        </div>

        {/* Recent Activity */}
        {recentScans.length > 0 && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <h3 className="text-white font-semibold">Recent Activity</h3>
            </div>
            <div className="divide-y divide-slate-700">
              {recentScans.map((scan) => (
                <div key={scan._id} className="px-4 py-3 flex items-center gap-3">
                  {scan.studentId?.photoUrl ? (
                    <img
                      src={scan.studentId.photoUrl}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                      👤
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {scan.studentId?.name || 'Unknown'}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {scan.guardId?.name} • {scan.gate}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      scan.action === 'OUT'
                        ? 'bg-red-900/60 text-red-300'
                        : 'bg-green-900/60 text-green-300'
                    }`}>
                      {scan.action}
                    </span>
                    <p className="text-slate-500 text-xs mt-1">
                      {formatDate(scan.scannedAt)} {formatTime(scan.scannedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-slate-700">
              <Link to="/admin/logs" className="text-purple-400 text-sm hover:underline">
                View all logs →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;