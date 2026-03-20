import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, Loader2, Building2, Clock, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';

const COURSES = ['B.Tech', 'B.Pharm', 'BBA', 'MCA'];
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
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    course: '', branch: '', year_of_grad: '', dept: '', section: '', is_cr: false, phone: ''
  });
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'role' && value === 'cr') {
      setForm(prev => ({ ...prev, is_cr: true }));
    } else if (name === 'role') {
      setForm(prev => ({ ...prev, is_cr: false }));
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    // Validate Step 1
    if (!form.name || !form.email || !form.password || form.password.length < 6) return;
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await register({
      ...form,
      year_of_grad: form.year_of_grad ? parseInt(form.year_of_grad) : null,
    });
    
    if (result && result.pending) {
      setIsPendingApproval(true);
    } else if (result && result.success) {
      setSuccessMessage('Account creation successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  const isStudentOrCR = form.role === 'student' || form.role === 'cr';
  const isFacultyOrCR = form.role === 'faculty' || form.role === 'cr';

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
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {step === 1 ? 'Step 1: Account Information' : 'Step 2: Additional Details'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm text-center font-semibold">
              {successMessage}
            </div>
          )}

          {isPendingApproval ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Registration Request Submitted!</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Your request has been submitted to admin. You will be able to log in once it's approved.
              </p>
              <Link to="/login" className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center">
                Back to Login
              </Link>
            </div>
          ) : !successMessage && (
            <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-4">
              
              {step === 1 && (
                <>
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
                          placeholder="you@email.com" className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                      </div>
                    </div>
                  </div>

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

                  <button type="submit"
                    className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 mt-4">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  {isStudentOrCR && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Course</label>
                          <select name="course" required value={form.course} onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 appearance-none"
                            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                            <option value="">Select</option>
                            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Branch</label>
                          <select name="branch" required value={form.branch} onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 appearance-none"
                            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                            <option value="">Select</option>
                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Graduation Year</label>
                          <select name="year_of_grad" required value={form.year_of_grad} onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 appearance-none"
                            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                            <option value="">Select</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Section</label>
                          <select name="section" required value={form.section} onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 appearance-none"
                            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                            <option value="">Select</option>
                            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {isFacultyOrCR && (
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Phone Number (Verification)</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        <input name="phone" type="tel" required value={form.phone} onChange={handleChange}
                          placeholder="+91 9876543210" className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setStep(1)}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all flex items-center justify-center">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button type="submit" disabled={isLoading}
                      className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {!isPendingApproval && !successMessage && (
            <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
