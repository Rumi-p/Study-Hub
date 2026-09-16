import React from 'react';
import { ActiveTab } from '../types';
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BookOpen,
  Timer,
  Award,
  Sparkles,
  Flame,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  streakDays: number;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  pomodoroStatus?: {
    isRunning: boolean;
    timeLeftFormatted: string;
    mode: 'focus' | 'shortBreak' | 'longBreak';
  };
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streakDays,
  isChatOpen,
  setIsChatOpen,
  pomodoroStatus,
  onResetData,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'Planner & Timetable', icon: Calendar },
    { id: 'tasks', label: 'Tasks & Kanban', icon: CheckSquare },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'pomodoro', label: 'Focus Timer', icon: Timer },
    { id: 'exams', label: 'Exams & Milestones', icon: Award },
    { id: 'ai-chat', label: 'AI Study Tutor', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-zinc-900 block leading-tight">
                  Acuity <span className="text-indigo-600 font-semibold text-xs tracking-normal uppercase bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100 ml-1">Study Hub</span>
                </span>
                <span className="text-[11px] text-zinc-600 block">Planner, Tasks & AI Mentor</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-300' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2">
            {/* Active Pomodoro indicator if running */}
            {pomodoroStatus?.isRunning && (
              <button
                onClick={() => setActiveTab('pomodoro')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-bold animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{pomodoroStatus.timeLeftFormatted}</span>
                <span className="text-[10px] font-sans uppercase">
                  ({pomodoroStatus.mode === 'focus' ? 'Focus' : 'Break'})
                </span>
              </button>
            )}

            {/* Streak badge */}
            <div
              title={`${streakDays} days study streak!`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span>{streakDays}d Streak</span>
            </div>

            {/* Quick AI Tutor button */}
            <button
              onClick={() => setIsChatOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isChatOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Tutor</span>
            </button>

            {/* Reset data helper */}
            <button
              onClick={onResetData}
              title="Reset to demo student data"
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
