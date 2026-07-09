import { cn } from "../../utils/cn";

export default function Button({ children, variant='primary', className='', ...props }) {
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10",
        variant === 'primary' 
          ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200" 
          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800/80",
        className
      )} 
      {...props}
    >
      {children}
    </button>
  );
}
