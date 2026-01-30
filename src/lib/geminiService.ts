
import { GoogleGenAI, Type } from "@google/genai";
import { AIProcessedLog, TaskCategory, WorkLogEntry, ProductivityInsight, WeeklyReport, TeamMember, PersonalInsight } from '../types';

// Safety check for API Key
const getApiKey = () => {
  try {
    // Check both process.env and import.meta.env for Vite compatibility
    const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.GEMINI_API_KEY ||
      "";

    if (!apiKey || apiKey === "PLACEHOLDER_API_KEY" || apiKey.includes("PLACEHOLDER")) {
      return null;
    }
    return apiKey;
  } catch (e) {
    return null;
  }
};

// Enhanced retry helper with exponential backoff and jitter
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = error?.toString() || "";
    const isQuotaError =
      errorStr.includes('429') ||
      error?.status === 429 ||
      errorStr.includes('RESOURCE_EXHAUSTED') ||
      errorStr.includes('quota');

    if (isQuotaError && retries > 0) {
      const jitter = Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const parseNaturalLanguageLog = async (text: string): Promise<AIProcessedLog[]> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.log("AI: Mock Mode - Parsing log via local heuristics");
    return [{
      taskName: text.length > 30 ? text.substring(0, 30) + "..." : text,
      category: TaskCategory.ADMIN,
      durationMinutes: 60,
      description: `Analysis for: ${text}`
    }];
  }

  const ai = new GoogleGenAI({ apiKey });
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Parse the following work log into structured data: "${text}"`,
      config: {
        systemInstruction: `You are an expert timesheet organizer for an internal team.
        Your job is to extract multiple work entries from a single natural language description.
        Valid Categories: ${Object.values(TaskCategory).join(', ')}.
        Extract taskName, category, durationMinutes (estimate if not exact, e.g. "morning" = 180), and description.
        If the text is vague, make professional inferences.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              taskName: { type: Type.STRING },
              category: { type: Type.STRING, description: 'Must match one of the valid categories exactly.' },
              durationMinutes: { type: Type.NUMBER },
              description: { type: Type.STRING }
            },
            required: ['taskName', 'category', 'durationMinutes', 'description']
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to parse AI response", e);
      return [];
    }
  });
};

export const generateProductivityInsights = async (logs: WorkLogEntry[]): Promise<ProductivityInsight> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.log("AI: Mock Mode - Generating static productivity insights");
    return {
      score: 85,
      resilienceScore: 92,
      burnoutRisk: 'Low',
      summary: "Team momentum is high. The workload is distributed across multiple core nodes, with specific focus on development cycles. No immediate burnout risks detected in the current telemetry stream.",
      recommendations: [
        "Maintain current sprint velocity",
        "Consider allocating more time for documentation",
        "Excellent resilience metrics observed this week"
      ]
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const logsText = logs.map(l => `[${l.userName}] ${l.category}: ${l.taskName} (${l.durationMinutes}m) - Status: ${l.status}`).join('\n');

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: `Analyze team work logs and generate workspace health metrics: \n${logsText}`,
      config: {
        systemInstruction: `You are an AI Workspace Strategist. Analyze team productivity based on logs.
        Provide a detailed summary and actionable recommendations.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'The Performance Index' },
            resilienceScore: { type: Type.NUMBER, description: 'The team Resilience/Stability Score' },
            burnoutRisk: { type: Type.STRING },
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['score', 'resilienceScore', 'burnoutRisk', 'summary', 'recommendations']
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return {
        score: 0,
        resilienceScore: 0,
        burnoutRisk: 'Low',
        summary: 'Unable to analyze at this time.',
        recommendations: []
      };
    }
  });
};

export const generatePersonalInsights = async (logs: WorkLogEntry[], user: TeamMember): Promise<PersonalInsight> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.log(`AI: Mock Mode - Generating career path for ${user.name}`);
    return {
      score: 78,
      resilienceScore: 88,
      burnoutRisk: 'Low',
      summary: `${user.name} is demonstrating strong performance in core ${user.role} duties.`,
      recommendations: ["Expand cross-functional collaboration", "Engage in more research-oriented tasks"],
      careerGrowthPath: `Transition from ${user.role} into strategic leadership and complex architecture design. Focus on mastering system decomposition.`,
      focusTimePercentage: 65
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const userLogs = logs.filter(l => l.userId === user.id);
  const logsText = userLogs.map(l => `${l.category}: ${l.taskName} (${l.durationMinutes}m)`).join('\n');

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: `Analyze these work logs for ${user.name} (${user.role}) and act as a Career Coach. \nLogs:\n${logsText}`,
      config: {
        systemInstruction: `You are an AI Career Coach. Analyze the user's recent tasks.
        Calculate a personal performance score (0-100).
        Identify a specific "Career Growth Path" advice based on their actual work patterns (e.g. if they do a lot of coding, suggest architecture; if admin, suggest automation).
        Keep the advice concise, professional, and inspiring.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            resilienceScore: { type: Type.NUMBER },
            burnoutRisk: { type: Type.STRING },
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            careerGrowthPath: { type: Type.STRING, description: "Specific advice for career advancement based on tasks." },
            focusTimePercentage: { type: Type.NUMBER }
          },
          required: ['score', 'careerGrowthPath', 'focusTimePercentage']
        }
      }
    });

    try {
      const result = JSON.parse(response.text || '{}');
      return {
        ...result,
        resilienceScore: result.resilienceScore || 0,
        burnoutRisk: result.burnoutRisk || 'Low',
        summary: result.summary || '',
        recommendations: result.recommendations || []
      };
    } catch (e) {
      return {
        score: 0,
        resilienceScore: 0,
        burnoutRisk: 'Low',
        summary: 'Analysis failed.',
        recommendations: [],
        careerGrowthPath: "Unable to generate career path at this moment.",
        focusTimePercentage: 0
      };
    }
  });
};

export const generateWeeklyReport = async (logs: WorkLogEntry[]): Promise<WeeklyReport> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.log("AI: Mock Mode - Synthesizing weekly report");
    return {
      weekStarting: new Date().toLocaleDateString(),
      executiveSummary: "Mission successful. The squad has maintained steady velocity throughout the operational window.",
      keyAchievements: ["Completed Project Tea milestones", "Synchronized all mission nodes"],
      blockers: ["Minor telemetry latency in external nodes"],
      nextSteps: ["Scale mission parameters", "Initialize Phase 2 protocols"]
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const logsText = logs.map(l => `${l.userName} - ${l.taskName} (${l.category})`).join('\n');

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: `Write a professional weekly team report based on these logs:\n${logsText}`,
      config: {
        systemInstruction: `Create a professional office report. Focus on value delivered. EXECUTIVE SUMMARY, KEY ACHIEVEMENTS, BLOCKERS, NEXT STEPS.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weekStarting: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            keyAchievements: { type: Type.ARRAY, items: { type: Type.STRING } },
            blockers: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['weekStarting', 'executiveSummary', 'keyAchievements', 'blockers', 'nextSteps']
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      throw new Error("Report generation failed");
    }
  });
};
