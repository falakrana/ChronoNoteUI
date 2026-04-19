import React, { useState, useEffect } from 'react';
import { X, Save, History, FileText, GitBranch, CheckCircle } from 'lucide-react';
import type { Note, NoteVersion } from '../types';
import { motion } from 'framer-motion';
import { noteApi } from '../api';
import DiffViewer from './DiffViewer';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Note) => void;
  onClose: () => void;
  initialTab?: 'edit' | 'diff' | 'history';
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose, initialTab = 'edit' }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'diff' | 'history'>(initialTab);

  const [history, setHistory] = useState<NoteVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      if (note.id) {
        fetchHistory(note.id);
      }
    } else {
      setTitle('');
      setContent('');
      setHistory([]);
    }
  }, [note]);

  const fetchHistory = async (id: number) => {
    try {
      const data = await noteApi.getNoteHistory(id);
      setHistory(data.sort((a, b) => b.versionNumber - a.versionNumber));
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

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
          <div className="flex items-center gap-4">
            <span className="text-muted">{note?.id ? 'Edit Note' : 'New Note'}</span>
          </div>
          <button className="action-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="editor-body">
          {note?.id && (
            <div className="tabs-container">
              <button 
                className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                <FileText size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Edit
              </button>
              <button 
                className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
                onClick={() => setActiveTab('diff')}
              >
                <GitBranch size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Changes
              </button>
              <button 
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <History size={16} style={{ display: 'inline', marginRight: '6px' }} />
                History
              </button>
            </div>
          )}

          {activeTab === 'edit' && (
            <>
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
            </>
          )}

          {activeTab === 'diff' && (
            <div className="flex flex-col gap-4">
              <div className="confirm-overlay">
                <CheckCircle size={18} />
                Reviewing changes from the last saved version
              </div>
              <h2 className="note-title">{title} [Diff]</h2>
              <DiffViewer oldText={note?.content || ''} newText={content} />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex flex-col gap-4">
              <div className="history-list">
                {history.map((version) => (
                  <div 
                    key={version.id} 
                    className={`history-item ${selectedVersion?.id === version.id ? 'selected' : ''}`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="history-meta">
                      <span>Version {version.versionNumber}</span>
                      <span>{new Date(version.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="history-title">{version.title}</div>
                  </div>
                ))}
              </div>
              {selectedVersion && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2 text-muted">Comparison with current:</h3>
                  <DiffViewer oldText={selectedVersion.content} newText={content} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="editor-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>
            {activeTab === 'diff' ? <CheckCircle size={18} /> : <Save size={18} />}
            {activeTab === 'diff' ? 'Confirm & Finalize' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NoteEditor;

