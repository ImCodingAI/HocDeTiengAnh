import React, { useRef, useState, useEffect } from 'react';
import { useVocabDB } from '../hooks/useVocabDB';
import { dbService } from '../db';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Download, Upload, Moon, Sun, Trash2, Settings as SettingsIcon, Key } from 'lucide-react';

export function Settings() {
  const { settings, triggerUpdate } = useVocabDB();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (settings && settings.geminiApiKey) {
      setApiKey(settings.geminiApiKey);
    }
  }, [settings]);

  const handleSaveApiKey = async () => {
    if (!settings) return;
    await dbService.putSettings({ ...settings, geminiApiKey: apiKey });
    triggerUpdate();
    alert("Đã lưu API Key.");
  };

  const toggleTheme = async () => {
    if (!settings) return;
    const newTheme = settings.theme === "dark" ? "light" : "dark";
    await dbService.putSettings({ ...settings, theme: newTheme });
    triggerUpdate();
  };

  const handleExport = async () => {
    const days = await dbService.getDays();
    const words = await dbService.getWords();
    const progress = await dbService.getAllProgress();
    const sets = await dbService.getSettings();
    
    const data = {
      version: 1,
      days,
      words,
      progress,
      settings: sets,
      exportedAt: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vocabflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.version || !data.days || !data.words) {
          alert("Định dạng tệp sao lưu không hợp lệ!");
          return;
        }

        if (confirm("Hành động này sẽ thay thế các dữ liệu bị trùng lặp và gộp với dữ liệu còn lại. Tiếp tục?")) {
          // Import days
          for (const d of data.days) await dbService.putDay(d);
          // Import words
          await dbService.putWords(data.words);
          // Import progress
          if (data.progress) {
            for (const p of data.progress) await dbService.putProgress(p);
          }
          alert("Nhập thành công!");
          triggerUpdate();
        }
      } catch (err) {
        alert("Lỗi đọc tệp JSON.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearAll = async () => {
    if (confirm("Bạn có chắc chắn không? Tất cả từ vựng, ngày và tiến trình sẽ bị xóa vĩnh viễn.")) {
      const p = prompt("Gõ 'DELETE' để xác nhận:");
      if (p === "DELETE") {
        await dbService.clearAll();
        triggerUpdate();
        alert("Đã xóa toàn bộ dữ liệu.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full">
      <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold">Cài đặt</h2>
        </div>
      </header>

      <div className="p-6 md:p-8 flex-1 w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
        
        <Card className="glass border-border overflow-hidden">
          <CardHeader className="bg-card">
            <CardTitle>Tính năng AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
              <div>
                <p className="font-semibold">Gemini API Key</p>
                <p className="text-sm text-muted-foreground">Nhập khóa API Gemini của bạn để bật tính năng gợi ý từ vựng mới mỗi ngày bằng AI.</p>
              </div>
              <div className="flex gap-2 mt-2">
                <Input 
                  type="password" 
                  placeholder="AIzaSy..." 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                  className="flex-1"
                />
                <Button onClick={handleSaveApiKey}><Key className="w-4 h-4 mr-2" /> Lưu</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border overflow-hidden">
          <CardHeader className="bg-card">
            <CardTitle>Giao diện</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="font-semibold">Chủ đề</p>
              <p className="text-sm text-muted-foreground">Chuyển đổi giữa chế độ Sáng và Tối.</p>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              {settings?.theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {settings?.theme === "dark" ? "Chế độ Sáng" : "Chế độ Tối"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass border-border overflow-hidden">
          <CardHeader className="bg-card">
            <CardTitle>Dữ liệu & Sao lưu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Xuất dữ liệu</p>
                <p className="text-sm text-muted-foreground">Tải về tệp JSON chứa toàn bộ dữ liệu.</p>
              </div>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Xuất JSON
              </Button>
            </div>

            <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Nhập dữ liệu</p>
                <p className="text-sm text-muted-foreground">Khôi phục dữ liệu từ tệp JSON.</p>
              </div>
              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Nhập JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5 dark:bg-red-500/10 overflow-hidden mt-8">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Vùng nguy hiểm</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
             <div>
                <p className="font-semibold text-red-600 dark:text-red-400">Xóa Toàn Bộ Dữ liệu</p>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">Xóa tất cả ngày, từ vựng và tiến độ học tập. Không thể khôi phục.</p>
              </div>
              <Button variant="destructive" onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa Cơ sở dữ liệu
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
