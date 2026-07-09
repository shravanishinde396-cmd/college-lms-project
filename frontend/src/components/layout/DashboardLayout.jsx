import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:flex transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8">
        <Topbar />
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
