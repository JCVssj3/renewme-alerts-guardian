
import React from 'react';

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`min-h-screen bg-primary-bg p-2 sm:p-4 pt-6 sm:pt-8 ${className}`}
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}
    >
      {children}
    </div>
  );
};

export default ScreenContainer;
