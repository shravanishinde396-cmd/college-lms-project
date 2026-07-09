import Card from '../ui/Card';
import { cn } from '../../utils/cn';

export default function StatCard({ label, value, icon: Icon, trend, className }) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow relative overflow-hidden group", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
          <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {trend && (
            <p className={cn(
              "mt-2 text-xs font-medium flex items-center gap-1",
              trend.type === 'up' ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"
            )}>
              <span>{trend.type === 'up' ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
              <span className="text-slate-400 dark:text-slate-500">{trend.label || 'vs last month'}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
}
