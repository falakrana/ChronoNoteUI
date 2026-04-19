import { useState, useEffect } from 'react';
import { Search, Plus, Moon, Sun } from 'lucide-react';
import Sidebar from './components/Sidebar';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import ConfirmDialog from './components/ConfirmDialog';
import type { Note } from './types';
import { noteApi } from './api';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<'notes' | 'trash'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState<'edit' | 'diff' | 'history'>('edit');
  
  // Theme state
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);
  
  // Confirmation states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    isDangerous?: boolean;
    confirmLabel?: string;
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchNotes();
  }, [view]);

  const fetchNotes = async () => {
    try {
      const data = view === 'notes' ? await noteApi.getAllNotes() : await noteApi.getTrashNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setEditorInitialTab('edit');
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditorInitialTab('edit');
    setIsEditorOpen(true);
  };

  const handleViewHistory = (note: Note) => {
    setEditingNote(note);
    setEditorInitialTab('history');
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (noteData: Note) => {
    try {
      if (editingNote?.id) {
        await noteApi.updateNote(editingNote.id, noteData);
      } else {
        await noteApi.createNote(noteData);
      }
      setIsEditorOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = (note: Note) => {
    setConfirmConfig({
      title: 'Move to Trash?',
      message: 'This note will be moved to the trash. You can restore it later.',
      confirmLabel: 'Move to Trash',
      onConfirm: async () => {
        if (note.id) {
          await noteApi.softDelete(note.id);
          fetchNotes();
          setIsConfirmOpen(false);
        }
      }
    });
    setIsConfirmOpen(true);
  };

  const handleRestoreNote = async (id: number) => {
    try {
      await noteApi.restoreNote(id);
      fetchNotes();
    } catch (error) {
      console.error('Failed to restore note:', error);
    }
  };

  const handlePermanentDelete = (note: Note) => {
    setConfirmConfig({
      title: 'Delete Permanently?',
      message: 'This action cannot be undone. All history for this note will be lost.',
      confirmLabel: 'Delete Forever',
      isDangerous: true,
      onConfirm: async () => {
        if (note.id) {
          await noteApi.hardDelete(note.id);
          fetchNotes();
          setIsConfirmOpen(false);
        }
      }
    });
    setIsConfirmOpen(true);
  };

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    const titleMatches = note.title?.toLowerCase()?.includes(query) ?? false;
    const contentMatches = note.content?.toLowerCase()?.includes(query) ?? false;
    return titleMatches || contentMatches;
  });

  return (
    <>
      <Sidebar 
        currentView={view} 
        onViewChange={setView} 
      />
      
      <main className="main-content">
        <header className="top-bar">
          <div className="search-container">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="action-btn" 
              onClick={() => setIsDarkTheme(!isDarkTheme)} 
              title={isDarkTheme ? "Light Mode" : "Dark Mode"}
            >
              {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {view === 'notes' && (
              <button className="btn-primary" onClick={handleCreateNote}>
                <Plus size={20} />
                New Note
              </button>
            )}
          </div>
        </header>

        <div className="notes-grid">
          {filteredNotes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              isTrash={view === 'trash'}
              onEdit={handleEditNote}
              onViewHistory={handleViewHistory}
              onDelete={handleDeleteNote}
              onRestore={handleRestoreNote}
              onPermanentDelete={handlePermanentDelete}
            />
          ))}
          
          {filteredNotes.length === 0 && (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '4rem', 
              color: 'var(--text-muted)' 
            }}>
              No {view === 'trash' ? 'trash' : 'notes'} found.
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isEditorOpen && (
          <NoteEditor 
            note={editingNote} 
            onSave={handleSaveNote} 
            onClose={() => setIsEditorOpen(false)} 
            initialTab={editorInitialTab}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        isDangerous={confirmConfig.isDangerous}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}


export default App;
