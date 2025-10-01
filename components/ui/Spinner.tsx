import React from 'react';

export const Spinner: React.FC<{className?: string}> = ({ className="" }) => {
  return (
    <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 ${className}`}></div>
  );
};
