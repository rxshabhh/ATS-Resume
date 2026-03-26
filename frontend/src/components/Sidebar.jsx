import React from 'react';
import { Home, Clock, Folder, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/', id: 'home' },
    { icon: Folder, path: '/upload', id: 'folders' },
    { icon: Clock, path: '/history', id: 'history' },
  ];

  return (
    <div className="flex flex-col justify-between items-center w-20 py-8 bg-white/70 dark:bg-[#1C1C24]/70 backdrop-blur-sm border border-white/40 dark:border-white/10 rounded-full h-full shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-6 items-center">
        {/* Logo/Icon */}
        <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mb-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-4 h-4 rounded-sm border-2 border-white dark:border-black" />
        </div>
        
        {/* Nav Links */}
        <nav className="flex flex-col gap-6">
          {navItems.map(({ icon: Icon, path, id }) => {
            const isActive = location.pathname === path || (path === '/analyze' && location.pathname.includes('/analyze'));
            return (
              <button
                key={id}
                onClick={() => path !== '#' && navigate(path)}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-gray-900 dark:bg-white shadow-lg text-white dark:text-black scale-110' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Theme Toggle */}
      <div className="flex flex-col gap-4 items-center bg-gray-100 dark:bg-white/10 p-2 rounded-full">
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors ${!isDarkMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-white'}`}
        >
          <Sun size={18} />
        </button>
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-900 shadow-sm text-white' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <Moon size={18} />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
