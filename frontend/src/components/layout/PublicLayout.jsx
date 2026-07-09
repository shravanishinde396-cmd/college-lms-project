import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="min-h-[80vh]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
