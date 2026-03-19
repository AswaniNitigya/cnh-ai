import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  FileText,
  Search,
  Settings,
  User,
  Upload,
  Database,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/notices', icon: Bell, label: 'Notices' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin', icon: Database, label: 'Admin Panel' },
    { to: '/notices', icon: Bell, label: 'Notices' },
    { to: '/post-notice', icon: FileText, label: 'Post Notice' },
    { to: '/ocr-upload', icon: Upload, label: 'OCR Upload' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const facultyLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/notices', icon: Bell, label: 'Notices' },
    { to: '/post-notice', icon: FileText, label: 'Post Notice' },
    { to: '/ocr-upload', icon: Upload, label: 'OCR Upload' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const crLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/notices', icon: Bell, label: 'Notices' },
    { to: '/post-notice', icon: FileText, label: 'Post Notice' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const getLinks = () => {
    if (hasRole('super_admin')) return adminLinks;
    if (hasRole('faculty')) return facultyLinks;
    if (hasRole('cr')) return crLinks;
    return studentLinks;
  };

  const links = getLinks();

  return (
    <aside
      className={`hidden md:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
      style={{ background: 'var(--bg-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-lg tracking-tight">CNH</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-500/20 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3">
        {user && !collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role?.replace('_', ' ')}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-brand-600 transition-colors hidden md:flex"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
};

export default Sidebar;
