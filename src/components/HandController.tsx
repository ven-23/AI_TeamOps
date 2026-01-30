import React, { useEffect, useRef, useState } from 'react';

// External MediaPipe library declarations for hand tracking
declare const Hands: any;
declare const Camera: any;

interface HandControllerProps {
  onClose: () => void;
}

export const HandController: React.FC<HandControllerProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<{ x: number, y: number }>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [cursorPos, setCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  
  const [isClicking, setIsClicking] = useState(false);
  const [scrollDir, setScrollDir] = useState<'up' | 'down' | null>(null);
  const [isActive, setIsActive] = useState(false);
  
  const lastClickTime = useRef(0);
  const scrollInterval = useRef<number | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    const onResults = (results: any) => {
      let currentScroll: 'up' | 'down' | null = null;
      let handVisible = false;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        handVisible = true;
        const landmarks = results.multiHandLandmarks[0];
        
        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];
        const indexTip = landmarks[8];
        const indexMcp = landmarks[5];
        const middleTip = landmarks[12];
        const middleMcp = landmarks[9];
        const ringTip = landmarks[16];
        const ringMcp = landmarks[13];

        const padding = 0.15;
        const rawX = 1 - indexTip.x;
        const rawY = indexTip.y;
        
        const mappedX = Math.max(0, Math.min(1, (rawX - padding) / (1 - 2 * padding)));
        const mappedY = Math.max(0, Math.min(1, (rawY - padding) / (1 - 2 * padding)));

        const targetX = mappedX * window.innerWidth;
        const targetY = mappedY * window.innerHeight;

        cursorRef.current.x += (targetX - cursorRef.current.x) * 0.9;
        cursorRef.current.y += (targetY - cursorRef.current.y) * 0.9;
        setCursorPos({ x: cursorRef.current.x, y: cursorRef.current.y });

        const isIndexUp = indexTip.y < indexMcp.y - 0.04;
        const isMiddleUp = middleTip.y < middleMcp.y - 0.04;
        const isRingTucked = ringTip.y > ringMcp.y + 0.02;

        if (isIndexUp && isMiddleUp && isRingTucked) {
          if (!isClicking && Date.now() - lastClickTime.current > 600) {
            triggerClick(cursorRef.current.x, cursorRef.current.y);
            lastClickTime.current = Date.now();
          }
        }

        const thumbThreshold = 0.045; 
        if (thumbTip.y < thumbIp.y - thumbThreshold) {
          currentScroll = 'up';
        } else if (thumbTip.y > thumbIp.y + thumbThreshold) {
          currentScroll = 'down';
        }
      }

      setIsActive(handVisible);
      setScrollDir(currentScroll);
    };

    const triggerClick = (x: number, y: number) => {
      setIsClicking(true);
      const element = document.elementFromPoint(x, y);
      if (element) {
        ['mousedown', 'mouseup', 'click'].forEach(type => {
          element.dispatchEvent(new MouseEvent(type, {
            view: window, bubbles: true, cancelable: true, clientX: x, clientY: y
          }));
        });
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          element.focus();
        }
      }
      setTimeout(() => setIsClicking(false), 250);
    };

    hands.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480
    });

    camera.start().then(() => {
      if (previewVideoRef.current && videoRef.current?.srcObject) {
        previewVideoRef.current.srcObject = videoRef.current.srcObject;
      }
    });

    return () => {
      camera.stop();
      hands.close();
    };
  }, []);

  useEffect(() => {
    if (scrollDir) {
      const target = document.getElementById('scroll-viewport') || window;
      if (scrollInterval.current) window.clearInterval(scrollInterval.current);
      
      scrollInterval.current = window.setInterval(() => {
        const speed = 18;
        target.scrollBy({ top: scrollDir === 'up' ? -speed : speed, behavior: 'auto' });
      }, 16);
    } else {
      if (scrollInterval.current) {
        window.clearInterval(scrollInterval.current);
        scrollInterval.current = null;
      }
    }
    return () => {
      if (scrollInterval.current) window.clearInterval(scrollInterval.current);
    };
  }, [scrollDir]);

  return (
    <>
      <video ref={videoRef} className="hidden" playsInline muted />

      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[9997] animate-in slide-in-from-top-10">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${isActive ? 'bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 'bg-slate-700'}`}></div>
          <span className="text-xs font-black text-white uppercase tracking-widest">{isActive ? 'Session Active' : 'No Signal'}</span>
        </div>
        <div className="h-4 w-px bg-white/10"></div>
        <div className="flex gap-5 text-xs font-black text-slate-300 uppercase tracking-widest">
           <span className={`transition-colors ${scrollDir === 'up' ? 'text-amber-400' : ''}`}>Up</span>
           <span className={`transition-colors ${scrollDir === 'down' ? 'text-amber-400' : ''}`}>Down</span>
           <span className={`transition-colors ${isClicking ? 'text-indigo-400' : ''}`}>Click</span>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 w-52 h-40 bg-slate-950 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl z-[9998] transition-opacity hover:opacity-100 opacity-60">
        <video ref={previewVideoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay playsInline muted />
        <div className="absolute inset-0 pointer-events-none ring-inset ring-1 ring-white/10 rounded-[2.5rem]"></div>
      </div>

      <div className="hand-cursor flex items-center justify-center z-[9999]" style={{ left: cursorPos.x, top: cursorPos.y, transition: 'transform 0.08s linear' }}>
        <div className="relative">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isClicking ? 'scale-75 bg-indigo-500 border-white shadow-[0_0_20px_rgba(99,102,241,0.6)]' : scrollDir ? 'scale-110 border-amber-500 bg-amber-500/20' : 'scale-100 border-indigo-400/80 bg-indigo-400/5'}`}>
            {scrollDir === 'up' && <div className="w-1.5 h-1.5 border-t-2 border-l-2 border-amber-400 rotate-45 mb-0.5"></div>}
            {scrollDir === 'down' && <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-amber-400 rotate-45"></div>}
            {!scrollDir && (<div className={`w-1.5 h-1.5 rounded-full transition-colors ${isClicking ? 'bg-white' : 'bg-indigo-400'}`}></div>)}
          </div>

          {isActive && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 px-3 py-1 rounded-full border border-white/10 shadow-lg">
               <span className={`text-[10px] font-black uppercase tracking-widest ${scrollDir ? 'text-amber-400' : isClicking ? 'text-indigo-400' : 'text-slate-100'}`}>
                 {scrollDir ? `Auto-${scrollDir}` : isClicking ? 'Action Confirmed' : 'Tracking'}
               </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
