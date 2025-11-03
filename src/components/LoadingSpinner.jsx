import React from 'react';

const LoadingSpinner = ({ fullscreen = false }) => {
  return (
    <div
      className={`${
        fullscreen
          ? 'fixed inset-0 bg-black/30 z-50 flex items-center justify-center'
          : 'flex items-center justify-center p-4'
      }`}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
    </div>
  );
};

export default LoadingSpinner;
