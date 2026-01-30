
import React, { useState } from 'react';
import {
  Megaphone,
  Pin,
  AlertCircle,
  Sparkles,
  Calendar,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Tag,
  Save
} from 'lucide-react';
import { Announcement, TeamMember } from '../types';
import { TEAM_MEMBERS } from '../lib/constants';
import { AIAvatar } from './AIAvatar';

interface AnnouncementsProps {
  announcements: Announcement[];
  currentUser: TeamMember;
  onAdd: (ann: Omit<Announcement, 'id' | 'timestamp' | 'authorId' | 'authorName' | 'readCount'>) => void;
  onUpdate: (id: string, updates: Partial<Announcement>) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_STYLES = {
  feature: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  event: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  urgent: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  internal: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const CATEGORY_ICONS = {
  feature: <Sparkles className="w-3.5 h-3.5" />,
  event: <Calendar className="w-3.5 h-3.5" />,
  urgent: <AlertCircle className="w-3.5 h-3.5" />,
  internal: <Tag className="w-3.5 h-3.5" />,
};

export const Announcements: React.FC<AnnouncementsProps> = ({
  announcements,
  currentUser,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingAnn, setViewingAnn] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState<Omit<Announcement, 'id' | 'timestamp' | 'authorId' | 'authorName' | 'readCount'>>({
    title: '',
    content: '',
    category: 'internal',
    isPinned: false
  });

  const pinned = announcements.filter(a => a.isPinned).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const others = announcements.filter(a => !a.isPinned).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleOpenAdd = () => {
    setFormData({ title: '', content: '', category: 'internal', isPinned: false });
    setIsAdding(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingId(a.id);
    setFormData({ title: a.title, content: a.content, category: a.category, isPinned: a.isPinned || false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
      setIsAdding(false);
    }
  };

  const handleReadFull = (a: Announcement) => {
    setViewingAnn(a);
    if (a.readCount !== undefined) {
      onUpdate(a.id, { readCount: (a.readCount || 0) + 1 });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <Megaphone className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Central Communications</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Team Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Internal updates, system changes, and team events.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center gap-2 hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          PUBLISH UPDATE
        </button>
      </div>

      {/* Editor Modal Overlay */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsAdding(false); setEditingId(null); }}></div>
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{editingId ? 'Refine Update' : 'New Broadcast'}</h2>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heading</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Office Refresh 2024"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold appearance-none outline-none cursor-pointer"
                  >
                    <option value="internal">Internal</option>
                    <option value="feature">Infrastructure</option>
                    <option value="event">Social/Event</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-xs transition-all tracking-widest uppercase ${formData.isPinned ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/40 dark:border-amber-900/50 dark:text-amber-300' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'}`}
                  >
                    <Pin className={`w-4 h-4 ${formData.isPinned ? 'rotate-45 text-amber-500' : ''}`} />
                    {formData.isPinned ? 'Featured Entry' : 'Standard Feed'}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detail Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white leading-relaxed font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Describe the update in detail..."
                />
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 uppercase tracking-widest">
                  {editingId ? <Save className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                  {editingId ? 'Update Feed' : 'Launch Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reader Modal Overlay */}
      {viewingAnn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setViewingAnn(null)}></div>
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-12 space-y-8">
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${CATEGORY_STYLES[viewingAnn.category]}`}>
                  {CATEGORY_ICONS[viewingAnn.category]}
                  {viewingAnn.category}
                </div>
                <button onClick={() => setViewingAnn(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-90">
                  <X className="w-7 h-7 text-slate-400" />
                </button>
              </div>

              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{viewingAnn.title}</h2>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">{viewingAnn.content}</p>
              </div>

              <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {(() => {
                    const author = TEAM_MEMBERS.find(m => m.id === viewingAnn.authorId);
                    return author ? <AIAvatar member={author} className="w-12 h-12 rounded-full shadow-sm border border-slate-200" /> : null;
                  })()}
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{viewingAnn.authorName}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Team Contributor</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Published</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{new Date(viewingAnn.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Audience</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{viewingAnn.readCount} Views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured / Pinned Feed */}
      {pinned.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Pin className="w-3 h-3 rotate-45" />
            Spotlight Updates
          </h2>
          <div className="grid gap-8">
            {pinned.map(a => (
              <div key={a.id} className="relative group animate-in slide-in-from-bottom-4 duration-500">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-200 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/30 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-amber-100/10 dark:shadow-none flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest ${CATEGORY_STYLES[a.category]}`}>
                        {CATEGORY_ICONS[a.category]}
                        {a.category}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date(a.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-amber-600 transition-colors">
                      {a.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-2 text-lg">
                      {a.content}
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                      <button onClick={() => handleReadFull(a)} className="bg-slate-950 text-white dark:bg-white dark:text-slate-950 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all active:scale-95 shadow-lg">
                        EXPAND ENTRY <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 min-w-[120px]">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {(a.authorId === currentUser.id) && (
                        <>
                          <button onClick={() => handleOpenEdit(a)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors active:scale-90"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => onDelete(a.id)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors active:scale-90"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{a.authorName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">Author</p>
                      </div>
                      {(() => {
                        const author = TEAM_MEMBERS.find(m => m.id === a.authorId);
                        return author ? <AIAvatar member={author} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-lg" /> : null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid Feed */}
      <div className="space-y-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
          Team Feed
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {others.map((a) => (
            <div key={a.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full animate-in fade-in duration-500">
              <div className="space-y-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${CATEGORY_STYLES[a.category]}`}>
                    {CATEGORY_ICONS[a.category]}
                    {a.category}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {(a.authorId === currentUser.id) && (
                      <>
                        <button onClick={() => handleOpenEdit(a)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-90"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(a.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-90"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight line-clamp-2">
                    {a.title}
                  </h3>
                  <p className="text-base text-slate-500 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">
                    {a.content}
                  </p>
                </div>
              </div>

              <div className="pt-8 flex flex-col gap-5 mt-auto">
                <button onClick={() => handleReadFull(a)} className="w-full text-center py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-indigo-300 hover:bg-slate-50 dark:hover:bg-indigo-900/20 transition-all active:scale-95 hover:border-indigo-500 dark:hover:border-indigo-400">
                  READ CONTRIBUTION
                </button>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const author = TEAM_MEMBERS.find(m => m.id === a.authorId);
                      return author ? <AIAvatar member={author} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" /> : null;
                    })()}
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-100 uppercase tracking-widest leading-none">{a.authorName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{new Date(a.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State / Add Card */}
          <button
            onClick={handleOpenAdd}
            className="group min-h-[300px] rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/10 transition-all duration-300 active:scale-98"
          >
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 group-hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors">Broadcast Node</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-bold">Initiate a team-wide update</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
