import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'student') navigate('/student/dashboard', { replace: true });
      else if (user.role === 'guard') navigate('/guard/dashboard', { replace: true });
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password, role });
      const { token, user: userData } = response.data;
      login(userData, token);
      toast.success(`Welcome, ${userData.name}!`);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show spinner while checking stored login
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const roles = [
    { key: 'student', label: '👨‍🎓 Student', active: 'bg-blue-600', ring: 'ring-blue-500' },
    { key: 'guard', label: '🛡️ Guard', active: 'bg-green-600', ring: 'ring-green-500' },
    { key: 'admin', label: '⚙️ Admin', active: 'bg-purple-600', ring: 'ring-purple-500' },
  ];

  const submitColors = {
    student: 'bg-blue-600 hover:bg-blue-700',
    guard: 'bg-green-600 hover:bg-green-700',
    admin: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-white">Hostel QR System</h1>
          <p className="text-slate-400 text-sm mt-1">Entry-Exit Attendance Management</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">

          <div className="mb-6">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Login as</p>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold text-white transition-all ${
                    role === r.key
                      ? `${r.active} ring-2 ${r.ring} ring-offset-2 ring-offset-slate-800`
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${submitColors[role]} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {role === 'student' && (
            <p className="text-center text-slate-500 text-sm mt-4">
              New student?{' '}
              <Link to="/register" className="text-blue-400 hover:underline">
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default LoginPage;