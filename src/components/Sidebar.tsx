import React, { useState } from 'react';
import { Notebook, Trash2, Home, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentView: 'notes' | 'trash';
  onViewChange: (view: 'notes' | 'trash') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
        <Notebook size={24} color="var(--primary)" />
        {!isCollapsed && <h1>&lt; chronoNote /&gt;</h1>}
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${currentView === 'notes' ? 'active' : ''}`}
          onClick={() => onViewChange('notes')}
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
      </nav>

      <button 
        className="collapse-toggle" 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
};

export default Sidebar;

