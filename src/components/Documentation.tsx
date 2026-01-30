
import React from 'react';
import { 
  BookOpen, 
  Zap, 
  Terminal, 
  Heart,
  Megaphone,
  Folder,
  Cpu,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Database,
  Flame
} from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-2">
          <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Knowledge Base</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium italic">"Operational Protocols for Shore360 Agency."</p>
      </div>

      {/* Philosophy Section */}
      <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <Zap className="w-7 h-7 text-amber-500" />
          Shore360 Agency Mission OS
        </h2>
        <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-lg">
          <p>
            AI TeamOps serves as the central orchestration engine for the <strong>Shore360 Agency</strong>. It converts individual task telemetry into collective intelligence, ensuring that resource allocation is always optimized for strategic output.
          </p>
          <p>
            By leveraging Gemini 3, the system automates the analysis of "Flow" versus "Friction", providing every squad member with a personalized roadmap for growth and operational excellence.
          </p>
        </div>
      </section>

      {/* Feature Clusters */}
      <div className="space-y-8">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] px-4">Core Operational Modules</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6 group hover:border-amber-400 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/40 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Flame className="w-7 h-7" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">Incentivized Streaks</h4>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              We reward presence and consistency. A <strong>Work Streak</strong> increments only when a member records a full session (Check-In & Check-Out) of at least <strong>4 active hours</strong>. 
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6 group hover:border-emerald-400 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">Unified Vault</h4>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              The Materials tab connects directly to your local device. Upload documentation, design binaries, or reference images to persist them in the squad's shared repository.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6 group hover:border-rose-400 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">Mission Briefs</h4>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Automated Friday summaries. The AI parses all team logs to highlight <strong>Shore360 Achievements</strong>, identifying blockers for the following sprint.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6 group hover:border-indigo-400 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Megaphone className="w-7 h-7" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">Agency Broadcasts</h4>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Official channel for Shore360 Agency updates. Members should check the broadcast feed daily for pinned announcements regarding system maintenance or social events.
            </p>
          </div>
        </div>
      </div>

      {/* The Telemetry Metric Engine */}
      <section className="bg-white dark:bg-slate-950 rounded-[4rem] p-10 md:p-14 text-slate-900 dark:text-white shadow-2xl relative overflow-hidden border border-slate-200 dark:border-white/5 transition-colors">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <h2 className="text-3xl font-black mb-14 flex items-center gap-4 relative z-10">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl">
            <Cpu className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          Metric Engine Specifications
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-16 relative z-10">
          <div className="space-y-4">
             <h4 className="text-xl font-black text-amber-600 dark:text-amber-400 tracking-tight uppercase">01. Streak Integrity</h4>
             <p className="text-slate-500 dark:text-indigo-100/60 text-base leading-relaxed font-medium">
               Streaks represent operational reliability. To maintain a streak, sessions must bridge the 4-hour threshold. Partial days do not contribute to momentum scores.
             </p>
          </div>

          <div className="space-y-4">
             <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-300 tracking-tight uppercase">02. Flow Efficiency</h4>
             <p className="text-slate-500 dark:text-indigo-100/60 text-base leading-relaxed font-medium">
               We prioritize 'Deep Work'. Time spent in 'Development' or 'Research' categories carries a higher weight in the AI Career Path synthesis.
             </p>
          </div>

          <div className="space-y-4">
             <h4 className="text-xl font-black text-rose-600 dark:text-rose-300 tracking-tight uppercase">03. Vault Persistence</h4>
             <p className="text-slate-500 dark:text-indigo-100/60 text-base leading-relaxed font-medium">
               Materials are versioned and metadata-locked. Once an asset is decommissioned (Deleted), it is moved to an internal archive node for audit compliance.
             </p>
          </div>

          <div className="space-y-4">
             <h4 className="text-xl font-black text-indigo-600 dark:text-indigo-300 tracking-tight uppercase">04. Peer Resilience</h4>
             <p className="text-slate-500 dark:text-indigo-100/60 text-base leading-relaxed font-medium">
               The system monitors workload distribution across Shore360. Asymmetric load is flagged for redistribution to maintain squad health and redundancy.
             </p>
          </div>
        </div>
      </section>

      {/* Closing Call to Action */}
      <div className="bg-indigo-50 dark:bg-indigo-950/40 p-12 rounded-[3.5rem] border border-indigo-100 dark:border-indigo-900/50 text-center space-y-6 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <Terminal className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <p className="text-indigo-900 dark:text-indigo-200 font-black text-2xl tracking-tighter">Maintain the Vault.</p>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium italic">
          "The accuracy of the Shore360 AI depends on the honesty of the telemetry. Keep your logs precise and your vault updated."
        </p>
      </div>
    </div>
  );
};
