
import React from 'react';
import { TaskCategory, TeamMember, WorkLogEntry, TaskStatus, Announcement, AttendanceRecord } from '../types';

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  [TaskCategory.DEVELOPMENT]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  [TaskCategory.TESTING]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-blue-300',
  [TaskCategory.DOCUMENTATION]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  [TaskCategory.DESIGN]: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  [TaskCategory.MEETINGS]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  [TaskCategory.RESEARCH]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  [TaskCategory.ADMIN]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.DONE]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  [TaskStatus.NOT_STARTED]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  [TaskStatus.OVERDUE]: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'u1', name: 'Romeo', role: 'AI Specialist', avatar: 'default-ai-avatar-u1', code: 'ROMEO', gender: 'male' },
  { id: 'u3', name: 'Arnaz', role: 'Backend Developer', avatar: 'default-ai-avatar-u3', code: 'ARNAZ', gender: 'male' },
  { id: 'u2', name: 'Frankie', role: 'AI Analyst', avatar: 'default-ai-avatar-u2', code: 'FRANKIE', gender: 'female' },
  { id: 'u4', name: 'Ronio', role: 'Junior AI Engineer', avatar: 'default-ai-avatar-u4', code: 'RONIO', gender: 'male' },
  { id: 'u5', name: 'Raven', role: 'Intern', avatar: 'default-ai-avatar-u5', code: 'RAVEN', gender: 'male' },
  { id: 'u6', name: 'Ian', role: 'Intern', avatar: 'default-ai-avatar-u6', code: 'IAN', gender: 'male' },
  { id: 'u7', name: 'Karl', role: 'Intern', avatar: 'default-ai-avatar-u7', code: 'KARL', gender: 'male' },
  { id: 'u8', name: 'Angelica', role: 'Intern', avatar: 'default-ai-avatar-u8', code: 'ANGELICA', gender: 'female' },
];

const TASK_TEMPLATES: Record<string, string[]> = {
  'AI Specialist': ['Neural Architecture', 'Prompt Optimization', 'Guardrail Check', 'Handoff Protocol', 'Token Audit', 'Strategy Session', 'Model Tuning', 'Inference Optimization', 'Context Window Mapping', 'System Prompt Refactor'],
  'Backend Developer': ['API Hardening', 'Migration Layer', 'Rate Limiting', 'Sync Protocol', 'DB Optimization', 'Websocket Heartbeat', 'Auth Validation', 'Node Scaling', 'Caching Strategy', 'Query Profiling'],
  'AI Analyst': ['Sentiment Audit', 'Hallucination Check', 'Bias Scrubbing', 'Telemetry Review', 'Model Benchmarking', 'Dataset Cleanup', 'Uptime Report', 'Latency Study', 'Intent Analysis', 'Evaluation Flow'],
  'Junior AI Engineer': ['Unit Testing', 'Regression Fix', 'UI Integration', 'Component Audit', 'Bug Resolution', 'Documentation Update', 'Feature Toggling', 'Asset Versioning', 'Code Review', 'CI/CD Monitoring'],
  'Intern': ['Data Indexing', 'Workflow Capture', 'Manual Verification', 'System Stressing', 'Queue Management', 'Feedback Logging', 'Asset Tagging', 'Minutes Capture', 'Archive Cleanup', 'User Testing Support']
};

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const vibes = ['⚡', '☕', '🧠', '🚀', '🧘', '💡', '🏗️', '🌊'];
  const locations: ('Office' | 'Remote')[] = ['Office', 'Remote'];

  const startDate = new Date('2026-01-12');
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const currentDay = new Date(startDate);
  let idCounter = 1;
  let ravenDayCount = 0;

  while (currentDay <= today) {
    const dayOfWeek = currentDay.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = getLocalDateString(currentDay);
      if (todayStr !== dateStr) {
        TEAM_MEMBERS.forEach(member => {
          let shouldCheckIn = false;
          if (member.id === 'u5') {
            if (ravenDayCount < 8) {
              shouldCheckIn = true;
              ravenDayCount++;
            }
          } else {
            const isCore = ['u1', 'u2', 'u3', 'u4'].includes(member.id);
            const baseProb = isCore ? 0.95 : 0.70;
            shouldCheckIn = Math.random() < baseProb;
          }

          if (shouldCheckIn) {
            const checkInHour = 8 + Math.floor(Math.random() * 1);
            const checkInMin = Math.floor(Math.random() * 60);
            const duration = (member.id === 'u5') ? 8.5 : (['u1', 'u2', 'u3', 'u4'].includes(member.id) ? 8.2 + Math.random() : 3.5 + Math.random() * 6);
            const checkOutHourDec = checkInHour + (checkInMin / 60) + duration;
            const checkInStr = `${checkInHour.toString().padStart(2, '0')}:${checkInMin.toString().padStart(2, '0')} AM`;

            let checkOutStr: string | null = null;
            const outHour = Math.floor(checkOutHourDec);
            const outMin = Math.floor((checkOutHourDec - outHour) * 60);
            const displayHour = outHour > 12 ? outHour - 12 : outHour;
            const modifier = outHour >= 12 ? 'PM' : 'AM';
            checkOutStr = `${displayHour.toString().padStart(2, '0')}:${outMin.toString().padStart(2, '0')} ${modifier}`;

            records.push({
              id: `at-${idCounter++}`,
              userId: member.id,
              userName: member.name,
              date: dateStr,
              checkIn: checkInStr,
              checkOut: checkOutStr,
              location: locations[Math.floor(Math.random() * locations.length)],
              vibe: vibes[Math.floor(Math.random() * vibes.length)],
              statusMessage: 'Duty logged.'
            });
          }
        });
      }
    }
    currentDay.setDate(currentDay.getDate() + 1);
  }
  return records;
};

