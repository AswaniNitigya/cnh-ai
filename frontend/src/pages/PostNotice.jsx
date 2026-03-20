import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Loader2 } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

const BRANCHES = ['all', 'CSE', 'ECE', 'EE', 'ME', 'CE', 'IT', 'Chemical'];
const YEARS = ['all', '2025', '2026', '2027', '2028', '2029'];
const SECTIONS = ['all', 'A', 'B', 'C', 'D'];
const CATEGORIES = ['academic', 'exam', 'event', 'placement', 'general'];

const PostNotice = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [targetBranch, setTargetBranch] = useState('all');
  const [targetYear, setTargetYear] = useState('all');
  const [targetSection, setTargetSection] = useState('all');
  const [priority, setPriority] = useState('none');
  const [pinDuration, setPinDuration] = useState('none');
  const [sendNotification, setSendNotification] = useState(false);
  const [posting, setPosting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchNotice();
    }
  }, [id]);

  const fetchNotice = async () => {
    try {
      setLoadingInitial(true);
      const { data } = await api.get(`/notices/${id}`);
      const notice = data.notice;
      
      setTitle(notice.title || '');
      setContent(notice.content || '');
      setCategory(notice.category || 'general');
      setPriority(notice.priority || 'none');
      
      if (notice.target_criteria) {
        setTargetBranch(notice.target_criteria.branch || 'all');
        setTargetYear(notice.target_criteria.year || 'all');
        setTargetSection(notice.target_criteria.section || 'all');
      }
    } catch (err) {
      console.error('Failed to fetch notice for edit:', err);
      alert('Could not load notice for editing.');
      navigate('/');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handlePost = async (status = 'active') => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content.');
      return;
    }

    try {
      setPosting(true);
      const targetCriteria = {};
      if (targetBranch !== 'all') targetCriteria.branch = targetBranch;
      if (targetYear !== 'all') targetCriteria.year = targetYear;
      if (targetSection !== 'all') targetCriteria.section = targetSection;
      if (!targetCriteria.branch && !targetCriteria.year && !targetCriteria.section) {
        targetCriteria.global = true;
      }

      const payload = {
        title,
        content,
        category,
        priority: priority === 'none' ? null : priority,
        pinned_duration: pinDuration === 'none' ? null : pinDuration,
        target_criteria: targetCriteria,
        send_notification: sendNotification,
      };

      if (isEditMode) {
        await api.put(`/notices/${id}`, payload);
      } else {
        await api.post('/notices/manual', payload);
      }

      navigate('/');
    } catch (err) {
      console.error('Post error:', err);
      alert('Failed to post notice: ' + (err.response?.data?.error || err.message));
    } finally {
      setPosting(false);
    }
  };

  const isCR = user?.role === 'cr';
  const canNotify = user?.role === 'super_admin' || user?.role === 'cr';

  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-500)' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{isEditMode ? 'Edit Notice' : 'Post Notice'}</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        {isEditMode ? 'Update this notice details, priority, or pinning' : (isCR ? 'Post a notice to your class section' : 'Create and distribute a new notice')}
      </p>

      <div className="glass-card p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Notice Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. End Semester Examination Schedule" className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8}
            placeholder="Full notice content..." className="w-full rounded-lg border px-4 py-3 text-sm resize-y outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 appearance-none"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Priority Tag</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 appearance-none"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
              <option value="none">None</option>
              <option value="p1">P1 (High)</option>
              <option value="p2">P2 (Medium)</option>
              <option value="p3">P3 (Low)</option>
            </select>
          </div>
        </div>

        {/* Target audience (disabled for CR - auto-set) */}
        {!isCR && (
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Target Audience</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Branch</label>
                <select value={targetBranch} onChange={(e) => setTargetBranch(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  {BRANCHES.map(b => <option key={b} value={b}>{b === 'all' ? 'All Branches' : b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Year</label>
                <select value={targetYear} onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  {YEARS.map(y => <option key={y} value={y}>{y === 'all' ? 'All Years' : y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Section</label>
                <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  {SECTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sections' : `Section ${s}`}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Pin Duration */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Pin Notice (Optional)</label>
          <select value={pinDuration} onChange={(e) => setPinDuration(e.target.value)}
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 appearance-none"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <option value="none">Do not pin</option>
            <option value="6h">6 Hours</option>
            <option value="24h">24 Hours</option>
            <option value="1w">1 Week</option>
            <option value="1m">1 Month</option>
          </select>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Pinning will keep this notice at the top for the target audience.
          </p>
        </div>

        {isCR && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm">
            As a Class Representative, this notice will automatically be targeted to your class: {user?.branch} {user?.section ? `Section ${user.section}` : ''} {user?.year_of_grad || ''}
          </div>
        )}

        {/* Notify Checkbox */}
        {canNotify && !isEditMode && (
          <div className="flex items-center gap-3 p-4 rounded-lg border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <input 
              type="checkbox" 
              id="notify_users" 
              checked={sendNotification} 
              onChange={(e) => setSendNotification(e.target.checked)} 
              className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500" 
            />
            <label htmlFor="notify_users" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Send Push Notification
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                This will alert targeted users via the in-app Bell menu and their browser push notifications.
              </p>
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          <button onClick={() => handlePost('active')} disabled={posting}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isEditMode ? 'Save Changes' : 'Post Notice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostNotice;
