import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, Loader2, Building2, Calendar, BookOpen, Clock } from 'lucide-react';
import useAuthStore from '../store/authStore';

const BRANCHES = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'IT', 'Chemical', 'Other'];
const YEARS = [2025, 2026, 2027, 2028, 2029];
const SECTIONS = ['A', 'B', 'C', 'D'];
const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'cr', label: 'Class Representative (CR)' },
  { value: 'faculty', label: 'Faculty' },
];

const Register = () => {
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    branch: '', year_of_grad: '', dept: '', section: '', is_cr: false,
  });
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [phone, setPhone] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'role' && value === 'cr') {
      setForm(prev => ({ ...prev, is_cr: true }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user requires approval
    const isMmmut = form.email.endsWith('@mmmut.ac.in');
    const isNormalStudent = form.role === 'student' && isMmmut;
    
    // If they need approval, and we haven't asked for phone yet, show popup
    if (!isNormalStudent && !showPhonePopup && !phone) {
      setShowPhonePopup(true);
      return;
    }

    clearError();
    const result = await register({
      ...form,
      phone,
      year_of_grad: form.year_of_grad ? parseInt(form.year_of_grad) : null,
    });
    
    if (result && result.pending) {
      setShowPhonePopup(false);
      setIsPendingApproval(true);
    } else if (result && result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>College Notice Hub</span>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Join CNH to receive targeted notices</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {isPendingApproval ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Registration Request Submitted!</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Your account request has been sent to the administrators for approval. You will be able to log in once it's approved.
              </p>
              <Link to="/login" className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input name="name" type="text" required value={form.name} onChange={handleChange}
                    placeholder="Rahul Sharma" className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder="you@mmmut.ac.in" className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              </div>
            </div>

            {/* Password & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input name="password" type="password" required minLength={6} value={form.password} onChange={handleChange}
                    placeholder="Min 6 characters" className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Role</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 appearance-none"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            {/* Branch, Year, Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Branch</label>
                <select name="branch" value={form.branch} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 appearance-none"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  <option value="">Select</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Graduation Year</label>
                <select name="year_of_grad" value={form.year_of_grad} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 appearance-none"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  <option value="">Select</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Section</label>
                <select name="section" value={form.section} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 appearance-none"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  <option value="">Select</option>
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input name="dept" type="text" value={form.dept} onChange={handleChange}
                  placeholder="e.g. Computer Science" className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          )}

          {!isPendingApproval && (
            <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">Sign In</Link>
            </p>
          )}
        </div>
      </div>

      {/* Phone Number Modal */}
      {showPhonePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Verification Required</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                To verify your details, you will be contacted on this phone number. An admin will approve your request shortly.
              </p>
              
              <div className="mb-6">
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210" 
                  required
                  className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPhonePopup(false)}
                  type="button"
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 font-semibold rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading || !phone}
                  type="button"
                  className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
