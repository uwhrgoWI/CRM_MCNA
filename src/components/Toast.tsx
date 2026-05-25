/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-850',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-rose-50 border-rose-250 text-rose-850',
          icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-850',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-850',
          icon: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 border rounded-2xl shadow-xl max-w-sm animate-slideUp font-sans text-xs font-semibold ${styles.bg}`}>
      {styles.icon}
      <p className="leading-snug pr-4">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-900/10 rounded-lg absolute top-2 right-2 cursor-pointer transition text-current"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
