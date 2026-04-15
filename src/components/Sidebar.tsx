import React from 'react';
import { Notebook, Trash2, Home, Settings } from 'lucide-react';

interface SidebarProps {
  currentView: 'notes' | 'trash';
  onViewChange: (view: 'notes' | 'trash') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Notebook size={24} color="#6366f1" />
        <h1>NoteApp</h1>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${currentView === 'notes' ? 'active' : ''}`}
          onClick={() => onViewChange('notes')}
        >
          <Home size={20} />
          <span>My Notes</span>
        </button>
        <button 
          className={`nav-item ${currentView === 'trash' ? 'active' : ''}`}
          onClick={() => onViewChange('trash')}
        >
          <Trash2 size={20} />
          <span>Trash</span>
        </button>
        <button className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
