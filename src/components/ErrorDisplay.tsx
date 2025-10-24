'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-20 bg-red-50 border border-red-200 rounded-lg">
      <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
      <h3 className="text-xl font-semibold text-red-800 mb-2">
        Đã có lỗi xảy ra
      </h3>
      <p className="text-red-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all shadow-md"
      >
        <RefreshCw className="w-5 h-5" />
        <span>Thử lại</span>
      </button>
    </div>
  );
};

export default ErrorDisplay;
