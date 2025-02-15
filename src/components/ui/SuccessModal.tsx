"use client";

import { useEffect } from "react";
import { FiCheck, FiAlertCircle } from "react-icons/fi";

type SuccessModalProps = {
  message: string;
  onClose: () => void;
};

export function SuccessModal({ message, onClose }: SuccessModalProps) {
  const isError = message.toLowerCase().includes("error") || 
                 message.toLowerCase().includes("failed") ||
                 message.toLowerCase().includes("invalid") ||
                 message.toLowerCase().includes("unauthorized");

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); // Auto close after 2 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`${isError ? 'bg-red-500/20' : 'bg-green-500/20'} p-2 rounded-full`}>
            {isError ? (
              <FiAlertCircle className="text-red-500 w-6 h-6" />
            ) : (
              <FiCheck className="text-green-500 w-6 h-6" />
            )}
          </div>
          <p className={`${isError ? 'text-red-200' : 'text-white/90'} text-lg`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
