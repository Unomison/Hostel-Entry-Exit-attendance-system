import Navbar from '../../components/shared/Navbar';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Admin Dashboard" />
      <div className="max-w-2xl mx-auto p-4 mt-4">

        <div className="grid grid-cols-2 gap-3">
          <Link to="/admin/guards"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-5 text-white transition-colors">
            <div className="text-2xl mb-2">🛡️</div>
            <p className="font-semibold">Manage Guards</p>
            <p className="text-slate-400 text-xs mt-1">Create & manage guard accounts</p>
          </Link>
          <Link to="/admin/students"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-5 text-white transition-colors">
            <div className="text-2xl mb-2">👨‍🎓</div>
            <p className="font-semibold">All Students</p>
            <p className="text-slate-400 text-xs mt-1">View student list & status</p>
          </Link>
          <Link to="/admin/logs"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-5 text-white transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <p className="font-semibold">Audit Logs</p>
            <p className="text-slate-400 text-xs mt-1">All scan history</p>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;