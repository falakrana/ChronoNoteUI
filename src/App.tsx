import { useState, useEffect } from 'react';
import { Search, Plus, Moon, Sun, Menu, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import NoteCard from './components/NoteCard';
import FolderCard from './components/FolderCard';
import NoteEditor from './components/NoteEditor';
import ConfirmDialog from './components/ConfirmDialog';
import AppSkeleton from './components/AppSkeleton';
import type { Folder, Note } from './types';
import { authApi, authStorage, folderApi, noteApi } from './api';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [allActiveNotes, setAllActiveNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [trashFolders, setTrashFolders] = useState<Folder[]>([]);
  const [view, setView] = useState<'notes' | 'trash'>('notes');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
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
      if (view === 'trash') {
        fetchTrashFolders();
      }
    } else {
      setNotes([]);
      setTrashFolders([]);
    }
  }, [view, token, selectedFolderId]);

  useEffect(() => {
    if (token) {
      fetchFolders();
      fetchAllActiveNotes();
    } else {
      setFolders([]);
      setAllActiveNotes([]);
    }
  }, [token]);

  useEffect(() => {
    if (selectedFolderId !== null && !folders.some((folder) => folder.id === selectedFolderId)) {
      setSelectedFolderId(null);
    }
  }, [folders, selectedFolderId]);

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
      const data = view === 'notes'
        ? await noteApi.getAllNotes(selectedFolderId !== null ? { folderId: selectedFolderId } : undefined)
        : await noteApi.getTrashNotes();
      setNotes(data);
    } catch (error: unknown) {
      const status = (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { status?: number } }).response?.status === 'number'
      )
        ? (error as { response?: { status?: number } }).response!.status
        : undefined;

      const message = (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string; detail?: string } } }).response?.data === 'object'
      )
        ? ((error as { response?: { data?: { message?: string; detail?: string } } }).response?.data?.message
            ?? (error as { response?: { data?: { message?: string; detail?: string } } }).response?.data?.detail
            ?? '')
        : '';

      if (status === 401 || status === 403) {
        handleLogout();
        return;
      }

      if (message.includes('Folder not found')) {
        setSelectedFolderId(null);
        return;
      }

      console.error('Failed to fetch notes:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const data = await folderApi.getAllFolders();
      setFolders(data);
    } catch (error: unknown) {
      const status = (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { status?: number } }).response?.status === 'number'
      )
        ? (error as { response?: { status?: number } }).response!.status
        : undefined;

      if (status === 401 || status === 403) {
        handleLogout();
        return;
      }
      console.error('Failed to fetch folders:', error);
    }
  };

  const fetchTrashFolders = async () => {
    try {
      const data = await folderApi.getTrashFolders();
      setTrashFolders(data);
    } catch (error) {
      console.error('Failed to fetch trash folders:', error);
    }
  };

  const fetchAllActiveNotes = async () => {
    try {
      const data = await noteApi.getAllNotes();
      setAllActiveNotes(data);
    } catch (error) {
      console.error('Failed to fetch sidebar notes:', error);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setEditorInitialTab('edit');
    setIsEditorOpen(true);
  };

  const handleCreateNoteInFolder = (folderId: number) => {
    setView('notes');
    setSelectedFolderId(folderId);
    setEditingNote(null);
    setEditorInitialTab('edit');
    setIsEditorOpen(true);
  };

  const handleCreateRootNote = () => {
    setView('notes');
    setSelectedFolderId(null);
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
      const payload: Note = {
        ...noteData,
        folderId: noteData.folderId ?? selectedFolderId ?? null,
      };

      if (editingNote?.id) {
        await noteApi.updateNote(editingNote.id, payload);
      } else {
        await noteApi.createNote(payload);
      }
      setIsEditorOpen(false);
      fetchNotes();
      fetchAllActiveNotes();
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
          fetchAllActiveNotes();
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
      fetchAllActiveNotes();
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
          fetchAllActiveNotes();
          setIsConfirmOpen(false);
        }
      }
    });
    setIsConfirmOpen(true);
  };

  const handleCreateFolder = async (payload: { name: string; parentFolderId: number | null }) => {
    try {
      await folderApi.createFolder(payload);
      await fetchFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleRenameFolder = async (folder: Folder, name: string) => {
    if (!folder.id) {
      return;
    }

    try {
      await folderApi.updateFolder(folder.id, {
        name,
        parentFolderId: folder.parentFolderId ?? null,
      });
      await fetchFolders();
    } catch (error) {
      console.error('Failed to rename folder:', error);
    }
  };

  const handleMoveFolder = async (folder: Folder, parentFolderId: number | null) => {
    if (!folder.id) {
      return;
    }
    try {
      await folderApi.updateFolder(folder.id, {
        name: folder.name,
        parentFolderId,
      });
      await fetchFolders();
    } catch (error) {
      console.error('Failed to move folder:', error);
    }
  };

  const handleMoveNote = async (note: Note, folderId: number | null) => {
    if (!note.id) {
      return;
    }
    try {
      await noteApi.updateNote(note.id, {
        ...note,
        folderId,
      });
      await fetchNotes();
      await fetchAllActiveNotes();
    } catch (error) {
      console.error('Failed to move note:', error);
    }
  };

  const handleDeleteFolder = (folder: Folder) => {
    if (!folder.id) {
      return;
    }

    setConfirmConfig({
      title: 'Delete Folder?',
      message: 'This folder, its subfolders, and all contained files will be moved to trash.',
      confirmLabel: 'Delete Folder',
      isDangerous: true,
      onConfirm: async () => {
        await folderApi.deleteFolder(folder.id!);
        if (selectedFolderId === folder.id) {
          setSelectedFolderId(null);
        }
        await fetchFolders();
        await fetchNotes();
        setIsConfirmOpen(false);
      }
    });
    setIsConfirmOpen(true);
  };

  const handleRestoreFolder = async (folder: Folder) => {
    if (!folder.id) return;
    try {
      await folderApi.restoreFolder(folder.id);
      await fetchFolders();
      await fetchTrashFolders();
      await fetchNotes(); 
    } catch (error) {
      console.error('Failed to restore folder:', error);
    }
  };

  const handlePermanentDeleteFolder = (folder: Folder) => {
    if (!folder.id) return;
    setConfirmConfig({
      title: 'Permanently Delete Folder?',
      message: 'This folder and all its subfolders will be permanently deleted. This action cannot be undone.',
      confirmLabel: 'Delete Permanently',
      isDangerous: true,
      onConfirm: async () => {
        await folderApi.hardDeleteFolder(folder.id!);
        await fetchTrashFolders();
        setIsConfirmOpen(false);
      }
    });
    setIsConfirmOpen(true);
  };

  const folderNameById = folders.reduce<Record<number, string>>((acc, folder) => {
    if (folder.id !== undefined) {
      acc[folder.id] = folder.name;
    }
    return acc;
  }, {});

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    const titleMatches = note.title?.toLowerCase()?.includes(query) ?? false;
    const contentMatches = note.content?.toLowerCase()?.includes(query) ?? false;
    return titleMatches || contentMatches;
  });

  const subFolders = folders.filter(f => f.parentFolderId === selectedFolderId);

  if (!token) {
    return (
      <main className="auth-shell">
        {/* Show skeleton overlay during auth submission */}
        {isAuthSubmitting && <AppSkeleton />}
        
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
        onViewChange={(v) => {
          setView(v);
          if (v === 'trash') {
            setSelectedFolderId(null);
          }
          setIsMobileMenuOpen(false);
        }}
        folders={folders}
        notes={allActiveNotes}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onMoveFolder={handleMoveFolder}
        onMoveNote={handleMoveNote}
        onCreateNoteInFolder={handleCreateNoteInFolder}
        onCreateRootNote={handleCreateRootNote}
        onOpenNote={handleEditNote}
        onEditNote={handleEditNote}
        onDeleteNote={handleDeleteNote}
        onViewNoteHistory={handleViewHistory}
        onDeleteFolder={handleDeleteFolder}
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
          {view === 'notes' && subFolders.map(folder => (
            <FolderCard
              key={`folder-${folder.id}`}
              folder={folder}
              onSelect={setSelectedFolderId}
              onDelete={handleDeleteFolder}
            />
          ))}

          {view === 'trash' && trashFolders.map(folder => (
            <FolderCard
              key={`trash-folder-${folder.id}`}
              folder={folder}
              isTrash
              onRestore={handleRestoreFolder}
              onPermanentDelete={handlePermanentDeleteFolder}
            />
          ))}
          
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              folderName={note.folderId ? folderNameById[note.folderId] : undefined}
              isTrash={view === 'trash'}
              onEdit={handleEditNote}
              onViewHistory={handleViewHistory}
              onDelete={handleDeleteNote}
              onRestore={handleRestoreNote}
              onPermanentDelete={handlePermanentDelete}
            />
          ))}

          {filteredNotes.length === 0 && subFolders.length === 0 && (view === 'notes' || trashFolders.length === 0) && (
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
            folders={folders}
            defaultFolderId={selectedFolderId}
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
