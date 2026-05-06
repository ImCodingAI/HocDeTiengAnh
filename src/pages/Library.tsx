import React, { useState } from 'react';
import { useVocabDB } from '../hooks/useVocabDB';
import { dbService } from '../db';
import { generateId } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '../components/ui/Dialog';
import { WordModal } from '../components/WordModal';
import { Plus, FolderPlus, Trash2, Edit2, Search, ArrowLeft, MoreVertical } from 'lucide-react';
import { Day, Word } from '../types';

export function Library() {
  const { days, words, triggerUpdate } = useVocabDB();
  const [search, setSearch] = useState("");
  
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<Day | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  
  const [isWordOpen, setIsWordOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | undefined>();

  const handleSaveDay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    
    if (editingDay) {
      await dbService.putDay({ ...editingDay, name });
    } else {
      await dbService.putDay({
        id: generateId(),
        name: name || `Day ${days.length + 1}`,
        targetWords: 10,
        createdAt: Date.now(),
      });
    }
    
    setIsDayOpen(false);
    setEditingDay(null);
    triggerUpdate();
  };

  const handleDeleteDay = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa ngày này và tất cả các từ trong đó?")) {
      await dbService.deleteDay(id);
      if (selectedDay?.id === id) setSelectedDay(null);
      triggerUpdate();
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (confirm("Bạn có tin chắc muốn xóa từ này?")) {
      await dbService.deleteWord(id);
      triggerUpdate();
    }
  };

  if (selectedDay) {
    const dayWords = words.filter(w => w.dayId === selectedDay.id && (w.word.includes(search) || w.meaning.includes(search)));
    
    return (
      <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10 w-full">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)} className="-ml-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{selectedDay.name}</h1>
            </div>
        </div>
        <div className="flex gap-2">
            <div className="relative max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search words..." 
                className="pl-9 bg-accent/50 border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => { setEditingWord(undefined); setIsWordOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Word
            </Button>
          </div>
      </header>
      <div className="p-6 md:p-8 w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">

        <div className="relative max-w-md sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search words..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          {dayWords.map(word => (
            <Card key={word.id} className="p-0 overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow transition-shadow">
              <div className="flex-1 p-5">
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-lg font-bold">{word.word}</h3>
                  {word.ipa && <span className="text-sm text-muted-foreground font-mono">{word.ipa}</span>}
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-2">{word.type}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{word.meaning}</p>
                {word.example && <p className="text-sm text-muted-foreground italic mt-2">"{word.example}"</p>}
                
                <div className="flex gap-2 mt-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${word.nextReview <= Date.now() ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                    {word.nextReview <= Date.now() ? "Đến hạn ôn" : `Ôn tiếp vào: ${new Date(word.nextReview).toLocaleDateString()}`}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                    Cấp độ {word.strength}
                  </span>
                </div>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-border bg-muted/20 p-2 sm:w-24 flex sm:flex-col justify-end sm:justify-start items-center gap-1">
                <Button variant="ghost" size="sm" className="w-full h-8" onClick={() => { setEditingWord(word); setIsWordOpen(true); }}>
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="sm" className="w-full h-8 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteWord(word.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </Card>
          ))}
          {dayWords.length === 0 && (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
              <h3 className="text-lg font-medium text-foreground">Không có từ nào</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Bắt đầu thêm từ vựng vào ngày này.</p>
              <Button onClick={() => { setEditingWord(undefined); setIsWordOpen(true); }}>Thêm từ mới</Button>
            </div>
          )}
        </div>

        {isWordOpen && (
          <WordModal 
            open={isWordOpen} 
            onClose={() => setIsWordOpen(false)} 
            dayId={selectedDay.id}
            word={editingWord}
            onSave={triggerUpdate}
          />
        )}
      </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10 w-full">
        <div>
          <h2 className="text-2xl font-bold">Thư viện</h2>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Button onClick={() => { setEditingDay(null); setIsDayOpen(true); }}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Tạo Ngày
          </Button>
        </div>
      </header>

    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Tìm kiếm thư mục ngày..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days
          .filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
          .map(day => {
          const dayWords = words.filter(w => w.dayId === day.id);
          const needsReview = dayWords.filter(w => w.nextReview <= Date.now()).length;
          return (
            <Card key={day.id} className="group flex flex-col hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedDay(day)}>
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{day.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    tổng cộng {dayWords.length} từ
                  </p>
                </div>
                <div onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-card rounded-md border p-1 shadow-sm absolute right-4 top-4">
                  <button onClick={() => { setEditingDay(day); setIsDayOpen(true); }} className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => handleDeleteDay(day.id, e as any)} className="p-1 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="mt-auto pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tiến độ</span>
                  {needsReview > 0 ? (
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-semibold">
                      cần ôn {needsReview} từ
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Đã học xong!</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {days.length === 0 && (
         <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <h3 className="text-lg font-medium text-foreground">Bạn chưa có danh sách nào</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Tạo ngày đầu tiên để thêm từ mới.</p>
            <Button onClick={() => setIsDayOpen(true)}>Tạo Ngày Học</Button>
         </div>
      )}

      {/* Day Modal */}
      <Dialog open={isDayOpen} onClose={() => setIsDayOpen(false)}>
        <DialogClose onClick={() => setIsDayOpen(false)} />
        <DialogHeader>
          <DialogTitle>{editingDay ? "Chỉnh sửa ngày" : "Tạo Ngày Mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveDay} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên gọi</Label>
            <Input id="name" name="name" defaultValue={editingDay?.name} placeholder="VD: Ngày 1, Cụm từ công sở" required autoFocus />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsDayOpen(false)}>Hủy</Button>
            <Button type="submit">Lưu lại</Button>
          </div>
        </form>
      </Dialog>
    </div>
    </div>
  );
}
