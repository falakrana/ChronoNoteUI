import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Note } from '../types';
import { motion } from 'framer-motion';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Note) => void;
  onClose: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  const handleSave = () => {
    onSave({
      ...(note ?? {}),
      title,
      content,
    });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div 
        className="editor-container" 
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="editor-header">
          <span className="text-muted">{note?.id ? 'Edit Note' : 'New Note'}</span>
          <button className="action-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="editor-body">
          <input
            type="text"
            className="editor-title-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="editor-content-input"
            placeholder="Start typing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="editor-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NoteEditor;
