import React from 'react';

const Loader = ({ size = 'md', type = 'spinner' }) => {
  if (type === 'skeleton') {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-12 bg-gray-800 rounded-lg w-full"></div>
        <div className="h-24 bg-gray-800 rounded-lg w-full"></div>
        <div className="h-24 bg-gray-800 rounded-lg w-full"></div>
        <div className="h-24 bg-gray-800 rounded-lg w-full"></div>
      </div>
    );
  }

  // Size calculations
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-t-brand-primary border-r-brand-secondary border-b-transparent border-l-transparent animate-spin`}
      ></div>
      <span className="text-gray-400 font-medium text-sm tracking-wider uppercase animate-pulse">
        PulseLink
      </span>
    </div>
  );
};

export default Loader;
