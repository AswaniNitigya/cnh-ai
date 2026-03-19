import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { formatDate, getCategoryColor, truncateText } from '../lib/utils';

const NoticeCard = ({ notice, index = 0 }) => {
  return (
    <Link
      to={`/notice/${notice.id}`}
      className="glass-card p-5 block animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Category badge */}
      <div className="mb-3">
        <span className={`badge ${getCategoryColor(notice.category)}`}>
          {notice.category}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-semibold text-base mb-2 leading-snug"
        style={{ color: 'var(--text-primary)' }}
      >
        {notice.title}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: 'var(--text-secondary)' }}
      >
        {truncateText(notice.content, 120)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(notice.created_at)}</span>
        </div>

        {notice.poster && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
              <User className="w-3 h-3" style={{ color: 'var(--brand-500)' }} />
            </div>
            <span>{notice.poster.name}</span>
          </div>
        )}
      </div>

      {/* Source indicator */}
      {notice.source === 'scraper' && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium">
            🔗 Scraped from MMMUT
          </span>
        </div>
      )}
      {notice.source === 'ocr' && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 font-medium">
            📸 OCR Processed
          </span>
        </div>
      )}
    </Link>
  );
};

export default NoticeCard;
