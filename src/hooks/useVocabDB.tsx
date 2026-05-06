import React, { createContext, useContext, useState, useCallback } from "react";
import { dbService } from "../db";
import { Day, Word, Progress, Settings } from "../types";

interface VocabContextType {
  lastUpdated: number;
  triggerUpdate: () => void;
}

const VocabContext = createContext<VocabContextType>({
  lastUpdated: Date.now(),
  triggerUpdate: () => {},
});

export const VocabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const triggerUpdate = useCallback(() => setLastUpdated(Date.now()), []);
  return (
    <VocabContext.Provider value={{ lastUpdated, triggerUpdate }}>
      {children}
    </VocabContext.Provider>
  );
};

export function useVocabDB() {
  const { lastUpdated, triggerUpdate } = useContext(VocabContext);

  const [days, setDays] = useState<Day[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  React.useEffect(() => {
    async function loadData() {
      const fetchedDays = await dbService.getDays();
      const fetchedWords = await dbService.getWords();
      const fetchedSettings = await dbService.getSettings();
      setDays(fetchedDays);
      setWords(fetchedWords);
      setSettings(fetchedSettings);
      
      const el = document.documentElement;
      if (fetchedSettings.theme === "dark") el.classList.add("dark");
      else el.classList.remove("dark");
    }
    loadData();
  }, [lastUpdated]);

  return { days, words, settings, triggerUpdate };
}
