import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-850 dark:bg-slate-950/90 transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          CampusSphere
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/about" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
            About
          </Link>
          <Link to="/courses" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
            Courses
          </Link>
          <Link to="/contact" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
            Contact
          </Link>
          {user ? (
            <Link className="btn-primary py-1.5 text-xs sm:text-sm" to="/dashboard">
              Dashboard
            </Link>
          ) : (
            <Link className="btn-primary py-1.5 text-xs sm:text-sm" to="/login">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
