import { useEffect, useState, useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import api from '../../api/axios';
import { Sun, Moon, LogOut, Bell, Check, Eye } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { dark, setDark } = useTheme();
  
  // Notification Center States
  const [notices, setNotices] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('readNoticeIds') || '[]');
    } catch {
      return [];
    }
  });
  
  const [selectedNotice, setSelectedNotice] = useState(null);
  const dropdownRef = useRef(null);

  const fetchNotices = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notices');
      setNotices(data.notices || []);
    } catch (err) {
      console.error('Failed to load notices', err);
    }
  };

  useEffect(() => {
    fetchNotices();
    // Poll for notices every 60 seconds
    const interval = setInterval(fetchNotices, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotices = notices.filter(n => !readIds.includes(n._id));
  const unreadCount = unreadNotices.length;

  const handleMarkAllRead = () => {
    const allIds = notices.map(n => n._id);
    setReadIds(allIds);
    localStorage.setItem('readNoticeIds', JSON.stringify(allIds));
  };

  const handleMarkOneRead = (id) => {
    if (readIds.includes(id)) return;
    const next = [...readIds, id];
    setReadIds(next);
    localStorage.setItem('readNoticeIds', JSON.stringify(next));
  };

  const getNoticesPageLink = () => {
    if (user?.role === 'admin') return '/admin/notices';
    if (user?.role === 'faculty' || user?.role === 'teacher') return '/faculty/courses'; // teachers check notices on dashboard
    return '/student/notices';
  };

  return (
    <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:shadow-none relative z-30">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-xs text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold">Logged in as</p>
        <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">
          {user?.name} 
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ml-2">
            {user?.role}
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notification Bell Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-850 dark:text-slate-400 dark:hover:bg-slate-800/80 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Card */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-150 shadow-lg dark:bg-slate-900 dark:border-slate-800 overflow-hidden text-sm">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-white">Notice Announcements</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead} 
                      className="text-xs text-indigo-600 hover:text-indigo-850 dark:text-indigo-400 font-semibold flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notices.length ? (
                    notices.slice(0, 5).map(notice => {
                      const isRead = readIds.includes(notice._id);
                      return (
                        <div 
                          key={notice._id} 
                          className={`p-4 flex gap-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer ${
                            !isRead ? 'bg-slate-50/30 dark:bg-slate-800/10' : ''
                          }`}
                          onClick={() => {
                            setSelectedNotice(notice);
                            handleMarkOneRead(notice._id);
                            setIsOpen(false);
                          }}
                        >
                          <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                            !isRead ? 'bg-indigo-500' : 'bg-transparent'
                          }`} />
                          <div className="space-y-1">
                            <h4 className={`text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 ${
                              !isRead ? 'font-bold' : 'font-normal'
                            }`}>
                              {notice.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {notice.message}
                            </p>
                            <span className="text-[10px] text-slate-400 block pt-1">
                              {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Just now'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-500">
                      No announcements posted.
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link 
                    to={getNoticesPageLink()} 
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-indigo-650 hover:underline dark:text-indigo-400 font-semibold"
                  >
                    View all announcements
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-850 dark:text-slate-400 dark:hover:bg-slate-800/80 transition-colors" 
          onClick={() => setDark(!dark)}
          aria-label="Toggle Theme"
        >
          {dark ? <Sun className="h-4.5 w-4.5 text-amber-500 animate-spin-slow" /> : <Moon className="h-4.5 w-4.5 text-indigo-500" />}
        </button>

        {/* Logout Button */}
        <button 
          className="btn-primary p-2.5 rounded-xl flex items-center justify-center" 
          onClick={logout}
          aria-label="Logout"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Full Notice Modal Popup */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedNotice.title}</h3>
              <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-150 dark:border-slate-700 uppercase">
                {selectedNotice.audience || 'All'}
              </span>
            </div>
            
            <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
              {selectedNotice.message}
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-405">
              <span>Posted by: {selectedNotice.postedBy?.name || 'Administrator'}</span>
              <span>{selectedNotice.createdAt ? new Date(selectedNotice.createdAt).toLocaleString() : ''}</span>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedNotice(null)}>Close Notice</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
