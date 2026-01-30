
import React from 'react';
import { TeamMember, WorkLogEntry, TaskStatus } from '../types';
import { STATUS_COLORS, CATEGORY_COLORS } from '../lib/constants';
import { CheckCircle2, Clock, AlertCircle, Circle, ArrowRight } from 'lucide-react';
import { AIAvatar } from './AIAvatar';

interface ActivityStatusTableProps {
  members: TeamMember[];
  logs: WorkLogEntry[];
  onViewMember?: (memberId: string) => void;
}

const StatusIcon = ({ status }: { status: TaskStatus }) => {
  switch (status) {
    case TaskStatus.DONE: return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case TaskStatus.IN_PROGRESS: return <Clock className="w-4 h-4 text-blue-500" />;
    case TaskStatus.OVERDUE: return <AlertCircle className="w-4 h-4 text-rose-500" />;
    default: return <Circle className="w-4 h-4 text-slate-300" />;
  }
};

export const ActivityStatusTable: React.FC<ActivityStatusTableProps> = ({ members, logs, onViewMember }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">Team Operational Status</h3>
        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Real-time Pulse</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
              <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Team Member</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Current Task</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {members.map(member => {
              const lastLog = logs.filter(l => l.userId === member.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
              return (
                <tr key={member.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <AIAvatar member={member} className="w-12 h-12" />
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{member.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-200 font-bold">{lastLog?.taskName || "Standing by"}</td>
                  <td className="px-6 py-6 text-center">
                    {lastLog && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <StatusIcon status={lastLog.status} />
                        <span className={`text-xs font-black ${STATUS_COLORS[lastLog.status].split(' ')[1]}`}>{lastLog.status}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => onViewMember?.(member.id)} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors"><ArrowRight className="w-5 h-5" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
