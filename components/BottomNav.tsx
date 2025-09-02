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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-screen-sm bg-gray-900/60 dark:bg-black/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl z-50">
      <div className="flex justify-around items-center p-2">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`relative flex flex-col items-center justify-center w-full py-2 text-xs sm:text-sm transition-all duration-300 rounded-xl ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label={item.label}
            >
              {isActive && (
                <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
              )}
              <Icon className="w-6 h-6 mb-1" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;