
import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  File,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  Plus,
  MoreVertical,
  Download,
  ExternalLink,
  Trash2,
  X,
  Check,
  Edit2,
  Upload
} from 'lucide-react';
import { Material } from '../types';

const INITIAL_MATERIALS: Material[] = [
  { id: 'm1', name: 'Q1 Strategic Framework', type: 'doc', category: 'Strategic', size: '2.4 MB', addedAt: '2025-01-10', url: 'https://docs.google.com/internal/q1-framework' },
  { id: 'm2', name: 'Agentic Workflow Handoff', type: 'image', category: 'Technical', size: '1.1 MB', addedAt: '2025-01-12', url: 'https://assets.aitea.io/handoff-flow.png' },
  { id: 'm3', name: 'Gemini 3 Pro API Reference', type: 'link', category: 'AI Research', addedAt: '2025-01-14', url: 'https://ai.google.dev/gemini-api/docs' },
  { id: 'm4', name: 'Squad Brand Identity v2', type: 'file', category: 'Design', size: '15.8 MB', addedAt: '2025-01-11', url: 'https://design.aitea.io/brand-pack.zip' },
];

export const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('teamops_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<Material, 'id' | 'addedAt'>>({
    name: '',
    type: 'doc',
    category: 'Technical',
    url: '',
    size: '1.0 MB'
  });

  useEffect(() => {
    localStorage.setItem('teamops_materials', JSON.stringify(materials));
  }, [materials]);

  const categories = ['All', ...Array.from(new Set(materials.map(m => m.category)))];

  const filtered = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  const getIcon = (type: Material['type']) => {
    switch (type) {
      case 'doc': return <FileText className="w-6 h-6 text-blue-500" />;
      case 'image': return <ImageIcon className="w-6 h-6 text-pink-500" />;
      case 'link': return <LinkIcon className="w-6 h-6 text-indigo-500" />;
      default: return <File className="w-6 h-6 text-slate-500" />;
    }
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', type: 'doc', category: 'Technical', url: '', size: '0.5 MB' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Material) => {
    setFormData({ name: m.name, type: m.type, category: m.category, url: m.url, size: m.size });
    setEditingId(m.id);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Confirm permanent deletion of this vault asset? This operation cannot be reversed.')) {
      setMaterials(prev => {
        const updated = prev.filter(m => m.id !== id);
        // Direct storage update to ensure immediate persistence
        localStorage.setItem('teamops_materials', JSON.stringify(updated));
        return updated;
      });
      setActiveMenuId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

        let type: Material['type'] = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('text')) type = 'doc';

        setFormData(prev => ({
          ...prev,
          name: file.name,
          url: url,
          size: sizeInMb,
          type: type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setMaterials(prev => prev.map(m => m.id === editingId ? { ...m, ...formData } : m));
    } else {
      const newMat: Material = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        addedAt: new Date().toISOString().split('T')[0],
      };
      setMaterials(prev => [newMat, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleAction = (item: Material) => {
    if (item.type === 'link') {
      window.open(item.url, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2 text-indigo-600 dark:text-indigo-400">
            <Folder className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Vault Telemetry</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Mission Materials</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-lg">Central squad repository for live files and architectural documentation.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95"
        >
          <Plus className="w-5 h-5" /> REGISTER ASSET
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white shadow-sm"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Classification</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(item => (
              <div key={item.id} className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-7 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col h-full border-b-4 border-b-transparent hover:border-b-indigo-500">
                <div className="flex items-start justify-between mb-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {getIcon(item.type)}
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-6 h-6" />
                    </button>
                    {activeMenuId === item.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                        <button onClick={() => handleOpenEdit(item)} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                          <Edit2 className="w-3.5 h-3.5" /> Edit Metadata
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Asset
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{item.category}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {item.addedAt}</span>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  {item.size ? (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.size}</span>
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">External</span>
                  )}
                  <button
                    onClick={() => handleAction(item)}
                    className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] hover:translate-x-1 transition-transform"
                  >
                    {item.type === 'link' ? 'VISIT' : 'DOWNLOAD'}
                    {item.type === 'link' ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-200 dark:text-slate-700" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Zero matches in vault</h3>
              <p className="text-slate-500 mt-4 font-medium">Try broadening your telemetry parameters.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{editingId ? 'Edit Metadata' : 'New Asset Entry'}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Resource Registration</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-7 h-7 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Mode</label>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'link' })}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'link' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
                  >
                    External Pointer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'file' })}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type !== 'link' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
                  >
                    Direct Upload
                  </button>
                </div>
              </div>

              {formData.type !== 'link' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Device Link</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer group"
                  >
                    <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    <p className="text-xs font-bold text-slate-500 text-center">
                      {formData.name ? `Linked: ${formData.name}` : 'Click to select from device storage'}
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational Pointer (URL)</label>
                  <input
                    required
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-500"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Nomenclature</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-500"
                  placeholder="e.g. Squad Roadmap Alpha"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational Category</label>
                <input
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-500"
                  placeholder="e.g. Technical, Design, Admin..."
                />
              </div>

              <div className="flex justify-end pt-6">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none">
                  {editingId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingId ? 'Save Metadata' : 'Persist to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
