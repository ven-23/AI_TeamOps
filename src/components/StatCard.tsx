
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, description }) => (
  <div className="group relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 cursor-default">
    <div className={`p-4 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">{value}</p>
    </div>
    
    {description && (
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-52 p-4 bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-medium rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-xl z-20 text-center leading-relaxed border border-white/10 scale-95 group-hover:scale-100 origin-bottom">
        {description}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 dark:bg-slate-700 rotate-45 border-b border-r border-white/10"></div>
      </div>
    )}
  </div>
);
