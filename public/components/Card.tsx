import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-1 ${className}`}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;