import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  isDangerous = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="overlay" style={{ zIndex: 1000 }} onClick={onCancel}>
          <motion.div
            className="editor-container"
            style={{ maxWidth: '400px', padding: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className={isDangerous ? 'text-accent' : 'text-primary'} />
                <h3 className="font-semibold text-lg">{title}</h3>
              </div>
              <button className="action-btn" onClick={onCancel}>
                <X size={20} />
              </button>
            </div>
            
            <p className="text-muted mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button 
                className={isDangerous ? 'btn-danger' : 'btn-primary'} 
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