const generateWorkLogs = (attendance: AttendanceRecord[]): WorkLogEntry[] => {
  const logs: WorkLogEntry[] = [];
  let idCounter = 1;

  TEAM_MEMBERS.forEach(member => {
    const memberAttendance = attendance.filter(a => a.userId === member.id);
    if (memberAttendance.length === 0) return;

    const isIntern = member.role.toLowerCase().includes('intern');
    const taskCount = isIntern ? 12 : 30;
    const templates = TASK_TEMPLATES[member.role] || TASK_TEMPLATES['Intern'];
    const statuses = [TaskStatus.DONE, TaskStatus.DONE, TaskStatus.IN_PROGRESS, TaskStatus.NOT_STARTED, TaskStatus.OVERDUE];

    for (let i = 0; i < taskCount; i++) {
      const randomDay = memberAttendance[Math.floor(Math.random() * memberAttendance.length)];
      const dateStr = randomDay.date;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const category = Object.values(TaskCategory)[Math.floor(Math.random() * Object.values(TaskCategory).length)];
      const taskTemplate = templates[Math.floor(Math.random() * templates.length)];
      const hour = 9 + Math.floor(Math.random() * 8);
      const minute = Math.floor(Math.random() * 60);
      const logTimestamp = `${dateStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`;

      logs.push({
        id: `log-${idCounter++}`,
        userId: member.id,
        userName: member.name,
        taskName: `${taskTemplate} - Project Tea`,
        category: category,
        status: status,
        durationMinutes: 45 + Math.floor(Math.random() * 90),
        description: `Operational trace for mission Node ${member.code}.`,
        timestamp: logTimestamp,
        burnoutRisk: Math.random() > 0.95 ? 'High' : 'Low'
      });
    }
  });

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const MOCK_ATTENDANCE: AttendanceRecord[] = generateAttendanceRecords();
export const MOCK_LOGS: WorkLogEntry[] = generateWorkLogs(MOCK_ATTENDANCE);

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Mission Launch: AI Team 2026',
    content: 'Our internal squad mission protocol strictly commences on January 12th, 2026. Telemetry records prior to this date are purged.',
    authorId: 'u1',
    authorName: 'Romeo',
    category: 'feature',
    timestamp: '2026-01-12T08:30:00Z',
    isPinned: true,
    readCount: 310
  },
  {
    id: 'a2',
    title: 'Operational Status: Variety Check',
    content: 'Managers, please ensure task statuses are updated correctly. Not all items should be marked as "Done" during active sprints.',
    authorId: 'u2',
    authorName: 'Frankie',
    category: 'internal',
    timestamp: '2026-02-15T10:00:00Z',
    readCount: 105
  },
];
