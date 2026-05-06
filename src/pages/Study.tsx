import React, { useState } from 'react';
import { useVocabDB } from '../hooks/useVocabDB';
import { dbService } from '../db';
import { Word } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Check, X, RotateCcw, BrainCircuit } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '../components/ui/Dialog';

export function Study() {
  const { words, triggerUpdate } = useVocabDB();
  const [sessionActive, setSessionActive] = useState(false);
  const [queue, setQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // SRS Review Limits
  const [sessionType, setSessionType] = useState<"review" | "learn" | null>(null);

  const startSession = (type: "review" | "learn") => {
    setSessionType(type);
    
    let wordsToStudy: Word[] = [];
    if (type === "review") {
      wordsToStudy = words.filter(w => w.nextReview <= Date.now()).sort((a,b) => a.nextReview - b.nextReview);
    } else {
      // Learn: new words (strength = 0)
      wordsToStudy = words.filter(w => w.strength === 0).sort((a,b) => a.createdAt - b.createdAt);
    }

    if (wordsToStudy.length === 0) {
      alert("Không có từ nào cho loại học này hiện tại!");
      return;
    }

    // Limit to block sizes
    const block = wordsToStudy.slice(0, 20);
    setQueue(block);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionActive(true);
  };

  const handleAnswer = async (correct: boolean) => {
    const word = queue[currentIndex];
    
    // Simple SM-2 like update
    let newStrength = word.strength;
    let nextReviewDelta = 0;

    if (correct) {
      newStrength = Math.min(5, word.strength + 1);
    } else {
      newStrength = Math.max(0, word.strength - 2); // Hard penalty
    }

    // Days delta based on new strength
    switch (newStrength) {
      case 0: nextReviewDelta = 1000 * 60 * 60 * 12; break; // 12 hours
      case 1: nextReviewDelta = 1000 * 60 * 60 * 24; break; // 1 day
      case 2: nextReviewDelta = 1000 * 60 * 60 * 24 * 3; break; // 3 days
      case 3: nextReviewDelta = 1000 * 60 * 60 * 24 * 7; break; // 7 days
      case 4: nextReviewDelta = 1000 * 60 * 60 * 24 * 14; break; // 14 days
      case 5: nextReviewDelta = 1000 * 60 * 60 * 24 * 30; break; // 30 days
    }

    const updatedWord: Word = {
      ...word,
      strength: newStrength,
      correctCount: correct ? word.correctCount + 1 : word.correctCount,
      wrongCount: correct ? word.wrongCount : word.wrongCount + 1,
      lastReviewed: Date.now(),
      nextReview: Date.now() + nextReviewDelta,
    };

    await dbService.putWord(updatedWord);
    
    // Track daily progress
    const todayId = new Date().toISOString().split('T')[0];
    let progress = await dbService.getProgress(todayId);
    if (!progress) {
      progress = { id: todayId, reviewedCount: 0, learnedCount: 0, correctCount: 0, wrongCount: 0 };
    }
    progress.reviewedCount++;
    if (word.strength === 0) progress.learnedCount++;
    if (correct) progress.correctCount++;
    else progress.wrongCount++;
    
    await dbService.putProgress(progress);
    
    // Next word or end session
    if (currentIndex < queue.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionActive(false);
      triggerUpdate();
      alert("Phiên Học Hoàn Tất!");
    }
  };

  const dueReview = words.filter(w => w.nextReview <= Date.now() && w.strength > 0).length;
  const newWords = words.filter(w => w.strength === 0).length;

  if (sessionActive && queue.length > 0) {
    const currentWord = queue[currentIndex];
    
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto h-[calc(100vh-80px)] md:h-full flex flex-col items-center justify-center animate-in fade-in">
        <div className="w-full flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => { setSessionActive(false); triggerUpdate(); }}>
            <X className="w-5 h-5 mr-2" /> Kết Thúc
          </Button>
          <div className="text-sm font-medium text-muted-foreground">
            {currentIndex + 1} / {queue.length}
          </div>
        </div>

        <div className="relative w-full max-w-sm mx-auto aspect-[3/4] md:aspect-video perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentWord.id}-${isFlipped}`}
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1, x: 0 }}
              exit={{ rotateX: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center shadow-lg justify-center glass rounded-3xl p-8 cursor-pointer touch-none"
              onClick={() => !isFlipped && setIsFlipped(true)}
              drag={isFlipped ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;

                if (swipe < -100) {
                  // Swipe Left -> Hard
                  handleAnswer(false);
                } else if (swipe > 100) {
                  // Swipe Right -> Easy
                  handleAnswer(true);
                }
              }}
              whileDrag={{ scale: 0.95 }}
            >
              {!isFlipped ? (
                <div className="text-center space-y-4 pointer-events-none">
                  <h2 className="text-5xl font-bold tracking-tight">{currentWord.word}</h2>
                  {currentWord.ipa && <p className="text-xl text-muted-foreground font-mono">{currentWord.ipa}</p>}
                  <p className="text-sm text-primary mt-6 tracking-widest uppercase font-semibold animate-pulse">Chạm để xem nghĩa</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col text-center justify-center space-y-6 pointer-events-none">
                   <h2 className="text-4xl font-bold border-b border-border pb-4">{currentWord.meaning}</h2>
                   <div>
                     <span className="text-sm bg-muted px-2 py-1 rounded inline-block mb-3">{currentWord.type}</span>
                     {currentWord.example && <p className="text-xl italic text-muted-foreground">"{currentWord.example}"</p>}
                   </div>
                   {currentWord.notes && <p className="text-sm text-muted-foreground mt-4">{currentWord.notes}</p>}
                   <div className="mt-auto pt-4 flex justify-between text-xs text-muted-foreground md:hidden uppercase font-bold tracking-wider">
                     <span className="text-red-500/70">←Vuốt trái: Khó</span>
                     <span className="text-emerald-500/70">Vuốt phải: Dễ→</span>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex gap-4 w-full md:w-auto">
          <Button 
            disabled={!isFlipped}
            variant="outline" 
            size="lg" 
            className="flex-1 md:w-32 border-red-500/20 hover:bg-red-500/10 hover:text-red-600 focus-visible:ring-red-500"
            onClick={(e) => { e.stopPropagation(); handleAnswer(false); }}
          >
            Khó
          </Button>
          <Button 
            disabled={!isFlipped}
            size="lg" 
            className="flex-1 md:w-32 bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={(e) => { e.stopPropagation(); handleAnswer(true); }}
          >
            Dễ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10 w-full">
        <div>
          <h2 className="text-2xl font-bold">Góc Học Tập </h2>
        </div>
      </header>

      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => dueReview > 0 && startSession("review")}>
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <RotateCcw className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Chế độ Ôn Tập</h3>
              <p className="text-muted-foreground mt-2 text-sm max-w-sm">
                Ôn tập lặp lại ngắt quãng những từ đến hạn.
              </p>
            </div>
            <div className="pt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${dueReview > 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>
                {dueReview} từ đến hạn
              </span>
            </div>
          </div>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => newWords > 0 && startSession("learn")}>
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <BrainCircuit className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Chế độ Học Mới</h3>
              <p className="text-muted-foreground mt-2 text-sm max-w-sm">
                Học những từ hoàn toàn mới chưa từng học.
              </p>
            </div>
            <div className="pt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${newWords > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                {newWords} từ mới
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
