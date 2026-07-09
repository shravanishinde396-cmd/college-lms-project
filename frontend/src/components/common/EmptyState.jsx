import { FolderOpen } from 'lucide-react';

export default function EmptyState({ 
  title = 'No data found', 
  subtitle = 'Try adding some records.', 
  icon: Icon = FolderOpen,
  actionButton
}) {
  return (
    <div className="card flex flex-col items-center justify-center p-12 text-center border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-soft">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{subtitle}</p>
      {actionButton && (
        <div className="mt-6">
          {actionButton}
        </div>
      )}
    </div>
  );
}
