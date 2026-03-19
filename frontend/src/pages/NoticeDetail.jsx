import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Download, ExternalLink, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { formatDate, getCategoryColor } from '../lib/utils';

const NoticeDetail = () => {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/notices/${id}`);
      setNotice(data.notice);
      setRelated(data.related || []);
    } catch (err) {
      console.error('Failed to load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-500)' }} />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Notice not found</h2>
        <Link to="/" className="text-brand-500 hover:text-brand-600 text-sm font-medium">← Back to Dashboard</Link>
      </div>
    );
  }

  const targets = notice.target_criteria || {};

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="flex items-center gap-1.5 text-brand-500 hover:text-brand-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <span>/</span>
        <span>Dashboard</span>
        <span>/</span>
        <span>Notices</span>
        <span>/</span>
        <span style={{ color: 'var(--text-secondary)' }}>Notice Detail</span>
      </div>

      {/* Main card */}
      <div className="glass-card p-6 md:p-8">
        {/* Category badge */}
        <div className="mb-4">
          <span className={`badge ${getCategoryColor(notice.category)}`}>
            {notice.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
          {notice.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {notice.poster && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                <User className="w-4 h-4" style={{ color: 'var(--brand-500)' }} />
              </div>
              <div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{notice.poster.name}</span>
                <span className="mx-1">·</span>
                <span className="capitalize">{notice.poster.role?.replace('_', ' ')}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{formatDate(notice.created_at)}</span>
          </div>
        </div>

        {/* Target tags */}
        {!targets.global && (
          <div className="flex flex-wrap gap-2 mb-6">
            {targets.branch && <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{targets.branch}</span>}
            {targets.year && <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>Year {targets.year}</span>}
            {targets.section && <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>Section {targets.section}</span>}
            {targets.dept && <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{targets.dept}</span>}
          </div>
        )}

        <hr className="my-6" style={{ borderColor: 'var(--border-color)' }} />

        {/* Content area with optional PDF */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Content */}
          <div className="flex-1">
            <div
              className="prose max-w-none text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--text-primary)' }}
            >
              {notice.content}
            </div>
          </div>

          {/* PDF / Image preview */}
          {(notice.pdf_url || notice.original_image_url) && (
            <div className="md:w-64 flex-shrink-0">
              <div className="glass-card p-4">
                {notice.original_image_url && (
                  <img
                    src={notice.original_image_url.startsWith('http') ? notice.original_image_url : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${notice.original_image_url}`}
                    alt="Original notice"
                    className="w-full rounded-lg mb-3 border"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                )}
                {notice.pdf_url && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                      {notice.pdf_url.split('/').pop() || 'Document.pdf'}
                    </p>
                    <a
                      href={notice.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <ExternalLink className="w-4 h-4" /> View Original
                    </a>
                    <a
                      href={notice.pdf_url}
                      download
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related notices */}
      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Related Notices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/notice/${item.id}`}
                className="glass-card p-4 block hover:border-brand-500/30 transition-colors"
              >
                <span className={`badge ${getCategoryColor(item.category)} text-[10px] mb-2`}>{item.category}</span>
                <h4 className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</p>
                {item.target_criteria && !item.target_criteria.global && (
                  <div className="flex gap-1 mt-2">
                    {item.target_criteria.branch && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>{item.target_criteria.branch}</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeDetail;
