import React from "react";
import { cn } from "../../utils/cn";

const Input = React.forwardRef(({ className = "", error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-slate-100 dark:focus:ring-slate-800",
          error && "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-950/30",
          className
        )}
        {...props}
      />
      {error && (
        <span className="mt-1 block text-xs text-red-500">{error.message || error}</span>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;