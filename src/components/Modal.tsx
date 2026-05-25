/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ id, isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id={id}
      className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 relative shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-50 mb-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 px-2 text-[10px] font-bold border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
