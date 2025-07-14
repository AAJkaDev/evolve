import React from 'react';

interface LoadingProps {
  message?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = "Loading...", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-dashed border-black mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
