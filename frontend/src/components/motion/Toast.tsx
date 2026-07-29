import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'xp' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return { border: 'border-l-brand-emerald', icon: 'fa-circle-check text-brand-emerald' };
    case 'error':
      return { border: 'border-l-rose-500', icon: 'fa-circle-exclamation text-rose-500' };
    case 'warning':
      return { border: 'border-l-amber-500', icon: 'fa-triangle-exclamation text-amber-500' };
    case 'xp':
      return { border: 'border-l-amber-400', icon: 'fa-star text-amber-400' };
    case 'info':
    default:
      return { border: 'border-l-cyan-500', icon: 'fa-circle-info text-cyan-500' };
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev.slice(-2), { ...toast, id }]); // Max 3 visible
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[var(--z-toast)] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const styles = getToastStyles(toast.type);
  const duration = toast.duration || 4000;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`pointer-events-auto sm-glass p-4 rounded-xl border-l-4 ${styles.border} min-w-[300px] max-w-sm shadow-premium-lg relative overflow-hidden`}
    >
      <div className="flex items-start gap-3 relative z-10">
        <i className={`fa-solid ${styles.icon} mt-0.5`} />
        <div>
          <h4 className="text-sm font-bold text-white">{toast.title}</h4>
          {toast.message && <p className="text-xs text-slate-300 mt-1">{toast.message}</p>}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-auto text-slate-500 hover:text-white transition-colors"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      
      {/* Auto-dismiss progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-0.5 bg-white/20"
      />
    </motion.div>
  );
};
