"use client";

import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface UserWarningModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

export default function UserWarningModal({
  isOpen,
  isProcessing,
  onClose,
  onSubmit
}: UserWarningModalProps) {
  const [warningMessage, setWarningMessage] = useState<string>('');

  const handleSubmit = async () => {
    if (!warningMessage) return;
    await onSubmit(warningMessage);
    setWarningMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-normal">Send Warning</h3>
          <button
            className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
            onClick={onClose}
            disabled={isProcessing}
          >
            <FiX size={16} />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Warning Message
          </label>
          <textarea
            value={warningMessage}
            onChange={(e) => setWarningMessage(e.target.value)}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            rows={4}
            placeholder="Explain the reason for this warning..."
            disabled={isProcessing}
          ></textarea>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-white/5 rounded-lg text-sm text-white/80 hover:bg-white/10"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-yellow-500/20 rounded-lg text-sm text-yellow-300 hover:bg-yellow-500/30"
            onClick={handleSubmit}
            disabled={!warningMessage || isProcessing}
          >
            {isProcessing ? 'Sending...' : 'Send Warning'}
          </button>
        </div>
      </div>
    </div>
  );
}
