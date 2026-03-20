import { Link, useNavigate } from 'react-router-dom';
import { Clock, User, Pin, Pencil } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { formatDate, getCategoryColor, truncateText } from '../lib/utils';

const NoticeCard = ({ notice, index = 0 }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const isPinned = notice.pinned_until && new Date(notice.pinned_until) > new Date();
  const canEdit = user?.role === 'super_admin' || user?.id === notice.posted_by || (notice.poster && user?.id === notice.poster.id);
  
  const priorityColors = {
    p1: '#E76F2E',
    p2: '#FFC570',
    p3: '#91D06C',
  };
  
  const borderStyle = notice.priority && priorityColors[notice.priority] 
    ? { border: `1px solid ${priorityColors[notice.priority]}` } 
    : {};

  return (
    <Link
      to={`/notice/${notice.id}`}
      className="glass-card p-5 block animate-fade-in cursor-pointer relative overflow-hidden"
      style={{ animationDelay: `${index * 60}ms`, ...borderStyle }}
    >
      {/* Pinned Icon */}
      {isPinned && (
        <div className="absolute top-0 right-0 p-2 text-brand-500 dark:text-brand-400 bg-brand-500/10 rounded-bl-lg">
          <Pin className="w-4 h-4 transform rotate-45" />
        </div>
      )}

      {/* Edit Button */}
      {canEdit && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/edit-notice/${notice.id}`);
          }}
          className={`absolute top-2 ${isPinned ? 'right-10' : 'right-2'} p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10`}
          title="Edit Notice"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      
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
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
                <User className="w-3 h-3" style={{ color: 'var(--brand-500)' }} />
              </div>
              <span className="flex items-center gap-2">
                {notice.poster.name}
              </span>
            </div>
            {(notice.priority || notice.is_edited) && (
              <div className="flex gap-1.5 items-center">
                {notice.is_edited && (
                  <span className="text-[10px] italic text-gray-400 dark:text-gray-500">(Edited)</span>
                )}
                {notice.priority && (
                  <span 
                    className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider" 
                    style={{ 
                      color: priorityColors[notice.priority], 
                      backgroundColor: `${priorityColors[notice.priority]}15` 
                    }}
                  >
                    {notice.priority}
                  </span>
                )}
              </div>
            )}
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
