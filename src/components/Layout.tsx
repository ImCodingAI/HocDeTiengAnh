import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, BarChart2, Settings, Home, Library } from 'lucide-react';
import { cn } from '../lib/utils';
import { useVocabDB } from '../hooks/useVocabDB';
import { ReloadPrompt } from './ReloadPrompt';

const navItems = [
  { icon: Home, label: 'Trang chủ', path: '/' },
  { icon: Library, label: 'Thư viện', path: '/library' },
  { icon: BookOpen, label: 'Học từ', path: '/study' },
  { icon: BarChart2, label: 'Thống kê', path: '/analytics' },
  { icon: Settings, label: 'Cài đặt', path: '/settings' },
];

export function Layout() {
  useVocabDB(); // Top level binding for general state (theme update)
  return (
    <div className="min-h-screen h-[100dvh] w-full bg-background flex overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-6 h-full flex-shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">V</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Học<span className="text-indigo-600 dark:text-indigo-400"> đê</span></h1>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive
                    ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24 md:pb-0 relative">
        <Outlet />
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t flex justify-around p-3 z-50 safe-area-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center p-2 rounded-lg",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <ReloadPrompt />
    </div>
  );
}
