import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';
import { suggestDailyWord, SuggestedWord } from '../lib/gemini';
import { useVocabDB } from '../hooks/useVocabDB';
import { WordModal } from './WordModal';
import { Day, Word } from '../types';

export function AILearningSuggestion() {
  const { settings, words, days, triggerUpdate } = useVocabDB();
  const [suggestion, setSuggestion] = useState<SuggestedWord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isWordOpen, setIsWordOpen] = useState(false);

  const fetchSuggestion = async () => {
    if (!settings?.geminiApiKey && !process.env.GEMINI_API_KEY) {
      setError("Bạn cần cấu hình Gemini API Key trong phần Cài đặt.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const existingWords = words.map(w => w.word);
      const word = await suggestDailyWord(settings?.geminiApiKey, existingWords);
      setSuggestion(word);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Lỗi khi gợi ý từ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (words.length >= 0) { // Always fetch if no suggestion yet
       // but let's not auto-fetch to save tokens, only fetch when they hit a button?
       // Wait, "Gemini sẽ cung cấp từ vựng mỗi ngày". I can auto-fetch if no suggestion is in state.
       if (!suggestion && !loading && !error && (settings?.geminiApiKey || process.env.GEMINI_API_KEY)) {
         fetchSuggestion();
       }
    }
  }, [words.length, settings?.geminiApiKey]);

  if (!settings?.geminiApiKey && !process.env.GEMINI_API_KEY) {
     return null; // hide entirely if no key is configured
  }

  // Pre-fill word format for the modal
  const preFilledWord: Partial<Word> = suggestion ? {
    word: suggestion.word,
    ipa: suggestion.ipa,
    meaning: suggestion.meaning,
    example: suggestion.example,
    type: suggestion.type,
    notes: suggestion.notes,
    tags: ["AI Suggested"],
  } : {};

  // For saving, we need a dayId. Use the latest day or ask user to create one
  const targetDayId = days.length > 0 ? days[days.length - 1].id : "";

  const handleOpenAddWord = () => {
    if (!targetDayId) {
      alert("Vui lòng tạo ít nhất 1 Ngày Học trong Thư viện để thêm từ này!");
      return;
    }
    setIsWordOpen(true);
  };

  return (
    <Card className="rounded-2xl glass border-indigo-200 dark:border-indigo-900 overflow-hidden relative shadow-md mt-6 min-h-[12rem]">
       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none"></div>
       <CardHeader className="pb-2 border-b border-border/50 bg-indigo-50/50 dark:bg-indigo-900/20">
         <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
               <Sparkles className="w-5 h-5" /> 
               Từ mới hôm nay dành cho bạn
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchSuggestion} disabled={loading} className="text-muted-foreground hover:text-indigo-600">
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Đổi từ khác
            </Button>
         </div>
       </CardHeader>
       <CardContent className="p-6">
         {loading ? (
             <div className="flex flex-col items-center justify-center py-6 text-muted-foreground space-y-3">
                <Spinner className="w-8 h-8 text-indigo-500 animate-spin" />
                <p>Gemini đang tìm một từ vựng phù hợp cho bạn...</p>
             </div>
         ) : error ? (
             <div className="text-center py-6 text-red-500 dark:text-red-400">
               <p>{error}</p>
               <Button variant="outline" className="mt-4 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400" onClick={fetchSuggestion}>Thử lại</Button>
             </div>
         ) : suggestion ? (
             <div className="flex flex-col md:flex-row items-center gap-6">
                 <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="flex flex-wrap items-end justify-center md:justify-start gap-2 mb-2">
                       <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">{suggestion.word}</h3>
                       <span className="text-lg text-muted-foreground font-mono mb-1">{suggestion.ipa}</span>
                       <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground mb-2">{suggestion.type}</span>
                    </div>
                    <p className="text-lg font-medium text-foreground">{suggestion.meaning}</p>
                    <p className="text-muted-foreground italic text-sm border-l-2 border-indigo-200 dark:border-indigo-800 pl-3 py-1">"{suggestion.example}"</p>
                    <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mt-2 font-medium bg-indigo-50 dark:bg-indigo-900/30 inline-block px-2 py-1 rounded">💡 Gợi ý: {suggestion.notes}</p>
                 </div>
                 
                 <div className="mt-4 md:mt-0 flex shrink-0">
                    <Button onClick={handleOpenAddWord} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg w-full md:w-auto">
                        <Plus className="w-5 h-5 mr-2" />
                        Học từ này
                    </Button>
                 </div>
             </div>
         ) : null}

         {isWordOpen && suggestion && targetDayId && (
            <WordModal 
              open={isWordOpen}
              onClose={() => setIsWordOpen(false)}
              dayId={targetDayId}
              word={preFilledWord as Word}
              onSave={triggerUpdate}
            />
         )}
       </CardContent>
    </Card>
  );
}

function Spinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
