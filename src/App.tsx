import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import Sidebar from './components/Sidebar';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import type { Note } from './types';
import { noteApi } from './api';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<'notes' | 'trash'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

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
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
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

  const handleDeleteNote = async (id: number) => {
    try {
      await noteApi.softDelete(id);
      fetchNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleRestoreNote = async (id: number) => {
    try {
      await noteApi.restoreNote(id);
      fetchNotes();
    } catch (error) {
      console.error('Failed to restore note:', error);
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (confirm('Are you sure you want to permanently delete this note?')) {
      try {
        await noteApi.hardDelete(id);
        fetchNotes();
      } catch (error) {
        console.error('Failed to permanently delete note:', error);
      }
    }
  };

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    const titleMatches = note.title?.toLowerCase()?.includes(query) ?? false;
    const contentMatches = note.content?.toLowerCase()?.includes(query) ?? false;
    return titleMatches || contentMatches;
  });

  return (
    <>
      <Sidebar currentView={view} onViewChange={setView} />
      
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
          
          {view === 'notes' && (
            <button className="btn-primary" onClick={handleCreateNote}>
              <Plus size={20} />
              New Note
            </button>
          )}
        </header>

        <div className="notes-grid">
          {filteredNotes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              isTrash={view === 'trash'}
              onEdit={handleEditNote}
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
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
