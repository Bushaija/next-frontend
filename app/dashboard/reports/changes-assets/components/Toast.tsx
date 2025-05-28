import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Allow animation to complete
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 px-4 py-2 rounded shadow-md transition-opacity",
        "flex items-center gap-2",
        isVisible ? "opacity-100" : "opacity-0",
        type === "success" ? "bg-green-100 text-green-800 border-l-4 border-green-500" : "",
        type === "error" ? "bg-red-100 text-red-800 border-l-4 border-red-500" : "",
        type === "info" ? "bg-blue-100 text-blue-800 border-l-4 border-blue-500" : ""
      )}
      role="alert"
      aria-live="polite"
    >
      {type === "success" && (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      
      {type === "error" && (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      
      {type === "info" && (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1-5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      )}
      
      <span>{message}</span>
      
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) {
            setTimeout(onClose, 300);
          }
        }}
        className="ml-2 text-sm hover:text-gray-600"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export interface ToastManagerProps {
  children: (showToast: (props: ToastProps) => void) => React.ReactNode;
}

export function ToastManager({ children }: ToastManagerProps) {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  let nextId = 0;
  
  const showToast = (props: ToastProps) => {
    const id = nextId++;
    setToasts(prev => [...prev, { ...props, id }]);
  };
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  return (
    <>
      {children(showToast)}
      
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
} 