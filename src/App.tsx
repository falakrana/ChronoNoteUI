import { useState, useEffect } from 'react';
import { Search, Plus, Moon, Sun, Menu, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import ConfirmDialog from './components/ConfirmDialog';
import AppSkeleton from './components/AppSkeleton';
import type { Note } from './types';
import { authApi, authStorage, noteApi } from './api';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<'notes' | 'trash'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState<'edit' | 'diff' | 'history'>('edit');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [token, setToken] = useState(() => authStorage.getToken());
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

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
    if (token) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [view, token]);

  const handleAuthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setIsAuthSubmitting(true);

    try {
      const payload = {
        ...(authMode === 'signup' ? { name: name.trim() } : {}),
        email: email.trim(),
        password,
      };
      const response = authMode === 'signup'
        ? await authApi.signup(payload)
        : await authApi.login(payload);

      authStorage.setToken(response.token);
      setToken(response.token);
    } catch (error: unknown) {
      const serverMessage =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: unknown } }).response === 'object'
          ? ((error as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.detail
            ?? (error as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.message)
          : undefined;

      setAuthError(serverMessage ?? (authMode === 'signup' ? 'Signup failed' : 'Login failed'));
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    authStorage.clearToken();
    setToken(null);
    setEditingNote(null);
    setIsEditorOpen(false);
  };

  const fetchNotes = async () => {
    try {
      const data = view === 'notes' ? await noteApi.getAllNotes() : await noteApi.getTrashNotes();
      setNotes(data);
    } catch {
      handleLogout();
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

  if (!token) {
    return (
      <main className="auth-shell">
        {/* Show skeleton overlay during auth submission */}
        {isAuthSubmitting && <AppSkeleton isDarkTheme={isDarkTheme} />}
        
        <section className="auth-panel animate-fade-in">
          <div className="auth-badge">chronoNote</div>
          <h2 className="auth-title">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="auth-subtitle">
            {authMode === 'login'
              ? 'Login to access your private workspace.'
              : 'Sign up to create your private note workspace.'}
          </p>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authMode === 'signup' && (
              <label className="auth-field">
                <span>Name</span>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            {authError && <p className="auth-error">{authError}</p>}

            <button className="btn-primary auth-submit" type="submit" disabled={isAuthSubmitting}>
              {isAuthSubmitting ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <button
            type="button"
            className="auth-switch"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setAuthError('');
            }}
          >
            {authMode === 'login' ? 'Need an account? Sign up' : 'Have an account? Login'}
          </button>
        </section>
      </main>
    );
  }

  return (
    <>
      <Sidebar
        currentView={view}
        onViewChange={(v) => { setView(v); setIsMobileMenuOpen(false); }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <main className="main-content">
        <header className="top-bar">
          <div className="flex items-center gap-4 w-full">
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} className="text-main" />
            </button>
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
          </div>
          <div className="flex items-center gap-4">
            <button
              className="action-btn"
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              title={isDarkTheme ? "Light Mode" : "Dark Mode"}
            >
              {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="action-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
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
