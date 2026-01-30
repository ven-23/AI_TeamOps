
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, Building2, Laptop, Search, Sparkles, Map, LogOut, LogIn, User, CheckCircle2, CalendarDays, MapPin, Calendar, Lock
} from 'lucide-react';
import { AttendanceRecord, TeamMember } from '../types';
import { TEAM_MEMBERS } from '../lib/constants';
import { AIAvatar } from './AIAvatar';

interface AttendanceProps {
  records: AttendanceRecord[];
  currentUser: TeamMember;
  onCheckIn: (location: 'Office' | 'Remote', vibe: string, msg: string) => void;
  onCheckOut: (id: string) => void;
}

const VIBES = [
  { emoji: '⚡', label: 'Energized' },
  { emoji: '☕', label: 'Caffeinated' },
  { emoji: '🧠', label: 'Focus' },
  { emoji: '🌙', label: 'Night Owl' },
  { emoji: '🚀', label: 'Productive' },
  { emoji: '🧘', label: 'Zen' },
  { emoji: '🏗️', label: 'Building' },
  { emoji: '💡', label: 'Creative' },
];

export const Attendance: React.FC<AttendanceProps> = ({ records, currentUser, onCheckIn, onCheckOut }) => {
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [todayDate, setTodayDate] = useState(() => getLocalDateString(new Date()));
  const [ledgerDate, setLedgerDate] = useState(todayDate);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const isOperational = useMemo(() => {
    const hours = currentTime.getHours();
    return hours >= 5 && hours < 17;
  }, [currentTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const currentLocalStr = getLocalDateString(now);
      
      if (currentLocalStr !== todayDate) {
        setTodayDate(currentLocalStr);
        setLedgerDate(currentLocalStr);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [todayDate]);

  const myRecord = useMemo(() => 
    records.find(r => r.userId === currentUser.id && r.date === todayDate),
    [records, currentUser.id, todayDate]
  );
  
  const isCheckedOut = myRecord?.checkOut;
  
  const [vibe, setVibe] = useState('⚡');
  const [msg, setMsg] = useState('');
  const [loc, setLoc] = useState<'Office' | 'Remote'>('Office');

  const filteredMembers = TEAM_MEMBERS.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeRecords = records.filter(r => r.date === todayDate && !r.checkOut);
  
  const ledgerRecords = records
    .filter(r => r.date === ledgerDate)
    .filter(r => {
      const member = TEAM_MEMBERS.find(m => m.id === r.userId);
      return member?.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (a.checkOut && !b.checkOut) return 1;
      if (!a.checkOut && b.checkOut) return -1;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em]">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Attendance Control</h1>
            <span className="text-2xl font-mono font-black text-indigo-500/50 tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6 pr-6">
           <div className="bg-emerald-50 dark:bg-emerald-900/20 px-5 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Active Today</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none">{activeRecords.length}</p>
           </div>
           <div className="flex -space-x-3 py-2 pl-2">
              {activeRecords.slice(0, 5).map(r => {
                const member = TEAM_MEMBERS.find(m => m.id === r.userId);
                return member ? <AIAvatar key={r.id} member={member} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 ring-2 ring-transparent hover:ring-indigo-500 hover:z-10 transition-all shadow-sm" /> : null;
              })}
              {activeRecords.length > 5 && (
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border-2 border-white dark:border-slate-900">
                  +{activeRecords.length - 5}
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6 sticky top-24 z-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col justify-center">
            
            {!isOperational && !myRecord ? (
              <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                   <Lock className="w-10 h-10 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Standby</h2>
                  <p className="text-slate-500 font-medium mt-2 max-w-xs mx-auto">
                    Shift window is strictly <span className="text-indigo-600 dark:text-indigo-400 font-black">05:00 - 17:00</span>. Terminal is currently offline.
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Status</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300">Terminal Locked</span>
                </div>
              </div>
            ) : myRecord && !isCheckedOut ? (
              <div className="relative animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                <div className="absolute top-0 right-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </span>
                </div>
                
                <div className="mt-6 mb-8 relative">
                   <div className="w-28 h-28 rounded-3xl bg-indigo-600 flex items-center justify-center text-5xl shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20 text-white relative z-10 border-4 border-white dark:border-slate-800">
                     {myRecord.vibe}
                   </div>
                   <div className="absolute inset-0 bg-indigo-600 blur-3xl opacity-30 animate-pulse"></div>
                </div>

                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentUser.name}</h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">{currentUser.role}</p>

                <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mt-8 border border-slate-100 dark:border-slate-700/50">
                   <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                         {myRecord.location === 'Office' ? <Building2 className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                         <span className="text-xs font-black uppercase tracking-widest">{myRecord.location}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 font-mono">{myRecord.checkIn}</span>
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Focus Objective</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic truncate">
                        "{myRecord.statusMessage}"
                      </p>
                   </div>
                </div>

                <button 
                  onClick={() => onCheckOut(myRecord.id)} 
                  className="w-full mt-6 bg-white border-2 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex flex-col items-center justify-center gap-2 group dark:bg-slate-800/50"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Currently Signed In
                  </span>
                  <div className="flex items-center gap-2">
                    <span>COMPLETE SESSION</span> <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            ) : isCheckedOut ? (
              <div className="relative animate-in zoom-in-95 duration-500 flex flex-col items-center text-center p-4">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-emerald-200 dark:border-emerald-800">
                   <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Duty Complete</h2>
                <p className="text-slate-500 font-medium mt-2 tracking-tight">Telemetry recorded for {currentUser.name}.</p>
                
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mt-8 border border-slate-100 dark:border-slate-800">
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><LogIn className="w-3 h-3" /> Signed In</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{myRecord.checkIn}</span>
                   </div>
                   <div className="h-px bg-slate-200 dark:bg-slate-700 w-full mb-3"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><LogOut className="w-3 h-3" /> Signed Out</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{myRecord.checkOut}</span>
                   </div>
                </div>
                <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Available again at 05:00 tomorrow</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Register Node</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ready for {todayDate}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setLoc('Office')} 
                        className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${loc === 'Office' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'}`}
                      >
                        <Building2 className="w-4 h-4" /> Office
                      </button>
                      <button 
                        onClick={() => setLoc('Remote')} 
                        className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${loc === 'Remote' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'}`}
                      >
                        <Laptop className="w-4 h-4" /> Remote
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Daily Vibe</label>
                    <div className="grid grid-cols-4 gap-3">
                      {VIBES.map((v) => (
                        <button
                          key={v.emoji}
                          onClick={() => setVibe(v.emoji)}
                          className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2 ${vibe === v.emoji ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm scale-105' : 'bg-transparent border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          <span className="text-2xl">{v.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Objective</label>
                    <input 
                      value={msg} 
                      onChange={e => setMsg(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400" 
                      placeholder="What's the goal for this shift?" 
                    />
                  </div>
                </div>

                <button 
                  onClick={() => onCheckIn(loc, vibe, msg || "Active Duty")} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
                >
                  <span>SIGN IN</span> <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 pl-6 gap-4">
            <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 py-3">
              <Map className="w-4 h-4" />
              Presence Grid
            </h2>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search team..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {filteredMembers.filter(m => m.id !== currentUser.id).map(member => {
              const record = records.find(r => r.userId === member.id && r.date === todayDate && !r.checkOut);
              const isActive = !!record;
              
              return (
                <div 
                  key={member.id} 
                  className={`relative group bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border-2 transition-all duration-300 ${isActive ? 'border-indigo-100 dark:border-indigo-900/30 shadow-xl' : 'border-slate-100 dark:border-slate-800 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <AIAvatar member={member} className="w-14 h-14" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white dark:border-slate-900 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white leading-none">{member.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1.5 tracking-widest">{member.role}</p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="text-3xl animate-bounce-slow">
                        {record.vibe}
                      </div>
                    )}
                  </div>

                  {isActive ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                         <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-2">
                           "{record.statusMessage}"
                         </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-2">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                          {record.location === 'Office' ? <Building2 className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
                          {record.location}
                        </div>
                        <div className="text-slate-400 font-mono">
                          {record.checkIn}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                       <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                         OFFLINE
                       </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in slide-in-from-bottom-8 duration-700">
         <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 gap-4">
            <div className="flex items-center gap-4">
               <div className="relative">
                 <CalendarDays className="w-6 h-6 text-indigo-500" />
                 {ledgerDate === todayDate && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                    Squad Ledger
                    {ledgerDate === todayDate && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md border border-emerald-100 ml-2 animate-pulse">LIVE</span>}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">Operational presence logs for selected date.</p>
               </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Focus:</span>
               <input 
                  type="date" 
                  value={ledgerDate}
                  onChange={(e) => setLedgerDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-black text-slate-700 dark:text-slate-200 outline-none uppercase tracking-wider cursor-pointer font-mono"
               />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Member</th>
                     <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                     <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">In</th>
                     <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Out</th>
                     <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status/Vibe</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ledgerRecords.length > 0 ? (
                    ledgerRecords.map(record => {
                       const member = TEAM_MEMBERS.find(m => m.id === record.userId);
                       if (!member) return null;
                       const isTodayRecord = record.date === todayDate;
                       const isCurrentlyActive = !record.checkOut && isTodayRecord;
                       
                       return (
                          <tr key={record.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${isCurrentlyActive ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="relative">
                                     <AIAvatar member={member} className="w-10 h-10" />
                                     {isCurrentlyActive && (
                                       <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                                     )}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{member.name}</p>
                                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{member.role}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                   {record.location === 'Office' ? 
                                      <Building2 className="w-3.5 h-3.5 text-indigo-500" /> : 
                                      <Laptop className="w-3.5 h-3.5 text-purple-500" />
                                   }
                                   <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{record.location}</span>
                                </div>
                             </td>
                             <td className="px-6 py-5 text-center">
                                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{record.checkIn}</span>
                             </td>
                             <td className="px-6 py-5 text-center">
                                {record.checkOut ? (
                                   <span className="text-xs font-bold text-slate-500 font-mono">{record.checkOut}</span>
                                ) : (
                                   <div className="flex items-center justify-center gap-2">
                                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/30">Active</span>
                                      {isTodayRecord && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>}
                                   </div>
                                )}
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                   <span className="text-xl shrink-0">{record.vibe}</span>
                                   <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic truncate max-w-[180px]">{record.statusMessage}</span>
                                </div>
                             </td>
                          </tr>
                       );
                    })
                  ) : (
                     <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-slate-400 text-sm font-medium italic">
                           No recorded telemetry for {ledgerDate}.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
