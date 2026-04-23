import React, { useMemo, useState } from 'react';
import {
  Notebook,
  Trash2,
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Folder as FolderIcon,
  FolderPlus,
  ChevronDown,
  ChevronRight as ChevronRightSmall,
  Edit2,
  Trash,
  FilePlus2,
  StickyNote,
  History,
  Check,
  X as CloseIcon
} from 'lucide-react';
import type { Folder, Note } from '../types';

interface SidebarProps {
  currentView: 'notes' | 'trash';
  onViewChange: (view: 'notes' | 'trash') => void;
  folders?: Folder[];
  notes?: Note[];
  selectedFolderId?: number | null;
  onSelectFolder?: (folderId: number | null) => void;
  onCreateFolder?: (payload: { name: string; parentFolderId: number | null }) => Promise<void> | void;
  onRenameFolder?: (folder: Folder, name: string) => Promise<void> | void;
  onMoveFolder?: (folder: Folder, parentFolderId: number | null) => Promise<void> | void;
  onMoveNote?: (note: Note, folderId: number | null) => Promise<void> | void;
  onCreateNoteInFolder?: (folderId: number) => void;
  onCreateRootNote?: () => void;
  onOpenNote?: (note: Note) => void;
  onEditNote?: (note: Note) => void;
  onViewNoteHistory?: (note: Note) => void;
  onDeleteNote?: (note: Note) => void;
  onDeleteFolder?: (folder: Folder) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  folders = [],
  notes = [],
  selectedFolderId = null,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onMoveFolder,
  onMoveNote,
  onCreateNoteInFolder,
  onCreateRootNote,
  onOpenNote,
  onEditNote,
  onViewNoteHistory,
  onDeleteNote,
  onDeleteFolder,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [createParentFolderId, setCreateParentFolderId] = useState<number | null | 'root'>(null);
  const [createFolderName, setCreateFolderName] = useState('');
  const [draggingFolderId, setDraggingFolderId] = useState<number | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<number | null>(null);

  const childrenByParent = useMemo(() => {
    const lookup = new Map<number | null, Folder[]>();
    for (const folder of folders) {
      const parentId = folder.parentFolderId ?? null;
      const list = lookup.get(parentId) ?? [];
      list.push(folder);
      lookup.set(parentId, list);
    }
    return lookup;
  }, [folders]);

  const notesByFolder = useMemo(() => {
    const grouped = new Map<number | null, Note[]>();
    const ordered = [...notes].sort((a, b) => {
      const aTs = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime();
      const bTs = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime();
      return aTs - bTs;
    });

    for (const note of ordered) {
      const key = note.folderId ?? null;
      const bucket = grouped.get(key) ?? [];
      bucket.push(note);
      grouped.set(key, bucket);
    }
    return grouped;
  }, [notes]);

  const toggleExpand = (folderId: number) => {
    setExpandedIds((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const openCreateInput = (parentFolderId: number | null | 'root') => {
    setEditingFolderId(null);
    setCreateParentFolderId(parentFolderId);
    setCreateFolderName('');
  };

  const submitCreateFolder = async () => {
    const trimmed = createFolderName.trim();
    if (!trimmed) {
      return;
    }

    const parentFolderId = createParentFolderId === 'root' ? null : createParentFolderId;
    await onCreateFolder?.({ name: trimmed, parentFolderId });
    if (parentFolderId !== null) {
      setExpandedIds((prev) => ({ ...prev, [parentFolderId]: true }));
    }
    setCreateFolderName('');
    setCreateParentFolderId(null);
  };

  const startRename = (folder: Folder) => {
    if (folder.id === undefined) {
      return;
    }
    setCreateParentFolderId(null);
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const submitRename = async (folder: Folder) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      return;
    }
    await onRenameFolder?.(folder, trimmed);
    setEditingFolderId(null);
    setEditingName('');
  };

  const moveFolder = async (folder: Folder, parentFolderId: number | null) => {
    if (!onMoveFolder) {
      return;
    }
    await onMoveFolder(folder, parentFolderId);
  };

  const moveNote = async (note: Note, folderId: number | null) => {
    if (!onMoveNote) {
      return;
    }
    await onMoveNote(note, folderId);
  };

  const renderInlineCreateRow = (target: number | null | 'root') => {
    if (createParentFolderId !== target || isCollapsed) {
      return null;
    }

    return (
      <div className="folder-inline-editor">
        <input
          className="folder-inline-input"
          placeholder="Folder name"
          value={createFolderName}
          onChange={(e) => setCreateFolderName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              submitCreateFolder();
            }
            if (e.key === 'Escape') {
              setCreateParentFolderId(null);
              setCreateFolderName('');
            }
          }}
          autoFocus
        />
        <button className="folder-inline-btn" onClick={submitCreateFolder} title="Create folder">
          <Check size={13} />
        </button>
        <button
          className="folder-inline-btn danger"
          onClick={() => {
            setCreateParentFolderId(null);
            setCreateFolderName('');
          }}
          title="Cancel"
        >
          <CloseIcon size={13} />
        </button>
      </div>
    );
  };

