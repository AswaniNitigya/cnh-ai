import { useState, useEffect } from 'react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import NoticeCard from '../components/NoticeCard';
import { Bell, Loader2 } from 'lucide-react';

const POSTED_CATEGORIES = ['all', 'academic', 'exam', 'event', 'placement', 'general'];
const SCRAPED_CATEGORIES = [
  { id: 'scraped_all', label: 'All Records' },
  { id: 'scraped_exam', label: 'Examination Notice' }
];
const COMING_SOON_CATEGORIES = ['Syllabus', 'Timetable'];

const Dashboard = () => {
  const { user } = useAuthStore();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('important');

  useEffect(() => {
    fetchNotices();
  }, [activeFilter]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      let params = {};
      
      if (activeFilter === 'important') {
        params.important = 'true';
      } else if (activeFilter.startsWith('scraped_')) {
        params.source = 'scraper';
        if (activeFilter === 'scraped_exam') {
          params.category = 'exam';
        }
      } else if (activeFilter !== 'all') {
        params.category = activeFilter;
        params.source = 'manual'; // Assuming posted notices are manual
      } else {
        // 'all' posted usually means manual, but if they just want everything manual:
        params.source = 'manual';
      }

      const { data } = await api.get('/notices/feed', { params });
      
      const sortedNotices = [...(data.notices || [])].sort((a, b) => {
        const aPinned = a.pinned_until && new Date(a.pinned_until) > new Date();
        const bPinned = b.pinned_until && new Date(b.pinned_until) > new Date();
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0; // maintain original chronological order
      });
      
      setNotices(sortedNotices);
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

      {/* Filter Layout */}
      <div className="mb-6 flex flex-col md:flex-row md:items-stretch gap-4 md:gap-8">
        
        {/* Left Side: Important Tab */}
        <button
          onClick={() => setActiveFilter('important')}
          className={`group relative overflow-hidden flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-xl font-bold transition-all border-2 text-sm md:text-base cursor-pointer shadow-sm md:w-36 ${
            activeFilter === 'important' 
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' 
              : 'border-transparent bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          {activeFilter === 'important' && (
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-500 rounded-l" />
          )}
          <span className="text-2xl mb-1.5">⭐</span>
          <span style={{ lineHeight: '1.2' }}>Pinned or</span>
          <span style={{ lineHeight: '1.2' }}>Priority</span>
        </button>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700 my-2"></div>

        {/* Right Side: Categories */}
        <div className="flex flex-col justify-center gap-5 w-full overflow-hidden">
          {/* Posted section */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Posted</h3>
            <div className="flex overflow-x-auto md:flex-wrap gap-2 pb-3 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {POSTED_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`filter-chip ${activeFilter === cat ? 'active' : ''}`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Scraped section */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Scraped</h3>
            <div className="flex overflow-x-auto md:flex-wrap gap-2 pb-3 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {SCRAPED_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`filter-chip ${activeFilter === cat.id ? 'active' : ''}`}
                  style={activeFilter === cat.id ? { background: 'var(--brand-500)', color: 'white', borderColor: 'var(--brand-500)' } : {}}
                >
                  {cat.label}
                </button>
              ))}
              
              {/* Coming soon (disabled) */}
              {COMING_SOON_CATEGORIES.map((cat) => (
                <div 
                  key={cat}
                  className="filter-chip opacity-40 cursor-not-allowed flex items-center gap-1"
                >
                  {cat}
                  <span className="text-[9px] bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded uppercase tracking-wider font-bold">
                    Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
