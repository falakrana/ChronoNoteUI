import React, { useState } from 'react';
import { Notebook, Trash2, Home, Settings, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  currentView: 'notes' | 'trash';
  onViewChange: (view: 'notes' | 'trash') => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isMobileOpen, onCloseMobile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    </>
  );
};

export default Sidebar;

