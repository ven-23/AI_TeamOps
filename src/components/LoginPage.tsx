
import React, { useEffect, useRef, useState } from 'react';
import { Zap, ShieldCheck, Lock, ChevronRight, Users, GraduationCap, AlertCircle, ArrowLeft } from 'lucide-react';
import { TeamMember } from '../types';
import { TEAM_MEMBERS } from '../lib/constants';
import { AIAvatar } from './AIAvatar';

interface LoginPageProps {
  onLogin: (member: TeamMember) => void;
}

// Extracted MemberCard component to resolve TypeScript prop assignment issues
const MemberCard: React.FC<{ member: TeamMember; onSelect: (member: TeamMember) => void }> = ({ member, onSelect }) => (
  <div
    onClick={() => onSelect(member)}
    className="group flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all hover:-translate-y-1 h-full w-full cursor-pointer relative"
    role="button"
    tabIndex={0}
  >
    <AIAvatar member={member} className="w-16 h-16 mb-3" allowStyleChange={true} />
    <div className="flex flex-col items-center justify-center flex-1 w-full gap-1">
      <p className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition-colors text-center leading-tight tracking-tight">
        {member.name}
      </p>
      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center leading-tight min-h-[20px] flex items-center justify-center">
        {member.role}
      </p>
    </div>
  </div>
);

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    // Increased particle count for more visibility
    const particleCount = 120;
    const connectionDistance = 150;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      // Increased particle size for more visibility
      size: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 2; // Increased size
      }

      update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = 'rgba(99, 102, 241, 0.7)'; // Increased opacity
        context.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: particleCount }, () => new Particle(canvas.width, canvas.height));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.update(canvas.width, canvas.height);
        p.draw(ctx);
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const opacity = 1 - dist / connectionDistance;
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.3})`; // Increased connection line opacity
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init(); animate();
    window.addEventListener('resize', init);
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', init); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" style={{ opacity: 0.8 }} />;
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Fix: Angelica (AI Intern) belongs to interns. Using includes for flexible matching.
  const interns = TEAM_MEMBERS.filter(m => m.role.toLowerCase().includes('intern'));
  const coreTeam = TEAM_MEMBERS.filter(m => !m.role.toLowerCase().includes('intern'));

  const handleMemberSelect = (member: TeamMember) => {
    setSelectedMember(member);
    setPasswordInput(''); // Clear password on new selection
    setLoginError(null);  // Clear previous error
  };

  const handleLoginAttempt = () => {
    if (!selectedMember) {
      setLoginError('Please select a team member.');
      return;
    }
    // Password is the member's name in lowercase
    if (passwordInput.toLowerCase() === selectedMember.name.toLowerCase()) {
      onLogin(selectedMember);
    } else {
      setLoginError('Invalid password. Please try again.');
      setPasswordInput(''); // Clear input for security
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-6xl w-full grid lg:grid-cols-5 bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative z-10">
        <div className="lg:col-span-2 p-10 md:p-12 bg-gradient-to-br from-indigo-600 to-blue-700 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/30">
              <Zap className="w-10 h-10 text-white fill-white" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-4">AI <br />TeamOps</h1>
            <p className="text-indigo-100 text-lg font-medium max-w-xs leading-relaxed">Intelligent operational management for <span className="text-white font-bold underline decoration-amber-400">AI Team</span> members.</p>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <div className="p-2 bg-emerald-400 rounded-lg"><ShieldCheck className="w-5 h-5 text-indigo-900" /></div>
              <div>
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Security Status</p>
                <p className="text-sm font-bold text-white">Active Node: Office-v2</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
              <Lock className="w-3 h-3" /> Internal Access Only
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 p-8 md:p-12 flex flex-col justify-center bg-slate-900/40 overflow-y-auto">
          {selectedMember ? (
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
              <AIAvatar member={selectedMember} className="w-24 h-24 mb-6" />
              <h2 className="text-3xl font-bold text-white mb-2">{selectedMember.name}</h2>
              <p className="text-slate-400 text-sm mb-8">{selectedMember.role}</p>

              {loginError && (
                <div className="bg-rose-500/20 text-rose-300 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="relative w-full max-w-sm mb-4">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLoginAttempt();
                    }
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleLoginAttempt}
                className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-indigo-200/50 dark:shadow-none flex items-center justify-center gap-3 active:scale-95"
              >
                <Zap className="w-5 h-5 fill-white" />
                Sign In
              </button>

              <button
                onClick={() => setSelectedMember(null)} // Back button
                className="mt-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to profiles
              </button>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-400 text-sm">Select your profile to initialize workspace.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.25em]">Core Strategic Team</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {coreTeam.map(member => <MemberCard key={member.id} member={member} onSelect={handleMemberSelect} />)}
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.25em]">Operational Interns</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {interns.map(member => <MemberCard key={member.id} member={member} onSelect={handleMemberSelect} />)}
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {TEAM_MEMBERS.slice(0, 4).map((m, i) => (
                      <AIAvatar key={i} member={m} className="w-8 h-8 rounded-full border-2 border-slate-900 shadow-xl" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{TEAM_MEMBERS.length} active nodes online</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
