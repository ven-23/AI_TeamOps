
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard,
  FileText,
  Settings as SettingsIcon,
  Menu,
  Bell,
  Search,
  Users,
  X,
  Moon,
  Sun,
  Zap,
  LogOut,
  ListTodo,
  Hand,
  BookOpen,
  Megaphone,
  UserCheck,
  User,
  ShieldCheck,
  Folder,
  Check,
  AlertCircle,
  Info,
  Trash2
} from 'lucide-react';
import { WorkLogEntry, WeeklyReport, ProductivityInsight, PersonalInsight, AIProcessedLog, TaskCategory, TaskStatus, Notification, AppSettings, TeamMember, ActiveTab, Announcement, AttendanceRecord } from './types';
import { MOCK_LOGS, TEAM_MEMBERS, MOCK_ANNOUNCEMENTS, MOCK_ATTENDANCE } from './lib/constants';
import { Dashboard } from './components/Dashboard';
import { PersonalDashboard } from './components/PersonalDashboard';
import { WeeklyReportView } from './components/WeeklyReportView';
import { TaskTracker } from './components/TaskTracker';
import { LoginPage } from './components/LoginPage';
import { HandController } from './components/HandController';
import { Documentation } from './components/Documentation';
import { Announcements } from './components/Announcements';
import { Attendance } from './components/Attendance';
import { AIAvatar } from './components/AIAvatar';
import { Materials } from './components/Materials';
import { generateProductivityInsights, generateWeeklyReport, generatePersonalInsights } from './lib/geminiService';

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const safeJSONParse = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Local storage parsing failed for key: ${key}`, error);
    return fallback;
  }
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('teamops_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<TeamMember>(() => {
    return safeJSONParse('teamops_current_user', TEAM_MEMBERS[0]);
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [logs, setLogs] = useState<WorkLogEntry[]>(() => {
    return safeJSONParse('teamops_logs', MOCK_LOGS);
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    return safeJSONParse('teamops_announcements', MOCK_ANNOUNCEMENTS);
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    return safeJSONParse('teamops_attendance', MOCK_ATTENDANCE);
  });

  const [insights, setInsights] = useState<ProductivityInsight | null>(null);
  const [personalInsight, setPersonalInsight] = useState<PersonalInsight | null>(null);
  const [report, setReport] = useState<WeeklyReport | null>(() => {
    return safeJSONParse('teamops_report', null);
  });

  const [isAnalyzingInsights, setIsAnalyzingInsights] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHandControlEnabled, setIsHandControlEnabled] = useState(false);
  const [trackerMemberFilter, setTrackerMemberFilter] = useState<string | 'All'>('All');
  const [showNotifications, setShowNotifications] = useState(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    return safeJSONParse('teamops_settings', { aiSensitivity: 'balanced', darkMode: true, emailDigest: true });
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', title: 'System Synchronized', message: 'The operational grid is live.', time: 'Just now', read: false, type: 'success' },
    { id: 'n2', title: 'Internal Broadcast', message: 'Romeo published a new mission roadmap.', time: '1h ago', read: false, type: 'info' }
  ]);

  // Sync state to local storage
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('teamops_logs', JSON.stringify(logs));
      localStorage.setItem('teamops_announcements', JSON.stringify(announcements));
      localStorage.setItem('teamops_attendance', JSON.stringify(attendance));
      localStorage.setItem('teamops_settings', JSON.stringify(settings));
      localStorage.setItem('teamops_report', JSON.stringify(report));

      if (settings.darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [logs, announcements, attendance, settings, report, isLoggedIn]);

  // Generate Insights
  useEffect(() => {
    if (isLoggedIn && activeTab === 'dashboard' && !insights && logs.length > 0 && !isAnalyzingInsights) {
      setIsAnalyzingInsights(true);
      generateProductivityInsights(logs)
        .then(setInsights)
        .catch(console.error)
        .finally(() => setIsAnalyzingInsights(false));
    }
  }, [activeTab, logs, insights, isAnalyzingInsights, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && activeTab === 'personal' && !isAnalyzingInsights && currentUser) {
      setIsAnalyzingInsights(true);
      generatePersonalInsights(logs, currentUser)
        .then(setPersonalInsight)
        .catch(console.error)
        .finally(() => setIsAnalyzingInsights(false));
    }
  }, [activeTab, currentUser, logs, isLoggedIn]);

  const addNotification = useCallback((title: string, message: string, type: 'info' | 'alert' | 'success' = 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: 'Just now',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const newReport = await generateWeeklyReport(logs);
      setReport(newReport);
      addNotification('Report Ready', 'Weekly mission brief is now available in the archives.', 'success');
    } catch (error) {
      addNotification('Telemetry Error', 'Failed to synthesize the weekly operations report.', 'alert');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAttendanceIn = (location: 'Office' | 'Remote', vibe: string, msg: string) => {
    const newRec: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      date: getLocalDateString(new Date()),
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOut: null,
      location,
      vibe,
      statusMessage: msg
    };
    setAttendance(prev => [newRec, ...prev]);
    addNotification('Check-in Logged', `Workspace initialized via ${location}.`, 'success');
  };

  const handleAttendanceOut = (id: string) => {
    setAttendance(prev => prev.map(r => r.id === id ? { ...r, checkOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : r));
    addNotification('Check-out Logged', 'Operational session terminated.', 'info');
  };

  const handleLogin = (member: TeamMember) => {
    setCurrentUser(member);
    setIsLoggedIn(true);
    setPersonalInsight(null);
    localStorage.setItem('teamops_logged_in', 'true');
    localStorage.setItem('teamops_current_user', JSON.stringify(member));
    addNotification('Auth Success', `Access granted to Node ${member.code}.`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('teamops_logged_in');
    localStorage.removeItem('teamops_current_user');
  };

  const handleAddLogs = (newEntries: AIProcessedLog[], targetUserId: string) => {
    const targetUser = TEAM_MEMBERS.find(m => m.id === targetUserId)!;
    const newLogs: WorkLogEntry[] = newEntries.map(entry => ({
      id: Math.random().toString(36).substr(2, 9),
      userId: targetUserId,
      userName: targetUser.name,
      taskName: entry.taskName,
      category: entry.category as TaskCategory,
      status: TaskStatus.DONE,
      durationMinutes: entry.durationMinutes,
      description: entry.description,
      timestamp: new Date().toISOString()
    }));
    setLogs(prev => [...newLogs, ...prev]);
    addNotification('Telemetry Updated', `Appended ${newEntries.length} entries for ${targetUser.code}.`, 'success');
  };

  const handleToggleTaskStatus = (id: string, newStatus: TaskStatus) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handleUpdateTask = (id: string, updates: Partial<WorkLogEntry>) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Delete this task?')) {
      setLogs(prev => prev.filter(l => l.id !== id));
      addNotification('Task Purged', 'Telemetery removed from system.', 'alert');
    }
  };

  const handleAddTask = (memberId: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const member = TEAM_MEMBERS.find(m => m.id === memberId)!;
    const newLog: WorkLogEntry = {
      id,
      userId: memberId,
      userName: member.name,
      taskName: 'New Operation',
      category: TaskCategory.ADMIN,
      status: TaskStatus.NOT_STARTED,
      description: '',
      durationMinutes: 60,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
    return id;
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  const NavItem = ({ id, label, icon: Icon, badge, onClick }: { id: ActiveTab, label: string, icon: any, badge?: string, onClick?: () => void }) => (
    <button
      onClick={() => {
        if (onClick) onClick();
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-bold text-sm ${activeTab === id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        {label}
      </div>
      {badge && <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-lg text-[10px] uppercase font-black">{badge}</span>}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard
          logs={logs}
          insights={insights}
          isAnalyzing={isAnalyzingInsights}
          userName={currentUser.name}
          onViewMemberTasks={(mid) => { setTrackerMemberFilter(mid); setActiveTab('tracker'); }}
        />;
      case 'personal':
        return <PersonalDashboard
          user={currentUser}
          logs={logs}
          attendance={attendance}
          insight={personalInsight}
          isAnalyzing={isAnalyzingInsights}
        />;
      case 'attendance':
        return <Attendance
          records={attendance}
          currentUser={currentUser}
          onCheckIn={handleAttendanceIn}
          onCheckOut={handleAttendanceOut}
        />;
      case 'tracker':
        return <TaskTracker
          logs={logs}
          members={TEAM_MEMBERS}
          onToggleStatus={handleToggleTaskStatus}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
          initialMemberId={trackerMemberFilter}
        />;
      case 'report':
        return <WeeklyReportView
          report={report}
          onGenerate={handleGenerateReport}
          isLoading={isGeneratingReport}
        />;
      case 'materials':
        return <Materials />;
      case 'announcements':
        return <Announcements
          announcements={announcements}
          currentUser={currentUser}
          onAdd={(ann) => setAnnouncements(prev => [{ ...ann, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), authorId: currentUser.id, authorName: currentUser.name, readCount: 0 }, ...prev])}
          onUpdate={(id, up) => setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...up } : a))}
          onDelete={(id) => setAnnouncements(prev => prev.filter(a => a.id !== id))}
        />;
      case 'docs':
        return <Documentation />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-inter">
      {isHandControlEnabled && <HandController onClose={() => setIsHandControlEnabled(false)} />}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full shadow-2xl z-20 transition-colors">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">TeamOps</h1>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">Operational OS</p>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-8 overflow-y-auto pb-8">
          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
              <User className="w-3 h-3" /> My Terminal
            </h3>
            <NavItem id="personal" label="Private Space" icon={ShieldCheck} />
            <NavItem id="attendance" label="Attendance" icon={UserCheck} />
            <NavItem id="tracker" label="Task List" icon={ListTodo} onClick={() => setTrackerMemberFilter(currentUser.id)} />
          </div>

          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
              <Users className="w-3 h-3" /> Squad HQ
            </h3>
            <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} onClick={() => setTrackerMemberFilter('All')} />
            <NavItem id="announcements" label="Broadcasts" icon={Megaphone} badge={announcements.length.toString()} />
            <NavItem id="report" label="Weekly Reports" icon={FileText} />
            <NavItem id="materials" label="Files" icon={Folder} />
          </div>

          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
              <SettingsIcon className="w-3 h-3" /> System
            </h3>
            <NavItem id="docs" label="Documentation" icon={BookOpen} />
            <button
              onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-bold text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {settings.darkMode ? 'Light Theme' : 'Dark Theme'}
              </div>
            </button>
            <button
              onClick={() => setIsHandControlEnabled(!isHandControlEnabled)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-bold text-sm ${isHandControlEnabled ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <div className="flex items-center gap-3">
                <Hand className="w-5 h-5" /> Gestures
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isHandControlEnabled ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isHandControlEnabled ? 'translate-x-4' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        <div className="p-6 mt-auto border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-800">
            <AIAvatar member={currentUser} className="w-10 h-10" />
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate leading-none">{currentUser.name}</p>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate mt-1">{currentUser.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main id="scroll-viewport" className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {/* Top Header (Mobile Friendly) */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{activeTab}</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Node: {currentUser.code}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              />
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all ${showNotifications ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-indigo-500/30' : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Notifications</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{notifications.length} System Logs</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={markAllNotificationsAsRead} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors" title="Mark all as read">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={clearAllNotifications} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-xl transition-colors" title="Clear all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif))}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${n.read ? 'bg-transparent border-transparent opacity-60' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 shadow-sm'}`}
                        >
                          <div className="flex gap-4">
                            <div className={`p-2 rounded-xl h-fit ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              n.type === 'alert' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                                'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                              }`}>
                              {n.type === 'success' ? <Check className="w-4 h-4" /> : n.type === 'alert' ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{n.title}</p>
                              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                              <p className="text-[9px] font-black text-indigo-500/50 uppercase tracking-widest pt-1">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <Bell className="w-8 h-8 text-slate-200 dark:text-slate-800" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active telemetry</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={() => setShowNotifications(false)} className="w-full py-2 text-[10px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-[0.2em] transition-colors">
                        Close Log
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <AIAvatar member={currentUser} className="w-9 h-9 border-2 border-indigo-100 dark:border-slate-800 shadow-sm" onClick={() => setActiveTab('personal')} />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-10 lg:p-12">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-0 left-0 w-80 h-full bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex flex-col h-full">
              <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-indigo-600 fill-indigo-600" />
                  <h1 className="text-xl font-black text-slate-900 dark:text-white">TeamOps</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-8">
                <div className="space-y-1">
                  <NavItem id="personal" label="Private Space" icon={ShieldCheck} />
                  <NavItem id="attendance" label="Attendance" icon={UserCheck} />
                  <NavItem id="tracker" label="Task List" icon={ListTodo} />
                </div>
                <div className="space-y-1">
                  <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                  <NavItem id="announcements" label="Broadcasts" icon={Megaphone} />
                  <NavItem id="report" label="Weekly Reports" icon={FileText} />
                  <NavItem id="materials" label="Files" icon={Folder} />
                  <NavItem id="docs" label="Documentation" icon={BookOpen} />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-2xl font-black text-xs uppercase tracking-widest">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
