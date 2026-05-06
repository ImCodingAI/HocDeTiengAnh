import React, { useState } from 'react';
import { dbService } from '../db';
import { Day, Word } from '../types';
import { generateId } from '../lib/utils';
import { Button } from './ui/Button';
import { Input, Label, Textarea } from './ui/Input';
import { Dialog, DialogClose, DialogHeader, DialogTitle } from './ui/Dialog';

export function WordModal({ 
  open, 
  onClose, 
  dayId, 
  word, 
  onSave 
}: { 
  open: boolean; 
  onClose: () => void; 
  dayId: string; 
  word?: Word;
  onSave: () => void;
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const newWord: Word = {
      id: word?.id || generateId(),
      dayId: dayId,
      word: fd.get("word") as string,
      ipa: fd.get("ipa") as string,
      meaning: fd.get("meaning") as string,
      example: fd.get("example") as string,
      type: fd.get("type") as string || "noun",
      notes: fd.get("notes") as string,
      tags: (fd.get("tags") as string).split(',').map(t => t.trim()).filter(Boolean),
      createdAt: word?.createdAt || Date.now(),
      strength: word?.strength || 0,
      correctCount: word?.correctCount || 0,
      wrongCount: word?.wrongCount || 0,
      lastReviewed: word?.lastReviewed || null,
      nextReview: word?.nextReview || Date.now() + 1000 * 60 * 60 * 24, // tomorrow by default
    };

    await dbService.putWord(newWord);
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="max-w-xl">
      <DialogClose onClick={onClose} />
      <DialogHeader>
        <DialogTitle>{word ? "Sửa từ vựng" : "Thêm một từ mới"}</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="word">Từ vựng *</Label>
            <Input id="word" name="word" required defaultValue={word?.word} placeholder="VD: ubiquitous" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ipa">Phiên âm (IPA)</Label>
            <Input id="ipa" name="ipa" defaultValue={word?.ipa} placeholder="/juːˈbɪkwɪtəs/" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="meaning">Ý nghĩa *</Label>
            <Input id="meaning" name="meaning" required defaultValue={word?.meaning} placeholder="Có mặt ở khắp mọi nơi." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Loại từ</Label>
            <select 
              id="type" 
              name="type" 
              defaultValue={word?.type || "noun"} 
              className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="noun">Danh từ</option>
              <option value="verb">Động từ</option>
              <option value="adjective">Tính từ</option>
              <option value="adverb">Trạng từ</option>
              <option value="phrase">Cụm từ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="example">Câu Ví dụ</Label>
          <Textarea id="example" name="example" defaultValue={word?.example} placeholder="His ubiquitous influence..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Ghi chú thêm</Label>
          <Textarea id="notes" name="notes" defaultValue={word?.notes} placeholder="Từ đồng nghĩa, mẹo..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Thẻ đánh dấu (Ngăn cách bằng dấu phẩy)</Label>
          <Input id="tags" name="tags" defaultValue={word?.tags?.join(", ")} placeholder="academic, khó, IELTS" />
        </div>

        <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-card py-2 border-t mt-4 z-10">
          <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
          <Button type="submit">Lưu Lại</Button>
        </div>
      </form>
    </Dialog>
  )
}
