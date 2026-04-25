import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, PieChart, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`fixed top-0 left-0 h-full bg-sidebar border-r border-white/5 z-50 transition-all duration-400 flex flex-col items-center py-8 backdrop-blur-3xl shadow-2xl ${expanded ? 'w-[240px]' : 'w-20'}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex items-center justify-center mb-10 w-full px-5">
        <div className="bg-accent/10 p-2.5 rounded-2xl border border-accent/20 text-accent shadow-[0_0_15px_rgba(108,99,255,0.4)]">
          <Zap size={24} className="animate-pulse duration-3000"/>
        </div>
        {expanded && <span className="ml-4 font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-wide">FinSight</span>}
      </div>

      <nav className="flex-1 w-full space-y-3 px-3">
        <NavLink to="/" className={({ isActive }) => `group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive ? 'bg-accent/10 text-accent shadow-[inset_0_1px_rgba(255,255,255,0.1)]' : 'text-textMuted hover:bg-white/5 hover:text-textPrimary'}`}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 top-[15%] h-[70%] w-1 bg-accent rounded-r-md shadow-[0_0_10px_rgba(108,99,255,0.8)]"></div>}
              <LayoutDashboard size={22} className={`min-w-[22px] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {expanded && <span className="ml-4 font-medium text-[15px] whitespace-nowrap">Dashboard</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/upload" className={({ isActive }) => `group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive ? 'bg-accent/10 text-accent shadow-[inset_0_1px_rgba(255,255,255,0.1)]' : 'text-textMuted hover:bg-white/5 hover:text-textPrimary'}`}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 top-[15%] h-[70%] w-1 bg-accent rounded-r-md shadow-[0_0_10px_rgba(108,99,255,0.8)]"></div>}
              <UploadCloud size={22} className={`min-w-[22px] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {expanded && <span className="ml-4 font-medium text-[15px] whitespace-nowrap">Imports</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/budgets" className={({ isActive }) => `group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive ? 'bg-accent/10 text-accent shadow-[inset_0_1px_rgba(255,255,255,0.1)]' : 'text-textMuted hover:bg-white/5 hover:text-textPrimary'}`}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 top-[15%] h-[70%] w-1 bg-accent rounded-r-md shadow-[0_0_10px_rgba(108,99,255,0.8)]"></div>}
              <PieChart size={22} className={`min-w-[22px] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {expanded && <span className="ml-4 font-medium text-[15px] whitespace-nowrap">Budgets</span>}
            </>
          )}
        </NavLink>
      </nav>

      <div className="w-full px-3">
        <button onClick={logout} className="group flex items-center px-4 py-3.5 w-full rounded-2xl text-textMuted hover:bg-danger/10 hover:text-danger transition-all justify-start">
          <LogOut size={22} className="min-w-[22px] group-hover:-translate-x-1 transition-transform" />
          {expanded && <span className="ml-4 font-medium text-[15px] whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