  const renderFolderTree = (parentId: number | null, depth = 0): React.ReactNode => {
    const children = childrenByParent.get(parentId) ?? [];
    if (children.length === 0) {
      return null;
    }

    return children.map((folder) => {
      const folderId = folder.id;
      if (folderId === undefined) {
        return null;
      }
      const nestedChildren = childrenByParent.get(folderId) ?? [];
      const hasContent = nestedChildren.length > 0 || (notesByFolder.get(folderId) ?? []).length > 0;
      const isExpanded = expandedIds[folderId] ?? true;
      const isSelected = selectedFolderId === folderId;

      return (
        <div key={folderId}>
          <div
            className={`folder-tree-item ${isSelected ? 'selected' : ''}`}
            style={{ paddingLeft: `${10 + depth * 14}px` }}
            draggable={!isCollapsed}
            onDragStart={() => setDraggingFolderId(folderId)}
            onDragEnd={() => setDraggingFolderId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              if (draggingFolderId !== null) {
                if (draggingFolderId === folderId) {
                  return;
                }
                const draggedFolder = folders.find((item) => item.id === draggingFolderId);
                if (!draggedFolder) {
                  return;
                }
                await moveFolder(draggedFolder, folderId);
                setDraggingFolderId(null);
                return;
              }
              if (draggingNoteId === null) {
                return;
              }
              const draggedNote = notes.find((item) => item.id === draggingNoteId);
              if (!draggedNote) {
                return;
              }
              await moveNote(draggedNote, folderId);
              setDraggingNoteId(null);
            }}
          >
            {!isCollapsed && hasContent ? (
              <button
                className="folder-tree-chevron"
                onClick={() => toggleExpand(folderId)}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRightSmall size={14} />}
              </button>
            ) : (
              <span className="folder-tree-chevron-placeholder" />
            )}
            <button
              className="folder-tree-select"
              onClick={() => {
                onViewChange('notes');
                onSelectFolder?.(folderId);
              }}
              title={folder.name}
            >
              <FolderIcon size={16} />
              {!isCollapsed && (
                <span className="folder-tree-label">
                  {editingFolderId === folderId ? (
                    <input
                      className="folder-inline-input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          submitRename(folder);
                        }
                        if (e.key === 'Escape') {
                          setEditingFolderId(null);
                          setEditingName('');
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    folder.name
                  )}
                </span>
              )}
            </button>

            {!isCollapsed && editingFolderId !== folderId && (
              <div className="folder-tree-actions">
                <button
                  className="folder-tree-action"
                  onClick={() => onCreateNoteInFolder?.(folderId)}
                  title="New note in folder"
                >
                  <FilePlus2 size={12} />
                </button>
                <button className="folder-tree-action" onClick={() => openCreateInput(folderId)} title="New subfolder">
                  <FolderPlus size={12} />
                </button>
                <button className="folder-tree-action" onClick={() => startRename(folder)} title="Rename folder">
                  <Edit2 size={12} />
                </button>
                <button className="folder-tree-action delete" onClick={() => onDeleteFolder?.(folder)} title="Delete folder">
                  <Trash size={12} />
                </button>
              </div>
            )}

            {!isCollapsed && editingFolderId === folderId && (
              <div className="folder-tree-actions">
                <button className="folder-tree-action" onClick={() => submitRename(folder)} title="Save rename">
                  <Check size={12} />
                </button>
                <button
                  className="folder-tree-action delete"
                  onClick={() => {
                    setEditingFolderId(null);
                    setEditingName('');
                  }}
                  title="Cancel rename"
                >
                  <CloseIcon size={12} />
                </button>
              </div>
            )}
          </div>
          {!isCollapsed && isExpanded && (notesByFolder.get(folderId) ?? []).map((note) => (
            <div
              key={`note-${note.id}`}
              className="folder-note-row folder-note-row--actions"
              style={{ paddingLeft: `${34 + depth * 14}px` }}
              draggable
              onDragStart={() => setDraggingNoteId(note.id ?? null)}
              onDragEnd={() => setDraggingNoteId(null)}
            >
              <button
                className="folder-note-row-main"
                onClick={() => onOpenNote?.(note)}
                title={note.title || 'Untitled'}
              >
                <StickyNote size={13} />
                <span>{note.title || 'Untitled'}</span>
              </button>
              <div className="folder-note-row-actions">
                <button className="folder-tree-action" onClick={() => onViewNoteHistory?.(note)} title="History"><History size={11} /></button>
                <button className="folder-tree-action" onClick={() => onEditNote?.(note)} title="Edit"><Edit2 size={11} /></button>
                <button className="folder-tree-action delete" onClick={() => onDeleteNote?.(note)} title="Delete"><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
          {renderInlineCreateRow(folderId)}
          {!isCollapsed && isExpanded && renderFolderTree(folderId, depth + 1)}
        </div>
      );
    });
  };

  return (
    <>
      {isMobileOpen && <div className="sidebar-overlay" onClick={onCloseMobile} />}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-2">
            <Notebook size={24} color="var(--primary)" />
            {!isCollapsed && <h1>&lt; chronoNote /&gt;</h1>}
          </div>
          <button className="mobile-close-btn" onClick={(e) => { e.stopPropagation(); onCloseMobile?.(); }}>
            <X size={20} className="text-muted" />
          </button>
        </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${currentView === 'notes' && selectedFolderId === null ? 'active' : ''}`}
          onClick={() => {
            onViewChange('notes');
            onSelectFolder?.(null);
          }}
          title={isCollapsed ? "My Notes" : ""}
        >
          <Home size={20} />
          {!isCollapsed && <span>My Notes</span>}
        </button>
        <button 
          className={`nav-item ${currentView === 'trash' ? 'active' : ''}`}
          onClick={() => onViewChange('trash')}
          title={isCollapsed ? "Trash" : ""}
        >
          <Trash2 size={20} />
          {!isCollapsed && <span>Trash</span>}
        </button>
        <button className="nav-item" title={isCollapsed ? "Settings" : ""}>
          <Settings size={20} />
          {!isCollapsed && <span>Settings</span>}
        </button>
        {!isCollapsed && (
          <section
            className="folder-tree-section"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              if (draggingFolderId !== null) {
                const draggedFolder = folders.find((item) => item.id === draggingFolderId);
                if (!draggedFolder) {
                  return;
                }
                await moveFolder(draggedFolder, null);
                setDraggingFolderId(null);
                return;
              }
              if (draggingNoteId === null) {
                return;
              }
              const draggedNote = notes.find((item) => item.id === draggingNoteId);
              if (!draggedNote) {
                return;
              }
              await moveNote(draggedNote, null);
              setDraggingNoteId(null);
            }}
          >
            <div className="folder-tree-header">
              <span 
                className="folder-tree-title" 
                onClick={() => {
                  onViewChange('notes');
                  onSelectFolder?.(null);
                }}
                style={{ cursor: 'pointer' }}
              >
                <FolderIcon size={18} />
                Folders
              </span>
              <div className="folder-tree-header-actions">
                <button
                  className="folder-tree-header-btn"
                  title="New root note"
                  onClick={onCreateRootNote}
                >
                  <StickyNote size={14} />
                </button>
                <button
                  className="folder-tree-header-btn"
                  title="New Folder"
                  onClick={() => openCreateInput('root')}
                >
                  <FolderPlus size={14} />
                </button>
              </div>
            </div>
            {(notesByFolder.get(null) ?? []).map((note) => (
              <div
                key={`root-note-${note.id}`}
                className="folder-note-row root folder-note-row--actions"
                draggable
                onDragStart={() => setDraggingNoteId(note.id ?? null)}
                onDragEnd={() => setDraggingNoteId(null)}
              >
                <button
                  className="folder-note-row-main"
                  onClick={() => onOpenNote?.(note)}
                  title={note.title || 'Untitled'}
                >
                  <StickyNote size={13} />
                  <span>{note.title || 'Untitled'}</span>
                </button>
                <div className="folder-note-row-actions">
                  <button className="folder-tree-action" onClick={() => onViewNoteHistory?.(note)} title="History"><History size={11} /></button>
                  <button className="folder-tree-action" onClick={() => onEditNote?.(note)} title="Edit"><Edit2 size={11} /></button>
                  <button className="folder-tree-action delete" onClick={() => onDeleteNote?.(note)} title="Delete"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
            {renderInlineCreateRow('root')}
            {renderFolderTree(null)}
          </section>
        )}
      </nav>

      <button 
        className="collapse-toggle" 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      </aside>
    </>
  );
};

export default Sidebar;
