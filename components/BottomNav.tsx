
import React from 'react';
import { Page } from '../types';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
}

interface BottomNavProps {
  navItems: NavItem[];
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ navItems, activePage, setActivePage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around max-w-screen-md mx-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs sm:text-sm transition-colors duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span>{item.label}</span>
              {isActive && (
                <div className="w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mt-1"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
