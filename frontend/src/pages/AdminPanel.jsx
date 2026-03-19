import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, FileText, Clock, Loader2, RefreshCw, Trash2, Pencil } from 'lucide-react';
import api from '../lib/api';
import { formatDate, getCategoryColor, getStatusColor } from '../lib/utils';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, noticesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/notices/feed?limit=10'),
      ]);
      setStats(statsRes.data);
      setNotices(noticesRes.data.notices || []);
    } catch (err) {
      console.error('Admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerScraper = async () => {
    try {
      setScraping(true);
      setScrapeResult(null);
      const { data } = await api.get('/admin/trigger-scraper');
      setScrapeResult(data);
      fetchData();
    } catch (err) {
      setScrapeResult({ error: err.response?.data?.error || 'Scraper failed' });
    } finally {
      setScraping(false);
    }
  };

  const handleArchive = async (id) => {
    try {
      await api.delete(`/notices/${id}`);
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Archive error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-500)' }} />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Notices', value: stats?.totalNotices || 0, icon: FileText, color: '#6366f1' },
    { label: 'Active Students', value: stats?.activeStudents || 0, icon: Users, color: '#10b981' },
    { label: 'Pending Reviews', value: stats?.pendingReviews || 0, icon: Clock, color: '#f59e0b' },
    { label: 'Last Scrape', value: stats?.lastScrape ? formatDate(stats.lastScrape) : 'Never', icon: RefreshCw, color: '#3b82f6' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage notices, users, and scrapers</p>
        </div>

        <button
          onClick={triggerScraper}
          disabled={scraping}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
          {scraping ? 'Scraping...' : 'Run Scraper'}
        </button>
      </div>

      {/* Scrape result */}
      {scrapeResult && (
        <div className={`mb-6 p-4 rounded-lg border text-sm ${scrapeResult.error ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400'}`}>
          {scrapeResult.error ? scrapeResult.error : `Scraper found ${scrapeResult.newNotices} new notices, skipped ${scrapeResult.skipped}.`}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent notices table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Notices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Title</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>Category</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell" style={{ color: 'var(--text-secondary)' }}>Source</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>Date</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="text-right px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td className="px-5 py-3">
                    <Link to={`/notice/${notice.id}`} className="font-medium hover:text-brand-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {notice.title?.length > 50 ? notice.title.substring(0, 50) + '...' : notice.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`badge ${getCategoryColor(notice.category)}`}>{notice.category}</span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell capitalize" style={{ color: 'var(--text-secondary)' }}>{notice.source}</td>
                  <td className="px-5 py-3 hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>{formatDate(notice.created_at)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${getStatusColor(notice.status)}`}>{notice.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/notice/${notice.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleArchive(notice.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {notices.length === 0 && (
            <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              <p>No notices yet. Post one or run the scraper!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
