import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    student: 'text-blue-400',
    guard: 'text-green-400',
    admin: 'text-purple-400',
  };

  const roleIcons = {
    student: '👨‍🎓',
    guard: '🛡️',
    admin: '⚙️',
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-white font-bold text-lg">{title}</h1>
          <p className={`text-xs font-medium ${roleColors[user?.role]}`}>
            {roleIcons[user?.role]} {user?.name}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;