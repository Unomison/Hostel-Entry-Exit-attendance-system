import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';
import toast from 'react-hot-toast';

const AdminGuards = () => {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', assignedGate: 'Main Gate',
  });

  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    try {
      const response = await api.get('/admin/guards');
      setGuards(response.data.guards);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load guards');
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/guards', formData);
      toast.success('Guard account created!');
      setFormData({ name: '', email: '', password: '', phone: '', assignedGate: 'Main Gate' });
      setShowForm(false);
      fetchGuards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create guard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (guardId, currentStatus) => {
    try {
      const response = await api.put(`/admin/guards/${guardId}/toggle`);
      toast.success(response.data.message);
      fetchGuards();
    } catch (err) {
      toast.error('Failed to update guard status');
    }
  };

  const inputClass = "w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500";

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Manage Guards" />

<div className="max-w-2xl mx-auto px-4 pt-4">
  <Link to="/admin/dashboard"
    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors">
    ← Back to Dashboard
  </Link>
</div>

      <div className="max-w-2xl mx-auto p-4 mt-4 space-y-4">

        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-slate-400 text-sm">{guards.length} guard accounts</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? '✕ Cancel' : '+ New Guard'}
          </button>
        </div>

        {/* Create Guard Form */}
        {showForm && (
          <div className="bg-slate-800 rounded-2xl p-5 border border-purple-700">
            <h3 className="text-white font-semibold mb-4">Create Guard Account</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-xs mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Guard name"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-xs mb-1 block">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit number"
                    required
                    maxLength={10}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300 text-xs mb-1 block">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="guard@hostel.com"
                  required
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-xs mb-1 block">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-xs mb-1 block">Assigned Gate</label>
                  <input
                    type="text"
                    value={formData.assignedGate}
                    onChange={(e) => setFormData({ ...formData, assignedGate: e.target.value })}
                    placeholder="Main Gate"
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Guard Account'}
              </button>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Guards List */}
        {!loading && guards.length === 0 && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <p className="text-slate-300">No guards yet. Create the first one above.</p>
          </div>
        )}

        {!loading && guards.map((guard) => (
          <div key={guard._id}
            className={`bg-slate-800 rounded-xl p-4 border ${guard.isActive ? 'border-slate-700' : 'border-red-900/50'} flex items-center gap-3`}>

            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${guard.isActive ? 'bg-green-900/50' : 'bg-slate-700'}`}>
              🛡️
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold truncate">{guard.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  guard.isActive
                    ? 'bg-green-900/60 text-green-300'
                    : 'bg-red-900/60 text-red-300'
                }`}>
                  {guard.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-slate-400 text-xs">{guard.email}</p>
              <p className="text-slate-500 text-xs">{guard.assignedGate} • {guard.phone}</p>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => handleToggle(guard._id, guard.isActive)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors ${
                guard.isActive
                  ? 'bg-red-900/40 hover:bg-red-900/70 text-red-300 border border-red-800'
                  : 'bg-green-900/40 hover:bg-green-900/70 text-green-300 border border-green-800'
              }`}
            >
              {guard.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}

       

      </div>
    </div>
  );
};

export default AdminGuards;