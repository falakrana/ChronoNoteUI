import React from 'react';
import { Trash2, Edit2, RotateCcw, Trash, History } from 'lucide-react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  folderName?: string;
  isTrash?: boolean;
  onEdit: (note: Note) => void;
  onViewHistory: (note: Note) => void;
  onDelete: (note: Note) => void;
  onRestore?: (id: number) => void;
  onPermanentDelete?: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  folderName,
  isTrash, 
  onEdit, 
  onViewHistory,
  onDelete, 
  onRestore, 
  onPermanentDelete 
}) => {

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="note-card animate-fade-in">
      <h3 className="note-title" title={note.title || 'Untitled'}>{note.title || 'Untitled'}</h3>
      {folderName && <div className="note-date">Folder: {folderName}</div>}
      <div className="note-content">{note.content}</div>
      <div className="note-footer">
        <span className="note-date">{formatDate(note.updatedAt || note.createdAt)}</span>
        <div className="note-actions">
          {!isTrash ? (
            <>
              <button 
                className="action-btn" 
                title="View History"
                onClick={() => onViewHistory(note)}
              >
                <History size={16} />
              </button>
              <button className="action-btn" onClick={() => onEdit(note)}>
                <Edit2 size={16} />
              </button>
              <button className="action-btn delete" onClick={() => onDelete(note)}>
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="action-btn" onClick={() => note.id && onRestore?.(note.id)}>
                <RotateCcw size={16} />
              </button>
              <button className="action-btn delete" onClick={() => onPermanentDelete?.(note)}>
                <Trash size={16} />
              </button>

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
