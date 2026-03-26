import React from 'react';
import Sidebar from './Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F2FD] dark:bg-[#0B0C10] transition-colors duration-300 flex items-center justify-center p-4 lg:p-8">
      {/* Background Gradient Orbs — reduced blur for performance */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E0C6FF] dark:bg-[#4E31AA] rounded-full blur-[80px] opacity-40 pointer-events-none will-change-transform"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#C6E6FF] dark:bg-[#1A3A5A] rounded-full blur-[80px] opacity-40 pointer-events-none will-change-transform"></div>

      {/* Main Glass Container */}
      <div className="relative w-full max-w-[1600px] h-[90vh] bg-white/40 dark:bg-[#12131C]/60 backdrop-blur-lg border border-white/60 dark:border-white/10 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex p-4 lg:p-6 gap-6">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/60 dark:bg-[#181922]/80 rounded-[32px] border border-white/50 dark:border-white/5 shadow-inner">
          
          {/* Top Bar Navigation */}
          <div className="h-20 px-8 flex items-center shrink-0">
            {/* Nav Pills */}
            <div className="flex p-1 bg-white/60 dark:bg-[#252631]/60 backdrop-blur-md rounded-full border border-white/40 dark:border-white/5">
              <button onClick={() => navigate('/')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${location.pathname === '/' ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Dashboard</button>
              <button onClick={() => navigate('/upload')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${location.pathname === '/upload' ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Upload</button>
              <button onClick={() => navigate('/analyze')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${location.pathname.includes('/analyze') ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Analyze</button>
            </div>
          </div>

          {/* Scrollable Children */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;

