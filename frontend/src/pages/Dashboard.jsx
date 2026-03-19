import { useState, useEffect } from 'react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import NoticeCard from '../components/NoticeCard';
import { Bell, Loader2 } from 'lucide-react';

const CATEGORIES = ['all', 'academic', 'exam', 'event', 'placement', 'general'];

const Dashboard = () => {
  const { user } = useAuthStore();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchNotices();
  }, [activeFilter]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params = activeFilter !== 'all' ? { category: activeFilter } : {};
      const { data } = await api.get('/notices/feed', { params });
      setNotices(data.notices || []);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Personalized Notices
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {user?.name ? `Hi ${user.name} 👋 — ` : ''}Here are the latest notices for you
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`filter-chip ${activeFilter === cat ? 'active' : ''}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Notice grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-500)' }} />
        </div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {notices.map((notice, i) => (
            <NoticeCard key={notice.id} notice={notice} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No notices found
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {activeFilter !== 'all'
              ? `No ${activeFilter} notices right now. Try another category.`
              : 'No notices have been posted yet. Check back later!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
