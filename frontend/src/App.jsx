import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentHistory from './pages/student/StudentHistory';
import ChangePassword from './pages/student/ChangePassword';

// Guard pages
import GuardDashboard from './pages/guard/GuardDashboard';
import OutsideList from './pages/guard/OutsideList';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGuards from './pages/admin/AdminGuards';
import AdminStudents from './pages/admin/AdminStudents';
import AdminLogs from './pages/admin/AdminLogs';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/history" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentHistory />
            </ProtectedRoute>
          } />
          <Route path="/student/change-password" element={
            <ProtectedRoute allowedRoles={['student']}>
              <ChangePassword />
            </ProtectedRoute>
          } />

          {/* Guard routes */}
          <Route path="/guard/dashboard" element={
            <ProtectedRoute allowedRoles={['guard']}>
              <GuardDashboard />
            </ProtectedRoute>
          } />

          <Route path="/guard/outside-list" element={
  <ProtectedRoute allowedRoles={['guard']}>
    <OutsideList />
  </ProtectedRoute>
} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
<Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
<Route path="/admin/guards" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminGuards />
  </ProtectedRoute>
} />
<Route path="/admin/students" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminStudents />
  </ProtectedRoute>
} />
<Route path="/admin/logs" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminLogs />
  </ProtectedRoute>
} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;