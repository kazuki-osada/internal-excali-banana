import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
        {/* Inner Icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-xl">🍌</span>
        </div>
      </div>
      <p className="text-gray-500 font-medium animate-pulse text-sm">
        Magic is happening...
      </p>
    </div>
  );
};