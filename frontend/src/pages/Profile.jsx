import useAuthStore from '../store/authStore';
import { User, Mail, Building2, Calendar, BookOpen, GraduationCap, Shield } from 'lucide-react';
import { formatDate } from '../lib/utils';

const Profile = () => {
  const { user } = useAuthStore();

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

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="glass-card p-8 text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
        </div>
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{user.name}</h1>
        <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{user.role?.replace('_', ' ')}</p>
        {user.branch && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {user.branch} {user.section ? `• Section ${user.section}` : ''} {user.year_of_grad ? `• ${user.year_of_grad}` : ''}
          </p>
        )}
        {user.is_cr && (
          <span className="inline-block mt-2 badge badge-active text-xs">Class Representative</span>
        )}
      </div>

      {/* Info cards */}
      <div className="glass-card divide-y" style={{ '--tw-divide-opacity': 1 }}>
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
    </div>
  );
};

export default Profile;
