import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ToastProps {
  title: string;
  description?: string;
  duration?: number;
  type?: 'default' | 'success' | 'error' | 'warning';
}

interface ToastState extends ToastProps {
  id: string;
  visible: boolean;
}

// Create a global state for toasts
let toasts: ToastState[] = [];
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const toast = (props: ToastProps) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastState = {
    id,
    visible: true,
    duration: 5000, // Default duration
    type: 'default',
    ...props
  };
  
  toasts = [...toasts, newToast];
  notifyListeners();
  
  // Auto-dismiss after duration
  setTimeout(() => {
    dismissToast(id);
  }, newToast.duration);
  
  return id;
};

export const dismissToast = (id: string) => {
  toasts = toasts.map(t => 
    t.id === id ? { ...t, visible: false } : t
  );
  notifyListeners();
  
  // Remove from array after animation
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 300);
};

export const useToast = () => {
  const [, setForceUpdate] = useState({});
  
  useEffect(() => {
    const listener = () => setForceUpdate({});
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);
  
  return {
    toasts: toasts.filter(t => t.visible),
    toast,
    dismiss: dismissToast
  };
};

function ToastContainer() {
  const { toasts, dismiss } = useToast();
  
  if (toasts.length === 0) return null;
  
  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`
            bg-background border rounded-md shadow-lg p-4 
            flex items-start gap-3 animate-in fade-in slide-in-from-top-5
            ${toast.type === 'error' ? 'border-destructive' : 
              toast.type === 'success' ? 'border-green-500' : 
              toast.type === 'warning' ? 'border-yellow-500' : 
              'border-border'}
          `}
        >
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{toast.title}</h3>
            {toast.description && (
              <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>
            )}
          </div>
          <button 
            onClick={() => dismiss(toast.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

export function Toaster() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  if (!isMounted) return null;
  
  return <ToastContainer />;
}
