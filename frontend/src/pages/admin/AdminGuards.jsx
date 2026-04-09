import Navbar from '../../components/shared/Navbar';
import { Link } from 'react-router-dom';

const AdminGuards = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Manage Guards" />
      <div className="max-w-2xl mx-auto p-4 mt-4">
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
          <div className="text-4xl mb-3">🛡️</div>
          <p className="text-slate-300 font-medium">Guard Management — Coming in Phase 6</p>
          <Link to="/admin/dashboard" className="inline-block mt-4 text-purple-400 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
export default AdminGuards;