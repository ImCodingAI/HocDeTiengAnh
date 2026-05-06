import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Day, Progress, Settings, Word } from "../types";

const DB_NAME = "vocab_repeat_db";
const DB_VERSION = 1;

interface VocabDB extends DBSchema {
  days: {
    key: string;
    value: Day;
    indexes: { "by-created": number };
  };
  words: {
    key: string;
    value: Word;
    indexes: {
      "by-day": string;
      "by-next-review": number;
      "by-created": number;
    };
  };
  progress: {
    key: string;
    value: Progress;
  };
  settings: {
    key: string;
    value: Settings;
  };
}

let dbPromise: Promise<IDBPDatabase<VocabDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<VocabDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("days")) {
          const dayStore = db.createObjectStore("days", { keyPath: "id" });
          dayStore.createIndex("by-created", "createdAt");
        }
        if (!db.objectStoreNames.contains("words")) {
          const wordStore = db.createObjectStore("words", { keyPath: "id" });
          wordStore.createIndex("by-day", "dayId");
          wordStore.createIndex("by-next-review", "nextReview");
          wordStore.createIndex("by-created", "createdAt");
        }
        if (!db.objectStoreNames.contains("progress")) {
          db.createObjectStore("progress", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

// Database Services
export const dbService = {
  // --- Days ---
  async getDays() {
    const db = await initDB();
    return db.getAllFromIndex("days", "by-created");
  },
  async getDay(id: string) {
    const db = await initDB();
    return db.get("days", id);
  },
  async putDay(day: Day) {
    const db = await initDB();
    await db.put("days", day);
  },
  async deleteDay(id: string) {
    const db = await initDB();
    const tx = db.transaction(["days", "words"], "readwrite");
    await tx.objectStore("days").delete(id);
    
    // Auto-delete words in the day
    const wordsIndex = tx.objectStore("words").index("by-day");
    let cursor = await wordsIndex.openCursor(id);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  },

  // --- Words ---
  async getWords(dayId?: string) {
    const db = await initDB();
    if (dayId) {
      return db.getAllFromIndex("words", "by-day", dayId);
    }
    return db.getAllFromIndex("words", "by-created");
  },
  async getWord(id: string) {
    const db = await initDB();
    return db.get("words", id);
  },
  async putWord(word: Word) {
    const db = await initDB();
    await db.put("words", word);
  },
  async putWords(words: Word[]) {
    const db = await initDB();
    const tx = db.transaction("words", "readwrite");
    for (const w of words) {
      tx.store.put(w);
    }
    await tx.done;
  },
  async deleteWord(id: string) {
    const db = await initDB();
    await db.delete("words", id);
  },
  
  // --- Words Query ---
  async getDueWords(upToTimestamp: number) {
    const db = await initDB();
    const range = IDBKeyRange.upperBound(upToTimestamp);
    return db.getAllFromIndex("words", "by-next-review", range);
  },

  // --- Progress ---
  async getProgress(id: string) {
    const db = await initDB();
    return db.get("progress", id);
  },
  async getAllProgress() {
    const db = await initDB();
    return db.getAll("progress");
  },
  async putProgress(progress: Progress) {
    const db = await initDB();
    await db.put("progress", progress);
  },

  // --- Settings ---
  async getSettings(): Promise<Settings> {
    const db = await initDB();
    const defaultSettings: Settings = { id: "user", wordsPerDay: 10, theme: "dark" };
    const st = await db.get("settings", "user");
    if (!st) {
      await db.put("settings", defaultSettings);
      return defaultSettings;
    }
    return st;
  },
  async putSettings(settings: Settings) {
    const db = await initDB();
    await db.put("settings", settings);
  },

  // --- Utility ---
  async clearAll() {
    const db = await initDB();
    const tx = db.transaction(["days", "words", "progress", "settings"], "readwrite");
    await tx.objectStore("days").clear();
    await tx.objectStore("words").clear();
    await tx.objectStore("progress").clear();
    await tx.objectStore("settings").clear();
    await tx.done;
  }
};
