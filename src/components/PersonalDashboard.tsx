
import React, { useMemo } from 'react';
import {
  Clock,
  Sparkles,
  Target,
  CalendarX,
  Layers,
  Loader2,
  ShieldCheck,
  Award,
  BarChart2,
  Flame,
  Calendar
} from 'lucide-react';
import { WorkLogEntry, TeamMember, PersonalInsight, AttendanceRecord, TaskCategory, TaskStatus } from '../types';
import { StatCard } from './StatCard';
import { AIAvatar } from './AIAvatar';
import { CATEGORY_COLORS } from '../lib/constants';

interface PersonalDashboardProps {
  user: TeamMember;
  logs: WorkLogEntry[];
  attendance: AttendanceRecord[];
  insight: PersonalInsight | null;
  isAnalyzing: boolean;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ user, logs, attendance, insight, isAnalyzing }) => {
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseTimeToDecimal = (timeStr: string | null) => {
    if (!timeStr) return null;
    const parts = timeStr.split(' ');
    if (parts.length < 2) return null;
    const [time, modifier] = parts;
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours + (minutes / 60);
  };

  const calculateDuration = (checkIn: string | null, checkOut: string | null, isToday: boolean) => {
    const start = parseTimeToDecimal(checkIn);
    if (start === null) return 0;

    let end = parseTimeToDecimal(checkOut);
    if (end === null && isToday) {
      const now = new Date();
      end = now.getHours() + (now.getMinutes() / 60);
    }

    if (end === null) return 0;
    return Math.max(0, end - start);
  };

  // Cumulative Effort Strictly from Attendance
  const cumulativeEffortHours = useMemo(() => {
    const myAttendance = attendance.filter(r => r.userId === user.id);
    const todayStr = getLocalDateString(new Date());

    return myAttendance.reduce((acc, record) => {
      const isToday = record.date === todayStr;
      return acc + calculateDuration(record.checkIn, record.checkOut, isToday);
    }, 0);
  }, [attendance, user.id]);

  // STREAK: Count total days with >= 4 hours since Jan 12, 2026
  const streakDays = useMemo(() => {
    const myRecords = attendance.filter(r => r.userId === user.id);
    const missionStart = new Date('2026-01-12');
    missionStart.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalQualifiedDays = 0;
    let cursor = new Date(missionStart);
    const todayStr = getLocalDateString(today);

    while (cursor <= today) {
      const dateStr = getLocalDateString(cursor);
      const record = myRecords.find(r => r.date === dateStr);
      const isToday = dateStr === todayStr;

      const duration = record ? calculateDuration(record.checkIn, record.checkOut, isToday) : 0;

      if (record && duration >= 4) {
        totalQualifiedDays++;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return totalQualifiedDays;
  }, [attendance, user.id]);

  const myLogs = logs.filter(l => l.userId === user.id);
  const totalTaskMinutes = myLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const absenceRecords = attendance.filter(r => r.userId === user.id && r.location === 'On Leave');
  const absenceHours = absenceRecords.length * 8;
  const uniqueCategories = new Set(myLogs.map(l => l.category)).size;

  const categorySummary = Object.values(TaskCategory).map(cat => {
    const mins = myLogs.filter(l => l.category === cat).reduce((acc, curr) => acc + curr.durationMinutes, 0);
    return { name: cat, mins };
  }).filter(c => c.mins > 0).sort((a, b) => b.mins - a.mins);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="bg-indigo-600 dark:bg-indigo-950 rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between border border-white/5">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <AIAvatar member={user} className="w-32 h-32 rounded-full border-4 border-white/20 shadow-inner group" />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl shadow-lg border-2 border-white dark:border-slate-900">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-200 mb-2">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter leading-none mb-4">{user.name}</h1>
            <p className="text-xl text-indigo-100 font-bold flex items-center justify-center sm:justify-start gap-3">
              <Award className="w-6 h-6 text-amber-300" />
              {user.role}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-end gap-1 relative z-10 mt-12 lg:mt-0">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200">Streak</p>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-9xl font-black tracking-tighter tabular-nums drop-shadow-2xl">{streakDays}</p>
            <span className="text-xl font-black text-indigo-300">Days</span>
          </div>
          <div className="bg-amber-500/20 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-amber-100 mt-2 border border-amber-500/20">
            Mission Start: Jan 12, 2026
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Cumulative Effort"
          value={`${Math.round(cumulativeEffortHours)}h`}
          icon={<Clock className="w-6 h-6 text-indigo-600" />}
          color="bg-indigo-50 dark:bg-indigo-900/40"
          description="Total hours logged based exclusively on attendance check-in/out records since Jan 12, 2026."
        />
        <StatCard
          label="Victories (Done)"
          value={myLogs.filter(l => l.status === TaskStatus.DONE).length}
          icon={<Target className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50 dark:bg-emerald-900/40"
          description="Total number of tasks successfully finalized in the tracker."
        />
        <StatCard
          label="Absence Debt"
          value={`${absenceHours}h`}
          icon={<CalendarX className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/40"
          description="Total hours corresponding to 'On Leave' status records."
        />
        <StatCard
          label="Scope Diversity"
          value={uniqueCategories}
          icon={<BarChart2 className="w-6 h-6 text-rose-600" />}
          color="bg-rose-50 dark:bg-rose-900/40"
          description="Distinct operational categories you have contributed to."
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden h-full">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl"><Sparkles className="w-6 h-6 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Career Path Generator</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personalized Growth Synthesis</p>
                </div>
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-6" />
                  <p className="font-black text-xs uppercase tracking-widest">Compiling mission history...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50">
                    <p className="text-2xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic">
                      {insight?.careerGrowthPath ?
                        `"${insight.careerGrowthPath}"` :
                        "Insufficient telemetry. Continue logging operational data to activate the Growth Path Generator."}
                    </p>
                  </div>

                  {insight?.recommendations && (
                    <div className="grid sm:grid-cols-2 gap-6">
                      {insight.recommendations.slice(0, 4).map((rec, i) => (
                        <div key={i} className="flex gap-5 p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-indigo-200 transition-all group">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shrink-0 group-hover:scale-110 transition-transform">
                            {i + 1}
                          </div>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-emerald-600 rounded-2xl shadow-xl"><Layers className="w-6 h-6 text-white" /></div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mission Focus</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Effort Distribution</p>
              </div>
            </div>

            <div className="space-y-8 flex-1">
              {categorySummary.length > 0 ? (
                categorySummary.map((item) => {
                  const percentage = totalTaskMinutes > 0 ? Math.round((item.mins / totalTaskMinutes) * 100) : 0;
                  return (
                    <div key={item.name} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.name}</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{percentage}%</span>
                      </div>
                      <div className="h-3 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${CATEGORY_COLORS[item.name as TaskCategory] || 'bg-slate-400'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-20">
                  <Layers className="w-16 h-16 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Logged Telemetry</p>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                <span>Operational Efficiency</span>
                <span className="text-indigo-600 dark:text-indigo-400">{insight?.focusTimePercentage || 0}% Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
