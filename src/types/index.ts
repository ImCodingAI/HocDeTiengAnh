export interface Day {
  id: string;
  name: string;
  targetWords: number;
  createdAt: number;
}

export interface Word {
  id: string;
  dayId: string;
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  type: string;
  notes: string;
  tags: string[];
  createdAt: number;

  // Spaced Repetition Logic
  strength: number;
  correctCount: number;
  wrongCount: number;
  lastReviewed: number | null;
  nextReview: number;
}

export interface Progress {
  id: string; // Format 'YYYY-MM-DD'
  reviewedCount: number;
  learnedCount: number;
  correctCount: number;
  wrongCount: number;
}

export interface Settings {
  id: "user";
  wordsPerDay: number;
  theme: "light" | "dark";
  geminiApiKey?: string;
}

export interface ExportData {
  version: number;
  days: Day[];
  words: Word[];
  progress: Progress[];
  settings: Settings;
  exportedAt: number;
}
