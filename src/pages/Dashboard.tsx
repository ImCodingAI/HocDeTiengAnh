import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { useVocabDB } from '../hooks/useVocabDB';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { words, days } = useVocabDB();
  
  const today = new Date().setHours(0,0,0,0);
  const dueWords = words.filter(w => w.nextReview <= Date.now());
  const wordsLearnedToday = words.filter(w => new Date(w.createdAt).setHours(0,0,0,0) === today).length;
  
  const vocabStrengthScore = words.length > 0 
    ? Math.round(words.reduce((acc, w) => acc + w.strength, 0) / words.length * 20) 
    : 0; // Strength is 0-5, convert to 0-100 score

  // Calculate day streak (simplified for mockup purpose)
  const currentStreak = progressCount(days);

  function progressCount(daysList: any[]) {
     return daysList.length > 0 ? daysList.length : 0;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold">Tổng quan </h2>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            <span className="text-orange-500">🔥</span>
            <span className="font-bold text-sm md:text-base">{currentStreak} Ngày chuỗi</span>
          </div>
        </div>
      </header>

      <div className="p-6 md:p-8 flex-1 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl glass">
            <p className="text-muted-foreground text-sm font-medium">Từ mới hôm nay</p>
            <h3 className="text-3xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{wordsLearnedToday} Từ</h3>
          </div>
          <div className="p-5 rounded-2xl glass">
            <p className="text-muted-foreground text-sm font-medium">Cần ôn tập</p>
            <h3 className="text-3xl font-bold mt-1 text-purple-600 dark:text-purple-400">{dueWords.length} Từ</h3>
          </div>
          <div className="p-5 rounded-2xl glass">
            <p className="text-muted-foreground text-sm font-medium">Độ chính xác (ước tính)</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{vocabStrengthScore}%</h3>
          </div>
        </div>

        {/* Main Interaction Card */}
        <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 min-h-[16rem] flex flex-col justify-center shadow-2xl shadow-indigo-500/20 text-white mt-6">
          <div className="relative z-10">
            <h4 className="text-3xl font-bold mb-2">Sẵn sàng cho chu kỳ học hôm nay chưa?</h4>
            <p className="text-indigo-100 max-w-md">Phiên học hôm nay bao gồm {wordsLearnedToday} từ mới và ôn tập {dueWords.length} từ trong cơ sở dữ liệu của bạn.</p>
          </div>
          <div className="relative z-10 flex flex-wrap gap-4 mt-8">
            <Link to="/study" className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:scale-105 transition-transform text-center shadow-md">Bắt đầu học</Link>
            <Link to="/library" className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-400 transition-colors text-center shadow-md">Quản lý từ vựng</Link>
          </div>
          {/* Decorative Background Circles */}
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-30px] left-[-20px] w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {words.length > 0 && (
          <div className="rounded-2xl glass border-border flex-1 mt-6 overflow-hidden max-w-full">
            <div className="p-4 border-b border-border flex justify-between items-center bg-card">
              <h5 className="font-bold">Đã thêm gần đây</h5>
              <Link to="/library" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Xem tất cả</Link>
            </div>
            <div className="p-2 overflow-x-auto bg-card">
              <table className="w-full text-left min-w-[600px] border-collapse">
                <thead>
                  <tr className="text-muted-foreground text-xs uppercase tracking-tighter">
                    <th className="px-4 py-3 font-semibold border-b border-border">Từ vựng</th>
                    <th className="px-4 py-3 font-semibold border-b border-border">Phiên âm</th>
                    <th className="px-4 py-3 font-semibold border-b border-border">Mức độ ghi nhớ</th>
                    <th className="px-4 py-3 font-semibold border-b border-border">Lần ôn tiếp theo</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {words.slice(-4).reverse().map((word, i) => (
                    <tr key={word.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold">{word.word}</td>
                      <td className="px-4 py-3 text-muted-foreground">{word.ipa || '-'}</td>
                      <td className="px-4 py-3 flex items-center">
                        <div className="w-16 h-1.5 bg-accent rounded-full overflow-hidden mt-1 text-center items-center justify-center">
                          <div 
                            className={`h-full rounded-full ${word.strength >= 4 ? 'bg-emerald-500' : word.strength >= 2 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                            style={{ width: `${Math.max(10, (word.strength / 5) * 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                         {word.nextReview <= Date.now() ? (
                           <span className="text-orange-600 dark:text-orange-400">Đến hạn ôn</span>
                         ) : (
                           <span className="text-muted-foreground">{new Date(word.nextReview).toLocaleDateString()}</span>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {days.length === 0 && (
        <Card className="p-8 text-center border-dashed mt-6 bg-transparent">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Thư viện của bạn đang trống</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Bắt đầu bằng cách tạo "Ngày học" đầu tiên (gồm 1 list các từ) và thêm các từ vựng bạn muốn thông thạo.
          </p>
        </Card>
      )}
      </div>
    </div>
  );
}
