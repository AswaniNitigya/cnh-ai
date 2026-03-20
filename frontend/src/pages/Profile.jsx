import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { User, Mail, Building2, Calendar, BookOpen, GraduationCap, Shield, Lock, Loader2, LogOut } from 'lucide-react';
import { formatDate } from '../lib/utils';

const Profile = () => {
  const { user, changePassword, logout } = useAuthStore();
  const navigate = useNavigate();
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!user) return null;

  const fields = [
    { label: 'Full Name', value: user.name, icon: User },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Role', value: user.role?.replace('_', ' '), icon: Shield },
    { label: 'Branch', value: user.branch, icon: BookOpen },
    { label: 'Department', value: user.dept, icon: Building2 },
    { label: 'Graduation Year', value: user.year_of_grad, icon: Calendar },
    { label: 'Section', value: user.section, icon: GraduationCap },
  ].filter(f => f.value);

  const handlePassChange = (e) => {
    setPassForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return setMsg({ type: 'error', text: 'New passwords do not match.' });
    }
    if (passForm.newPassword.length < 6) {
      return setMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    }

    setIsSubmitting(true);
    setMsg({ type: '', text: '' });
    const result = await changePassword(passForm.currentPassword, passForm.newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setMsg({ type: 'success', text: 'Password updated successfully!' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMsg({ type: 'error', text: result.error || 'Failed to update password.' });
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="glass-card p-8 text-center bg-white dark:bg-gray-800">
        <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
        </div>
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{user.name}</h1>
        <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{user.role?.replace('_', ' ')}</p>
        {(user.branch || user.course) && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {user.course ? `${user.course} ` : ''}{user.branch} {user.section ? `• Section ${user.section}` : ''} {user.year_of_grad ? `• ${user.year_of_grad}` : ''}
          </p>
        )}
        {user.is_cr && (
          <span className="inline-block mt-2 badge badge-active text-xs px-2 py-1 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-md">Class Representative</span>
        )}
      </div>

      {/* Info cards */}
      <div className="glass-card divide-y bg-white dark:bg-gray-800" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--border-light)' }}>
        {fields.map((field) => (
          <div key={field.label} className="flex items-center gap-4 px-6 py-4" style={{ borderColor: 'var(--border-light)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-hover)' }}>
              <field.icon className="w-5 h-5" style={{ color: 'var(--brand-500)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.label}</p>
              <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{field.value}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4 px-6 py-4" style={{ borderColor: 'var(--border-light)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-hover)' }}>
            <Calendar className="w-5 h-5" style={{ color: 'var(--brand-500)' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Member Since</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatDate(user.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6 sm:p-8 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Lock className="w-5 h-5" style={{ color: 'var(--brand-500)' }} /> 
          Change Password
        </h2>
        
        {msg.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handlePassSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Current Password</label>
            <input name="currentPassword" type="password" required value={passForm.currentPassword} onChange={handlePassChange}
              className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>New Password</label>
              <input name="newPassword" type="password" required minLength={6} value={passForm.newPassword} onChange={handlePassChange}
                className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Confirm New Password</label>
              <input name="confirmPassword" type="password" required minLength={6} value={passForm.confirmPassword} onChange={handlePassChange}
                className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting}
              className="py-2.5 px-6 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Logout (Mobile Friendly) */}
      <div className="pt-2 pb-6 md:pb-0">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-100 dark:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
