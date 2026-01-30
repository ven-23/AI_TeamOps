
import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Filter,
  Search,
  Plus,
  ChevronDown,
  LayoutGrid,
  CheckSquare,
  Square,
  SortAsc,
  SortDesc,
  Trash2,
  Edit2,
  Save,
  X,
  RotateCcw,
  User as UserIcon
} from 'lucide-react';
import { WorkLogEntry, TeamMember, TaskStatus, TaskCategory } from '../types';
import { CATEGORY_COLORS, STATUS_COLORS } from '../lib/constants';
import { AIAvatar } from './AIAvatar';

interface TaskTrackerProps {
  logs: WorkLogEntry[];
  members: TeamMember[];
  onToggleStatus: (id: string, newStatus: TaskStatus) => void;
  onUpdateTask: (id: string, updates: Partial<WorkLogEntry>) => void;
  onDeleteTask: (id: string, e?: React.MouseEvent) => void;
  onAddTask: (memberId: string) => string;
  initialMemberId?: string | 'All';
}

export const TaskTracker: React.FC<TaskTrackerProps> = ({
  logs, members, onToggleStatus, onUpdateTask, onDeleteTask, onAddTask, initialMemberId = 'All'
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'All'>(initialMemberId);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Done' | 'Pending'>('All');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // State for inline editing
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<WorkLogEntry>>({});

  useEffect(() => {
    if (initialMemberId) setSelectedMemberId(initialMemberId);
  }, [initialMemberId]);

  const filteredLogs = useMemo(() => {
    let result = logs.filter(log => {
      const matchesMember = selectedMemberId === 'All' || log.userId === selectedMemberId;
      const matchesSearch = log.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || log.category === categoryFilter;
      let matchesStatus = true;
      if (statusFilter === 'Done') matchesStatus = log.status === TaskStatus.DONE;
      if (statusFilter === 'Pending') matchesStatus = log.status !== TaskStatus.DONE;
      return matchesMember && matchesSearch && matchesStatus && matchesCategory;
    });
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [logs, selectedMemberId, searchQuery, statusFilter, categoryFilter, sortOrder]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setSelectedMemberId('All');
  };

  const handleStartEdit = (log: WorkLogEntry) => {
    setEditingTaskId(log.id);
    setEditFormData({ ...log });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditFormData({});
  };

  const handleSaveEdit = () => {
    if (editingTaskId && editFormData) {
      onUpdateTask(editingTaskId, editFormData);
      setEditingTaskId(null);
      setEditFormData({});
    }
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'All' || categoryFilter !== 'All' || selectedMemberId !== 'All';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Project Backlog</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Operational Task Tracking</p>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-2 transition-colors">
              <RotateCcw className="w-3 h-3" /> Clear Filters
            </button>
          )}
          <button onClick={() => {
            const newId = onAddTask(selectedMemberId === 'All' ? members[0].id : selectedMemberId);
            const newLog = logs.find(l => l.id === newId) || { id: newId, taskName: 'New Task', category: TaskCategory.DEVELOPMENT, status: TaskStatus.NOT_STARTED, timestamp: new Date().toISOString(), userId: selectedMemberId === 'All' ? members[0].id : selectedMemberId };
            handleStartEdit(newLog as WorkLogEntry);
          }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-indigo-200/50 dark:shadow-none flex items-center gap-2 active:scale-95 transition-all hover:bg-indigo-700">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Team Member Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button onClick={() => setSelectedMemberId('All')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${selectedMemberId === 'All' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
          <LayoutGrid className="w-4 h-4" />
          All Team
        </button>
        {members.map(member => (
          <button key={member.id} onClick={() => setSelectedMemberId(member.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${selectedMemberId === member.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
            <AIAvatar member={member} className="w-6 h-6 rounded-full" />
            {member.code}
          </button>
        ))}
      </div>

      {/* Advanced Search and Filters Toolbar */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid lg:grid-cols-12 gap-4 items-center">
          {/* Search Column */}
          <div className="lg:col-span-5 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by task or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white shadow-inner placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter Column */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[50px]">Status:</span>
            <div className="flex flex-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
              {(['All', 'Pending', 'Done'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Column */}
          <div className="lg:col-span-3 flex items-center justify-end gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort:</span>
            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors shadow-sm"
            >
              {sortOrder === 'newest' ? <><SortDesc className="w-4 h-4" /> Newest</> : <><SortAsc className="w-4 h-4" /> Oldest</>}
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

        {/* Category Filter Group */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scope:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('All')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${categoryFilter === 'All' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-400'}`}
            >
              All Categories
            </button>
            {Object.values(TaskCategory).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${categoryFilter === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-400'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="w-[80px] px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="w-[180px] px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Owner</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Task Detail</th>
                <th className="w-[150px] px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="w-[180px] px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Scope</th>
                <th className="w-[150px] px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isEditing = editingTaskId === log.id;
                  const member = members.find(m => m.id === (isEditing ? editFormData.userId : log.userId));
                  const displayTimestamp = isEditing ? (editFormData.timestamp || log.timestamp) : log.timestamp;
                  const logDate = new Date(displayTimestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={log.id} className={`group transition-colors ${isEditing ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}>
                      {/* Status Column */}
                      <td className="px-6 py-6 text-center">
                        {isEditing ? (
                          <select
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as TaskStatus })}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-[10px] font-bold outline-none text-slate-900 dark:text-white"
                          >
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <button onClick={() => onToggleStatus(log.id, log.status === TaskStatus.DONE ? TaskStatus.IN_PROGRESS : TaskStatus.DONE)} className="transition-all hover:scale-110 active:scale-90">
                            {log.status === TaskStatus.DONE ? <CheckSquare className="w-6 h-6 text-emerald-500" /> : <Square className="w-6 h-6 text-slate-300 dark:text-slate-700" />}
                          </button>
                        )}
                      </td>

                      {/* Owner Column */}
                      <td className="px-6 py-6">
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            <select
                              value={editFormData.userId}
                              onChange={(e) => setEditFormData({ ...editFormData, userId: e.target.value })}
                              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-[10px] font-bold outline-none text-slate-900 dark:text-white"
                            >
                              {members.map(m => <option key={m.id} value={m.id}>{m.code}</option>)}
                            </select>
                            <div className="flex items-center gap-2 opacity-50">
                              <AIAvatar member={member!} className="w-6 h-6" />
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{member?.code}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <AIAvatar member={member!} className="w-9 h-9" />
                            <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{member?.code}</span>
                          </div>
                        )}
                      </td>

                      {/* Task Detail Column */}
                      <td className="px-6 py-6">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editFormData.taskName}
                              onChange={(e) => setEditFormData({ ...editFormData, taskName: e.target.value })}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
                              placeholder="Task Title"
                            />
                            <input
                              type="text"
                              value={editFormData.description}
                              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-[10px] font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
                              placeholder="Task Description"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className={`text-sm font-bold ${log.status === TaskStatus.DONE ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                              {log.taskName}
                            </p>
                            {log.description && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium line-clamp-1">{log.description}</p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Date Column */}
                      <td className="px-6 py-6">
                        {isEditing ? (
                          <input
                            type="date"
                            value={new Date(editFormData.timestamp || log.timestamp).toISOString().split('T')[0]}
                            onChange={(e) => setEditFormData({ ...editFormData, timestamp: new Date(e.target.value).toISOString() })}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-[10px] font-bold outline-none text-slate-900 dark:text-white"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {logDate}
                          </div>
                        )}
                      </td>

                      {/* Scope/Category Column */}
                      <td className="px-6 py-6">
                        {isEditing ? (
                          <select
                            value={editFormData.category}
                            onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as TaskCategory })}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-[10px] font-bold outline-none text-slate-900 dark:text-white"
                          >
                            {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 ${CATEGORY_COLORS[log.category as TaskCategory] || 'bg-slate-100 text-slate-600'}`}>
                            {log.category}
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <button onClick={handleSaveEdit} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors active:scale-90" title="Save Changes">
                                <Save className="w-5 h-5" />
                              </button>
                              <button onClick={handleCancelEdit} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors active:scale-90" title="Cancel">
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleStartEdit(log)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors active:scale-90" title="Edit Task">
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button onClick={(e) => onDeleteTask(log.id, e)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors active:scale-90" title="Delete Task">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        <Filter className="w-8 h-8 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-black text-lg">No matching operations</p>
                        <p className="text-slate-500 text-sm font-medium mt-1">Adjust filters or refine search query.</p>
                      </div>
                      <button onClick={clearFilters} className="text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] pt-2">
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
