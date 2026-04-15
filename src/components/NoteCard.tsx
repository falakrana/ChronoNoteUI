import React from 'react';
import { Trash2, Edit2, RotateCcw, Trash } from 'lucide-react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  isTrash?: boolean;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onRestore?: (id: number) => void;
  onPermanentDelete?: (id: number) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  isTrash, 
  onEdit, 
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
      <h3 className="note-title">{note.title || 'Untitled'}</h3>
      <div className="note-content">{note.content}</div>
      <div className="note-footer">
        <span className="note-date">{formatDate(note.updatedAt || note.createdAt)}</span>
        <div className="note-actions">
          {!isTrash ? (
            <>
              <button className="action-btn" onClick={() => onEdit(note)}>
                <Edit2 size={16} />
              </button>
              <button className="action-btn delete" onClick={() => note.id && onDelete(note.id)}>
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="action-btn" onClick={() => note.id && onRestore?.(note.id)}>
                <RotateCcw size={16} />
              </button>
              <button className="action-btn delete" onClick={() => note.id && onPermanentDelete?.(note.id)}>
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
