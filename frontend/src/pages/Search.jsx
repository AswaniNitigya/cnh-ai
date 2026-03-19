import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader2, Bell } from 'lucide-react';
import api from '../lib/api';
import NoticeCard from '../components/NoticeCard';

const CATEGORIES = ['all', 'academic', 'exam', 'event', 'placement', 'general'];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, []);

  const handleSearch = async (searchQ) => {
    const q = searchQ || query;
    if (!q.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const params = { q };
      if (category !== 'all') params.category = category;
      const { data } = await api.get('/notices/search', { params });
      setResults(data.notices || []);
      setSearchParams({ q });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Search Notices</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Search through all published notices</p>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or content..."
            className="w-full pl-12 pr-32 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
          <button type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
            Search
          </button>
        </div>
      </form>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button key={cat}
            onClick={() => { setCategory(cat); if (searched) handleSearch(); }}
            className={`filter-chip ${category === cat ? 'active' : ''}`}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-500)' }} />
        </div>
      ) : searched && results.length > 0 ? (
        <>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{results.length} result(s) found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((notice, i) => (
              <NoticeCard key={notice.id} notice={notice} index={i} />
            ))}
          </div>
        </>
      ) : searched ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No results found</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try a different search term or category.</p>
        </div>
      ) : (
        <div className="text-center py-16">
          <SearchIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Start searching</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enter a keyword to search through all notices.</p>
        </div>
      )}
    </div>
  );
};

export default Search;
