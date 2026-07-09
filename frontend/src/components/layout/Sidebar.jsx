import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import getDashboardLinks from '../../utils/getDashboardLinks';
import useAuth from '../../hooks/useAuth';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Sidebar() {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const links = getDashboardLinks(user?.role);

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4 lg:hidden dark:border-slate-850 dark:bg-slate-900">
        <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">CampusSphere</span>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)} 
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:static lg:z-0 dark:border-slate-850 dark:bg-slate-900",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 py-4">
          {!isCollapsed && (
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              CampusSphere
            </span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-650 lg:block dark:hover:bg-slate-800"
            aria-label="Toggle Collapse"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Links list */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink 
                key={link.to} 
                to={link.to} 
                end 
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 relative group",
                  isActive 
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{link.label}</span>}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <span className="absolute left-full ml-4 scale-0 rounded-md bg-slate-905 px-2 py-1 text-xs text-white shadow-md transition-all group-hover:scale-100 dark:bg-slate-800 whitespace-nowrap z-50">
                    {link.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
