import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Copy,
  Download,
  Edit3,
  MoreVertical,
  Pin,
  Trash2,
} from 'lucide-react';
import { COLOR_CONFIGS, NoteItem } from '../types';
import { formatRelativeTime } from '../services/storage';

interface NoteCardProps {
  note: NoteItem;
  onEdit: (note: NoteItem) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleChecklistItem?: (noteId: string, itemId: string) => void;
  onDuplicate?: (note: NoteItem) => void;
  onExportSingle?: (note: NoteItem) => void;
  compact?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleChecklistItem,
  onDuplicate,
  onExportSingle,
  compact = false,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const colorConf = COLOR_CONFIGS[note.color] || COLOR_CONFIGS.peach;

  const totalChecklist = note.checklist?.length || 0;
  const completedChecklist = note.checklist?.filter((item) => item.completed).length || 0;

  return (
    <div
      className={`group relative flex flex-col justify-between ${colorConf.bgGradient} border ${colorConf.cardBorder} rounded-2xl md:rounded-3xl p-3.5 md:p-4 shadow-sm hover:shadow-md transition-all duration-200 text-left`}
    >
      {/* Top Action Bar matching Screenshot */}
      <div className="flex items-center justify-between gap-1 mb-2">
        {/* Type / Tag badge or Title if compact */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {note.tags && note.tags.length > 0 && (
            <span
              className={`text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full ${colorConf.badgeBg} ${colorConf.textSecondary} truncate max-w-[120px]`}
            >
              #{note.tags[0]}
            </span>
          )}
          {note.type === 'list' && (
            <span className={`text-[10px] md:text-xs font-medium ${colorConf.textSecondary}`}>
              {completedChecklist}/{totalChecklist} done
            </span>
          )}
        </div>

        {/* 3 Action Buttons: Pin, Edit, Delete */}
        <div className="note-card-actions flex items-center gap-1 shrink-0">
          {/* Pin Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            title={note.isPinned ? 'Unpin note' : 'Pin to top'}
            className={`note-card-action w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
              note.isPinned
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-rose-500 shadow-xs'
            }`}
          >
            <Pin
              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                note.isPinned ? 'fill-current' : 'fill-none'
              } transform rotate-45`}
            />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            title="Edit note"
            className="note-card-action w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/80 hover:bg-white text-amber-600 flex items-center justify-center shadow-xs transition-transform active:scale-90"
          >
            <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            title="Delete note"
            className="note-card-action w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-rose-600 flex items-center justify-center shadow-xs transition-transform active:scale-90"
          >
            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>

          {/* More options menu */}
          {(onDuplicate || onExportSingle) && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="note-card-action w-6 h-6 rounded-full text-slate-600/70 hover:text-slate-900 flex items-center justify-center transition-colors"
                title="More actions"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div className="absolute right-0 top-7 z-40 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-xs text-slate-700">
                    {onDuplicate && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onDuplicate(note);
                        }}
                        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 text-left"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        Duplicate
                      </button>
                    )}
                    {onExportSingle && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onExportSingle(note);
                        }}
                        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 text-left"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        Export .md
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Body Content */}
      <div
        className="flex-1 cursor-pointer py-1"
        onClick={() => onEdit(note)}
      >
        {note.title && (
          <h3
            className={`font-bold ${
              compact ? 'text-xs md:text-sm' : 'text-sm md:text-base'
            } ${colorConf.textPrimary} tracking-tight mb-1.5 line-clamp-2`}
          >
            {note.title}
          </h3>
        )}

        {/* Note Text View */}
        {note.type === 'note' && (
          <p
            className={`${compact ? 'text-[11px] md:text-xs' : 'text-xs md:text-sm'} ${
              colorConf.textSecondary
            } leading-relaxed whitespace-pre-line ${compact ? 'line-clamp-4' : 'line-clamp-6'}`}
          >
            {note.content || <span className="italic opacity-60">Empty note...</span>}
          </p>
        )}

        {/* Checklist View */}
        {note.type === 'list' && (
          <div className="space-y-1 mt-1">
            {note.checklist && note.checklist.length > 0 ? (
              note.checklist.slice(0, compact ? 4 : 6).map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleChecklistItem) {
                      onToggleChecklistItem(note.id, item.id);
                    }
                  }}
                  className="note-checklist-item flex items-start gap-1.5 text-left group/item cursor-pointer"
                >
                  <button
                    type="button"
                    className="shrink-0 mt-0.5 text-slate-700/80 hover:text-slate-900 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-500/70" />
                    )}
                  </button>
                  <span
                    className={`text-[11px] md:text-xs leading-tight ${
                      item.completed
                        ? 'line-through text-slate-500/60'
                        : colorConf.textSecondary
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-[11px] text-slate-500/60 italic">No items yet...</span>
            )}
            {note.checklist && note.checklist.length > (compact ? 4 : 6) && (
              <span className={`text-[10px] font-semibold ${colorConf.textSecondary} block pt-1`}>
                +{note.checklist.length - (compact ? 4 : 6)} more items...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hairline Divider & Bottom Timestamp matching Screenshot */}
      <div className="pt-2 mt-2 border-t border-black/8 flex items-center justify-between text-[10px] md:text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-600/80">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-rose-600" />
          <span
            title={new Date(note.updatedAt || note.createdAt).toLocaleString()}
          >
            Last edited: {formatRelativeTime(note.updatedAt || note.createdAt)}
          </span>
        </div>

        {note.isPinned && (
          <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-0.5">
            <Pin className="w-2.5 h-2.5 fill-rose-600" />
            Pinned
          </span>
        )}
      </div>
    </div>
  );
};
