
import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, ArrowRightCircle, Download, RefreshCw } from 'lucide-react';
import { WeeklyReport } from '../types';

interface WeeklyReportViewProps {
  report: WeeklyReport | null;
  onGenerate: () => void;
  isLoading: boolean;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ report, onGenerate, isLoading }) => {
  const handleDownload = () => {
    if (!report) return;
    const text = `
WEEKLY TEAM REPORT - ${report.weekStarting}
----------------------------------------
EXECUTIVE SUMMARY:
${report.executiveSummary}

KEY ACHIEVEMENTS:
${report.keyAchievements.map(a => `- ${a}`).join('\n')}

POTENTIAL BLOCKERS:
${report.blockers.map(b => `- ${b}`).join('\n')}

NEXT STEPS:
${report.nextSteps.map(s => `- ${s}`).join('\n')}
    `.trim();
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Weekly_Report_${report.weekStarting.replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <FileText className="w-16 h-16 text-slate-200 dark:text-slate-800" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Drafting Team Report</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">Synthesizing logs, analyzing delivery value, and crafting a professional summary...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-8 shadow-sm">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
          <FileText className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Generate Weekly Summary</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-md">Ready to aggregate the team's impact? Click below to generate an AI-powered executive report.</p>
        </div>
        <button
          onClick={onGenerate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 dark:shadow-none hover:-translate-y-0.5 active:scale-95"
        >
          Initialize Report Generation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Confidential Internal Use</span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Weekly Operations</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Status Report: {report.weekStarting}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download TXT
          </button>
          <button 
            onClick={onGenerate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      </div>

      <section>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Executive Summary</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-2xl border-l-4 border-indigo-500 text-lg font-medium">
          {report.executiveSummary}
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-10">
        <section className="bg-emerald-50/30 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
            Key Achievements
          </h3>
          <ul className="space-y-4">
            {report.keyAchievements.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 font-medium leading-snug">
                <span className="text-emerald-500 font-black">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-amber-50/30 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
            Critical Blockers
          </h3>
          <ul className="space-y-4">
            {report.blockers.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 font-medium leading-snug">
                <span className="text-amber-500 font-black">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <ArrowRightCircle className="w-6 h-6 text-indigo-400" /> Strategic Roadmap
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          {report.nextSteps.map((step, idx) => (
            <div key={idx} className="bg-white/5 p-5 rounded-2xl text-slate-300 font-medium border border-white/10 hover:bg-white/10 transition-all hover:border-indigo-500/50 flex items-start gap-3">
              <span className="text-indigo-400 font-black shrink-0">{String(idx + 1).padStart(2, '0')}</span>
              {step}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
