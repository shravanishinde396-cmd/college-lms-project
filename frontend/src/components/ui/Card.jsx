import { cn } from "../../utils/cn";

export default function Card({ children, className='' }) { 
  return (
    <div className={cn("rounded-2xl bg-white shadow-soft border border-slate-100 dark:bg-slate-900 dark:border-slate-850 dark:shadow-none p-5 transition-all duration-200", className)}>
      {children}
    </div>
  ); 
}
