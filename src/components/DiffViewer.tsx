import React from 'react';
import diff_match_patch from 'diff-match-patch';

interface DiffViewerProps {
  oldText: string;
  newText: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ oldText, newText }) => {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(oldText || '', newText || '');
  dmp.diff_cleanupSemantic(diffs);

  return (
    <div className="diff-viewer">
      {diffs.map(([type, text], index) => {
        let className = 'diff-chunk';
        if (type === 1) className += ' diff-added'; // DIFF_INSERT
        if (type === -1) className += ' diff-removed'; // DIFF_DELETE

        return (
          <span key={index} className={className}>
            {text}
          </span>
        );
      })}
    </div>
  );
};

export default DiffViewer;
