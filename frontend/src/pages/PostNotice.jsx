import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Save, Loader2 } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

const BRANCHES = ['all', 'CSE', 'ECE', 'EE', 'ME', 'CE', 'IT', 'Chemical'];
const YEARS = ['all', '2025', '2026', '2027', '2028', '2029'];
const SECTIONS = ['all', 'A', 'B', 'C', 'D'];
const CATEGORIES = ['academic', 'exam', 'event', 'placement', 'general'];

const PostNotice = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [targetBranch, setTargetBranch] = useState('all');
  const [targetYear, setTargetYear] = useState('all');
  const [targetSection, setTargetSection] = useState('all');
  const [posting, setPosting] = useState(false);

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

      await api.post('/notices/manual', {
        title,
        content,
        category,
        target_criteria: targetCriteria,
      });

      navigate('/');
    } catch (err) {
      console.error('Post error:', err);
      alert('Failed to post notice: ' + (err.response?.data?.error || err.message));
    } finally {
      setPosting(false);
    }
  };

  const isCR = user?.role === 'cr';

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Post Notice</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        {isCR ? 'Post a notice to your class section' : 'Create and distribute a new notice'}
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

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 appearance-none"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
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

        {isCR && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm">
            As a Class Representative, this notice will automatically be targeted to your class: {user?.branch} {user?.section ? `Section ${user.section}` : ''} {user?.year_of_grad || ''}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={() => handlePost('draft')} disabled={posting}
            className="flex-1 py-2.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <Save className="w-4 h-4" /> Save as Draft
          </button>
          <button onClick={() => handlePost('active')} disabled={posting}
            className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post Notice
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostNotice;
