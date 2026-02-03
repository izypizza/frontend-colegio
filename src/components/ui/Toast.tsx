"use client";

import React, { useEffect, useState } from "react";

interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeStyles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-yellow-600 text-white",
    info: "bg-blue-600 text-white",
  };

  const icons = {
    success: "[OK]",
    error: "[X]",
    warning: "[!]",
    info: "[i]",
  };

  return (
    <div
      className={`${typeStyles[type]} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <span className="text-xl font-bold">{icons[type]}</span>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        className="text-xl font-bold opacity-80 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};
