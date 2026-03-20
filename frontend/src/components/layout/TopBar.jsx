import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Upload,
  User,
  Database,
  Users,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import useNotificationStore from '../../store/notificationStore';

const TopBar = () => {
  const { user, logout, hasRole } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mobileLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/notices', icon: Bell, label: 'Notices' },
    ...(hasRole('super_admin', 'faculty', 'cr')
      ? [{ to: '/post-notice', icon: FileText, label: 'Post Notice' }]
      : []),
    ...(hasRole('super_admin', 'faculty')
      ? [{ to: '/ocr-upload', icon: Upload, label: 'OCR Upload' }]
      : []),
    ...(hasRole('super_admin')
      ? [
          { to: '/admin', icon: Database, label: 'Admin Panel' },
          { to: '/users', icon: Users, label: 'Users' },
        ]
      : []),
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-16 border-b"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border outline-none transition-all focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </form>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: 'var(--text-secondary)' }}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            
            {/* Notif Dropdown */}
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 rounded-xl border shadow-lg z-50 overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                  <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                    <button onClick={() => { markAsRead('all'); setNotifOpen(false); }} className="text-xs text-brand-500 hover:text-brand-600">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} onClick={() => { markAsRead(n.id); if (n.link_id) navigate('/notice/' + n.link_id); setNotifOpen(false); }} className={`p-3 border-b cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${!n.is_read ? 'bg-brand-500/5' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User avatar */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-hover)' }}>
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>
                  {user.branch} {user.year_of_grad ? `• ${user.year_of_grad}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div
            className="fixed top-0 left-0 w-72 h-full z-[60] md:hidden animate-slide-in flex flex-col"
            style={{ background: 'var(--bg-sidebar)' }}
          >
            {/* Mobile menu header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">CNH</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile nav links */}
            <nav className="flex-1 py-4 px-3 space-y-1">
              {mobileLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-brand-500/20 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Mobile logout */}
            <div className="border-t border-white/10 p-3">
              {user && (
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role?.replace('_', ' ')}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TopBar;
