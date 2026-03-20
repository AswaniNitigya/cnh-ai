import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import useNotificationStore from './store/notificationStore';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NoticeDetail from './pages/NoticeDetail';
import AdminPanel from './pages/AdminPanel';
import OCRUpload from './pages/OCRUpload';
import PostNotice from './pages/PostNotice';
import Search from './pages/Search';
import Profile from './pages/Profile';
import { Home, Search as SearchIcon, Bookmark, User, Loader2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

// Protected layout with sidebar
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`transition-all duration-300 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'}`}>
        <TopBar />
        <main className="p-4 pb-24 md:p-6 md:pb-6 main-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {[
          { to: '/', icon: Home, label: 'Home' },
          { to: '/search', icon: SearchIcon, label: 'Search' },
          { to: '/notices', icon: Bookmark, label: 'Notices' },
          { to: '/profile', icon: User, label: 'Profile' },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-brand-500' : ''
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--brand-500)' : 'var(--text-muted)',
            })}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

// Auth guard
const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children || <Outlet />;
};

function App() {
  const { init, isInitializing, token } = useAuthStore();
  const { initTheme } = useThemeStore();
  const { fetchNotifications, setupPushNotifications } = useNotificationStore();

  useEffect(() => {
    initTheme();
    init();
  }, []);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      setupPushNotifications();
    }
  }, [token]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: 'var(--brand-500)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading College Notice Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notices" element={<Dashboard />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />

          {/* Faculty/CR/Admin routes */}
          <Route path="/post-notice" element={
            <ProtectedRoute roles={['super_admin', 'faculty', 'cr']}><PostNotice /></ProtectedRoute>
          } />
          <Route path="/edit-notice/:id" element={
            <ProtectedRoute roles={['super_admin', 'faculty', 'cr']}><PostNotice /></ProtectedRoute>
          } />

          {/* Admin/Faculty routes */}
          <Route path="/ocr-upload" element={
            <ProtectedRoute roles={['super_admin', 'faculty']}><OCRUpload /></ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['super_admin']}><AdminPanel /></ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute roles={['super_admin']}><AdminPanel /></ProtectedRoute>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
