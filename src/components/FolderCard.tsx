import React from 'react';
import { Folder as FolderIcon, Trash2, RotateCcw } from 'lucide-react';
import type { Folder } from '../types';

interface FolderCardProps {
  folder: Folder;
  isTrash?: boolean;
  onSelect?: (id: number) => void;
  onDelete?: (folder: Folder) => void;
  onRestore?: (folder: Folder) => void;
  onPermanentDelete?: (folder: Folder) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  isTrash,
  onSelect,
  onDelete,
  onRestore,
  onPermanentDelete,
}) => {
  return (
    <div
      className="note-card folder-card animate-fade-in"
      onClick={() => !isTrash && folder.id && onSelect?.(folder.id)}
    >
      <div className="folder-card-header">
        <div className="folder-icon-wrapper">
          <FolderIcon size={28} className="text-primary" />
        </div>
        <h3 className="note-title" title={folder.name}>{folder.name}</h3>
      </div>
      <div className="note-footer">
        <span className="note-date">{isTrash ? 'Trashed Folder' : 'Folder'}</span>
        <div className="note-actions">
          {!isTrash ? (
            <button
              className="action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(folder);
              }}
              title="Move to Trash"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <>
              <button
                className="action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore?.(folder);
                }}
                title="Restore Folder"
              >
                <RotateCcw size={16} />
              </button>
              <button
                className="action-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onPermanentDelete?.(folder);
                }}
                title="Delete Permanently"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderCard;
