
export enum TaskCategory {
  DEVELOPMENT = 'Development',
  TESTING = 'Testing',
  DOCUMENTATION = 'Documentation',
  DESIGN = 'Design',
  MEETINGS = 'Meetings',
  RESEARCH = 'Research',
  ADMIN = 'Administrative'
}

export enum TaskStatus {
  DONE = 'Done',
  IN_PROGRESS = 'In Progress',
  NOT_STARTED = 'Not Started',
  OVERDUE = 'Overdue'
}

export interface WorkLogEntry {
  id: string;
  userId: string;
  userName: string;
  taskName: string;
  category: TaskCategory;
  status: TaskStatus;
  durationMinutes: number;
  description: string;
  timestamp: string;
  burnoutRisk?: 'Low' | 'Medium' | 'High';
}

export interface AIProcessedLog {
  taskName: string;
  category: TaskCategory | string;
  durationMinutes: number;
  description: string;
}

export interface ProductivityInsight {
  score: number;
  resilienceScore: number;
  burnoutRisk: 'Low' | 'Medium' | 'High';
  summary: string;
  recommendations: string[];
}

export interface PersonalInsight extends ProductivityInsight {
  careerGrowthPath: string;
  focusTimePercentage: number;
}

export interface WeeklyReport {
  weekStarting: string;
  executiveSummary: string;
  keyAchievements: string[];
  blockers: string[];
  nextSteps: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  code: string;
  gender: 'male' | 'female';
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  location: 'Office' | 'Remote' | 'On Leave';
  vibe: string;
  statusMessage: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'alert' | 'success';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: 'feature' | 'event' | 'urgent' | 'internal';
  timestamp: string;
  isPinned?: boolean;
  readCount?: number;
}

export interface Material {
  id: string;
  name: string;
  type: 'file' | 'doc' | 'image' | 'link';
  category: string;
  size?: string;
  addedAt: string;
  url: string;
}

export interface AppSettings {
  aiSensitivity: 'low' | 'balanced' | 'high';
  darkMode: boolean;
  emailDigest: boolean;
}

export type ActiveTab = 'dashboard' | 'personal' | 'tracker' | 'report' | 'settings' | 'docs' | 'announcements' | 'attendance' | 'materials';
