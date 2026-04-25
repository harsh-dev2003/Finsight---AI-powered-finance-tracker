import React from 'react';
import Sidebar from './Sidebar';
import ChatPanel from './ChatPanel';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background text-textPrimary font-sans relative overflow-x-hidden selection:bg-accent/30 selection:text-white">
      {/* Ambient Background Glows via CSS */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-success/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <Sidebar />
      <main className="flex-1 p-6 md:p-10 md:ml-20 xl:ml-64 min-h-screen transition-all duration-400 z-10 relative">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <ChatPanel />
    </div>
  );
};

export default Layout;
