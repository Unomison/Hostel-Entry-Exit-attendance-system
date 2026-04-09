import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 mb-6">The page you are looking for does not exist.</p>
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;