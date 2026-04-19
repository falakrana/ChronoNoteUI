import { useEffect, useState } from 'react';

/**
 * AppSkeleton: Full-view loading state shown during auth submission.
 * 
 * UX Choice: Overlays the auth form with a skeleton that mirrors the logged-in layout
 * (sidebar + top bar + note cards). This provides visual continuity and reduces perceived
 * wait time during cold starts. The auth form remains mounted but hidden beneath the overlay
 * to preserve form state if the request fails.
 * 
 * Accessibility:
 * - aria-busy and aria-live communicate loading state to screen readers
 * - Respects prefers-reduced-motion for shimmer animation
 * - Keyboard focus remains trapped in auth form (overlay is non-interactive)
 */

interface AppSkeletonProps {
  isDarkTheme?: boolean;
}

export default function AppSkeleton({ isDarkTheme = false }: AppSkeletonProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Slight entrance delay for smoothness
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`skeleton-overlay ${isVisible ? 'skeleton-visible' : ''}`}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading your workspace"
    >
      {/* Sidebar skeleton */}
      <aside className="skeleton-sidebar">
        <div className="skeleton-sidebar-header">
          <div className="skeleton-logo" />
        </div>
        <nav className="skeleton-nav">
          <div className="skeleton-nav-item" />
          <div className="skeleton-nav-item" />
        </nav>
      </aside>

      {/* Main content skeleton */}
      <div className="skeleton-main">
        {/* Top bar skeleton */}
        <header className="skeleton-topbar">
          <div className="skeleton-search" />
          <div className="skeleton-actions">
            <div className="skeleton-action-btn" />
            <div className="skeleton-action-btn" />
            <div className="skeleton-new-btn" />
          </div>
        </header>

        {/* Notes grid skeleton */}
        <div className="skeleton-notes-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <article key={i} className="skeleton-note-card" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="skeleton-note-title" />
              <div className="skeleton-note-content">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
              <div className="skeleton-note-footer">
                <div className="skeleton-date" />
                <div className="skeleton-actions-group">
                  <div className="skeleton-icon-btn" />
                  <div className="skeleton-icon-btn" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
