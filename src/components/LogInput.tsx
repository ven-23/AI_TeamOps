
import React, { useState } from 'react';
import { Sparkles, Loader2, Plus, X, User as UserIcon, ChevronDown, AlertCircle } from 'lucide-react';
import { parseNaturalLanguageLog } from '../lib/geminiService';
import { AIProcessedLog, TaskCategory, TeamMember } from '../types';
import { CATEGORY_COLORS } from '../lib/constants';
import { AIAvatar } from './AIAvatar';

interface LogInputProps {
  teamMembers: TeamMember[];
  onAddLogs: (logs: AIProcessedLog[], targetUserId: string) => void;
  defaultUserId: string;
}

export const LogInput: React.FC<LogInputProps> = ({ teamMembers, onAddLogs, defaultUserId }) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewLogs, setPreviewLogs] = useState<AIProcessedLog[]>([]);
  const [targetUserId, setTargetUserId] = useState(defaultUserId);
  const [error, setError] = useState<string | null>(null);

  const selectedMember = teamMembers.find(m => m.id === targetUserId) || teamMembers[0];

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const results = await parseNaturalLanguageLog(inputText);
      setPreviewLogs(results);
    } catch (error: any) {
      if (error.message === 'AI_QUOTA_EXCEEDED') {
        setError('AI Capacity Exceeded: The team assistant is temporarily over-capacity.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confirmLogs = () => {
    onAddLogs(previewLogs, targetUserId);
    setPreviewLogs([]);
    setInputText('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-600" /><h2 className="text-lg font-semibold dark:text-white">Quick Log</h2></div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assign:</span>
          <div className="relative">
            <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} className="pl-12 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold dark:text-white appearance-none cursor-pointer">
              {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <AIAvatar member={selectedMember} className="w-8 h-8 rounded-full" />
            </div>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
      <div className="relative">
        <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={`Log work for ${selectedMember.name}...`} className="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white resize-none" />
        <button onClick={handleAnalyze} disabled={isAnalyzing || !inputText.trim()} className="absolute bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all hover:bg-indigo-700 active:scale-95">
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isAnalyzing ? 'Analyzing...' : 'AI Process'}
        </button>
      </div>
    </div>
  );
};
