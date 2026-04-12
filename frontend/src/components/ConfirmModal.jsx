import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
            type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
          }`}>
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black text-secondary-900 mb-2">{title}</h3>
          <p className="text-sm text-secondary-500 font-medium leading-relaxed">{message}</p>
        </div>
        
        <div className="flex border-t border-secondary-50">
          <button 
            onClick={onClose}
            className="flex-1 py-5 text-sm font-bold text-secondary-400 hover:bg-secondary-50 transition-all border-r border-secondary-50"
          >
            Cancelar
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-5 text-sm font-black transition-all ${
              type === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-primary-600 hover:bg-primary-50'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
