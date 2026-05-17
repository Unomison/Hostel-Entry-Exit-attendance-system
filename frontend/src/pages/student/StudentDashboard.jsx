import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import QRDisplay from './QRDisplay';
import api from '../../utils/api';

const StudentDashboard = () => {
  const { user, updateUser } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(user?.currentStatus || 'IN');
  const [lastScanTime, setLastScanTime] = useState(null);
  const [statusUpdated, setStatusUpdated] = useState(false);

  // Called when QR is scanned — refreshes student status from backend
  const handleStatusChange = useCallback(async () => {
    try {
      const response = await api.get('/student/status');
      const { currentStatus: newStatus, lastScanTime: scanTime } = response.data;
      setCurrentStatus(newStatus);
      setLastScanTime(scanTime);
      setStatusUpdated(true);
      // Update global auth context so status shows correctly everywhere
      updateUser({ currentStatus: newStatus });
      // Hide the "status updated" flash after 3 seconds
      setTimeout(() => setStatusUpdated(false), 3000);
    } catch (err) {
      console.error('Failed to refresh status:', err);
    }
  }, [updateUser]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Student Dashboard" />

      <div className="max-w-md mx-auto p-4 space-y-4 mt-4">

        {/* Status Updated Flash */}
        {statusUpdated && (
          <div className="bg-green-900/50 border border-green-600 rounded-xl px-4 py-3 text-green-300 text-sm text-center animate-pulse">
            ✅ Status updated to <strong>{currentStatus}</strong>
            {lastScanTime && ` at ${formatTime(lastScanTime)}`}
          </div>
        )}

        {/* Student Info Card */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center gap-4">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                👤
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg">{user?.name}</h2>
              <p className="text-slate-400 text-sm">{user?.rollNo}</p>
              <p className="text-slate-400 text-xs">📱 {user?.phone}</p>
              <p className="text-slate-400 text-sm">
                Block {user?.hostelBlock} — Room {user?.roomNo}
              </p>
              {/* Current Status Badge */}
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentStatus === 'IN'
                    ? 'bg-green-900/60 text-green-300 border border-green-700'
                    : 'bg-red-900/60 text-red-300 border border-red-700'
                }`}>
                  {currentStatus === 'IN' ? '🟢 Inside Hostel' : '🔴 Outside Hostel'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-center mb-4">
            📱 Your Entry/Exit QR Code
          </h3>
          <QRDisplay onStatusChange={handleStatusChange} />
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <Link
            to="/student/history"
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 text-white transition-colors"
          >
            <span>📋 View IN/OUT History</span>
            <span className="text-slate-400">→</span>
          </Link>
          <Link
            to="/student/change-password"
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 text-white transition-colors"
          >
            <span>🔒 Change Password</span>
            <span className="text-slate-400">→</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;