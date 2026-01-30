
import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { User, Palette } from 'lucide-react';

interface AIAvatarProps {
  member: TeamMember;
  className?: string;
  onClick?: () => void;
  allowStyleChange?: boolean;
}

// Collection of distinct AI art styles supported by DiceBear
const ART_STYLES = [
  'avataaars',   // Cartoon (Default)
  'notionists',  // Sketch/Minimalist
  'lorelei',     // Anime/2D
  'adventurer',  // RPG/Fantasy
  'bottts',      // Robot/Sci-fi
  'micah',       // Modern/Clean
  'open-peeps'   // Hand-drawn
];

const STORAGE_KEY = 'teamops_avatar_styles';
const EVENT_KEY = 'teamops_avatar_update';

// Helper to get all styles safely
const getStylesMap = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

export const AIAvatar: React.FC<AIAvatarProps> = ({ member, className = "w-9 h-9", onClick, allowStyleChange = false }) => {
  // Initialize with stored style or default to 0
  const [styleIndex, setStyleIndex] = useState(() => {
    const map = getStylesMap();
    return map[member.id] !== undefined ? map[member.id] : 0;
  });

  const [imageSrc, setImageSrc] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for global updates for THIS member to sync across the app
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.userId === member.id) {
        setStyleIndex(customEvent.detail.styleIndex);
      }
    };

    window.addEventListener(EVENT_KEY, handleUpdate);
    return () => window.removeEventListener(EVENT_KEY, handleUpdate);
  }, [member.id]);

  const cycleStyle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (styleIndex + 1) % ART_STYLES.length;

    // 1. Update Local State
    setStyleIndex(nextIndex);

    // 2. Persist to Storage
    const map = getStylesMap();
    map[member.id] = nextIndex;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));

    // 3. Broadcast to other components
    window.dispatchEvent(new CustomEvent(EVENT_KEY, {
      detail: { userId: member.id, styleIndex: nextIndex }
    }));
  };

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    const style = ART_STYLES[styleIndex];
    // Incorporate name, id, and gender into the seed to ensure uniqueness and consistency.
    // Including 'gender' helps bias the random generation for styles that infer traits from the seed string.
    const seed = `${member.name}-${member.gender}-${member.id}`;

    // Construct the URL with pastel gradients for a polished UI
    const url = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear`;

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageSrc(url);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsError(true);
      setIsLoading(false);
    };

  }, [member, styleIndex]);

  return (
    <div
      className={`${className} rounded-full relative shrink-0 group ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
      onClick={onClick}
      role="img"
      aria-label={`Avatar of ${member.name}`}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-indigo-50 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700/50 group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
            <User className="w-1/2 h-1/2 text-slate-400 opacity-20" />
          </div>
        )}

        {/* Actual Image */}
        {!isLoading && !isError && (
          <img
            src={imageSrc}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}

        {/* Fallback Icon */}
        {isError && (
          <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400">
            <span className="text-xs font-black">{member.code.substring(0, 2)}</span>
          </div>
        )}

        {/* Inner Shadow / Ring for depth */}
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5 dark:ring-white/10 pointer-events-none"></div>
      </div>

      {/* Style Cycle Button - Visible on hover, placed outside overflow container to prevent clipping */}
      {allowStyleChange && !isLoading && !isError && (
        <button
          onClick={cycleStyle}
          className="absolute -bottom-0.5 -right-0.5 p-1 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 hover:scale-110 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-300"
          title={`Switch Style (${ART_STYLES[styleIndex]})`}
        >
          <Palette className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
        </button>
      )}
    </div>
  );
};
