import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { dbService } from '../db';
import { Progress, Word } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useVocabDB } from '../hooks/useVocabDB';
import { BarChart2 } from 'lucide-react';

export function Analytics() {
  const { lastUpdated } = useVocabDB();
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    async function load() {
      const p = await dbService.getAllProgress();
      const w = await dbService.getWords();
      setProgressData(p.sort((a,b) => a.id.localeCompare(b.id)).slice(-14)); // last 14 days
      setWords(w);
    }
    load();
  }, [lastUpdated]);

  const strengthData = [
    { name: 'Mới (Cấp 0)', count: words.filter(w => w.strength === 0).length },
    { name: 'Cấp 1', count: words.filter(w => w.strength === 1).length },
    { name: 'Cấp 2', count: words.filter(w => w.strength === 2).length },
    { name: 'Cấp 3', count: words.filter(w => w.strength === 3).length },
    { name: 'Cấp 4', count: words.filter(w => w.strength === 4).length },
    { name: 'Thành thạo (Cấp 5)', count: words.filter(w => w.strength === 5).length },
  ];

  const chartData = progressData.map(p => ({
    date: p.id.split('-').slice(1).join('/'), // MM/DD
    reviewed: p.reviewedCount,
    accuracy: p.reviewedCount ? Math.round((p.correctCount / p.reviewedCount) * 100) : 0
  }));

  const totalReviews = progressData.reduce((acc, p) => acc + p.reviewedCount, 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full">
      <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold">Thống kê</h2>
        </div>
      </header>

      <div className="p-6 md:p-8 flex-1 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass border-border overflow-hidden">
            <CardHeader className="bg-card">
              <CardTitle>Hoạt động học tập (14 ngày qua)</CardTitle>
            </CardHeader>
            <CardContent className="h-72 p-6">
               {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                      <XAxis dataKey="date" fontSize={12} tickMargin={10} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                      <YAxis fontSize={12} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                      />
                      <Bar dataKey="reviewed" fill="#4f46e5" radius={[4,4,0,0]} name="Số từ đã ôn" />
                    </BarChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/10 rounded-xl">
                    Chưa có dữ liệu. Hãy bắt đầu ôn tập!
                  </div>
               )}
            </CardContent>
          </Card>

          <Card className="glass border-border overflow-hidden">
            <CardHeader className="bg-card">
              <CardTitle>Phân bố mức độ ghi nhớ</CardTitle>
            </CardHeader>
            <CardContent className="h-72 p-6">
              {words.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={strengthData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                     <XAxis type="number" fontSize={12} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                     <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                       itemStyle={{ color: 'var(--foreground)' }}
                       cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                     />
                     <Bar dataKey="count" fill="#10b981" radius={[0,4,4,0]} name="Số từ" />
                   </BarChart>
                 </ResponsiveContainer>
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/10 rounded-xl">
                    Thêm từ để xem phân bố.
                  </div>
               )}
            </CardContent>
          </Card>
          
          <Card className="glass border-border overflow-hidden col-span-1 md:col-span-2">
            <CardHeader className="bg-card">
              <CardTitle>Xu hướng độ chính xác</CardTitle>
            </CardHeader>
            <CardContent className="h-72 p-6">
               {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                      <XAxis dataKey="date" fontSize={12} tickMargin={10} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                      <YAxis fontSize={12} stroke="currentColor" opacity={0.5} domain={[0, 100]} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                      <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: 'var(--background)' }} activeDot={{ r: 6 }} name="Độ chính xác (%)" />
                    </LineChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/10 rounded-xl">
                    Chưa có dữ liệu.
                  </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
