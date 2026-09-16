import React from 'react';
import { Course, Task, ScheduleBlock, Exam, StudySessionRecord, ActiveTab } from '../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  Flame,
  Play,
  Sparkles,
  AlertTriangle,
  CheckSquare,
  TrendingUp,
} from 'lucide-react';
import { getCourseColorClasses } from './Modals';

interface DashboardViewProps {
  courses: Course[];
  tasks: Task[];
  schedule: ScheduleBlock[];
  exams: Exam[];
  sessions: StudySessionRecord[];
  streakDays: number;
  onNavigateTab: (tab: ActiveTab) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onOpenTaskModal: () => void;
  onStartFocusOnTask: (task: Task) => void;
  onAskAI: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses,
  tasks,
  schedule,
  exams,
  sessions,
  streakDays,
  onNavigateTab,
  onToggleTaskComplete,
  onOpenTaskModal,
  onStartFocusOnTask,
  onAskAI,
}) => {
  // Current day calculation (0 = Sun, 1 = Mon, etc.)
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const todayDateStr = today.toISOString().split('T')[0];

  // Today's schedule blocks sorted by start time
  const todaysBlocks = schedule
    .filter(b => b.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // High priority / urgent tasks
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const priorityTasks = [...pendingTasks]
    .sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      if (pOrder[a.priority] !== pOrder[b.priority]) {
        return pOrder[a.priority] - pOrder[b.priority];
      }
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 4);

  // Nearest upcoming exam
  const sortedExams = [...exams]
    .filter(e => e.date >= todayDateStr)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nearestExam = sortedExams[0];

  // Calculate days until nearest exam
  let daysUntilNearestExam = 0;
  if (nearestExam) {
    const examDate = new Date(nearestExam.date);
    const diffTime = examDate.getTime() - today.getTime();
    daysUntilNearestExam = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Calculate total study time
  const totalMinutesStudied = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHoursStudied = (totalMinutesStudied / 60).toFixed(1);

  // Total credits
  const totalCredits = courses.reduce((acc, c) => acc + (c.credits || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Focus Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              Ready for focused work today?
            </h1>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              You have <span className="font-semibold text-zinc-900">{todaysBlocks.length} classes / study blocks</span> today and{' '}
              <span className="font-semibold text-zinc-900">{pendingTasks.length} pending assignments</span>. Keep your momentum going!
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('pomodoro')}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Focus Timer</span>
            </button>
            <button
              onClick={onOpenTaskModal}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Add Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Hours Studied</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">{totalHoursStudied}</span>
            <span className="text-xs text-zinc-500 font-medium">hrs total</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +{sessions.length} logged sessions
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Task Velocity</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {completedTasks.length}
              <span className="text-zinc-400 text-lg font-normal">/{tasks.length}</span>
            </span>
            <span className="text-xs text-zinc-500 font-medium">done</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${tasks.length ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{streakDays}</span>
            <span className="text-xs text-zinc-500 font-medium">days strong</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium mt-1">Consistency is key!</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Enrolled Load</span>
            <BookOpen className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">{totalCredits}</span>
            <span className="text-xs text-zinc-500 font-medium">credits</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium mt-1">
            Across {courses.length} core courses
          </p>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Schedule & Tasks (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-700" />
                <h2 className="text-base font-bold text-zinc-900">Today’s Schedule</h2>
                <span className="text-xs text-zinc-600 font-medium">
                  ({today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('planner')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysBlocks.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                <p className="text-sm font-medium">No scheduled classes or study blocks for today.</p>
                <button
                  onClick={() => onNavigateTab('planner')}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  + Add study blocks to your weekly timetable
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysBlocks.map(block => {
                  const course = courses.find(c => c.id === block.courseId);
                  const colorConfig = getCourseColorClasses(block.color || course?.color || 'indigo');
                  return (
                    <div
                      key={block.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all hover:shadow-2xs ${colorConfig.bg}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center font-mono shrink-0 px-2.5 py-1 bg-white/80 rounded-lg border border-black/5">
                          <div className="text-xs font-bold text-zinc-900">{block.startTime}</div>
                          <div className="text-[10px] text-zinc-500">{block.endTime}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-zinc-900">{block.title}</h4>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-white/60 text-zinc-700">
                              {block.type}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 mt-0.5">
                            {course?.code && <span className="font-semibold">{course.code} • </span>}
                            {block.location || 'Campus / Desk'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigateTab('pomodoro')}
                        title="Start study session for this block"
                        className="p-2 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold shadow-2xs border border-zinc-200 shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-zinc-700" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* High Priority & Pending Tasks */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-zinc-700" />
                <h2 className="text-base font-bold text-zinc-900">Priority Assignments & Tasks</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                  {priorityTasks.length} urgent
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <span>All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {priorityTasks.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-800">All caught up! No pending priority tasks.</p>
                <p className="text-xs text-zinc-500 mt-1">Take a well-earned break or review future coursework.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {priorityTasks.map(task => {
                  const course = courses.find(c => c.id === task.courseId);
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => onToggleTaskComplete(task.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-zinc-300 hover:border-zinc-500 bg-white'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div className="min-w-0">
                          <h4
                            className={`text-sm font-semibold truncate ${
                              isDone ? 'line-through text-zinc-400' : 'text-zinc-900'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                            {course && (
                              <span className="font-medium text-zinc-700">{course.code}</span>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="w-3 h-3" /> Due {task.dueDate}
                            </span>
                            {task.priority === 'high' && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
                                High
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onStartFocusOnTask(task)}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-zinc-700" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nearest Exam & AI Study Coach Prompts (1 col on lg) */}
        <div className="space-y-6">
          {/* Upcoming Exam Highlight */}
          {nearestExam ? (
            <div className="bg-gradient-to-br from-indigo-900 to-zinc-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Upcoming Exam Milestone
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                  {daysUntilNearestExam === 0 ? 'TODAY' : `in ${daysUntilNearestExam} days`}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">{nearestExam.title}</h3>
              <p className="text-xs text-indigo-200 mt-1">
                {courses.find(c => c.id === nearestExam.courseId)?.name || 'Course Exam'} • {nearestExam.date} ({nearestExam.time || 'TBD'})
              </p>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-indigo-200">Syllabus Topic Mastery</span>
                  <span>
                    {nearestExam.topics.filter(t => t.mastered).length}/{nearestExam.topics.length} mastered
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        nearestExam.topics.length
                          ? (nearestExam.topics.filter(t => t.mastered).length / nearestExam.topics.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() =>
                    onAskAI(
                      `Please create a personalized revision schedule and active recall practice strategy for my upcoming exam "${nearestExam.title}" covering topics: ${nearestExam.topics
                        .map(t => t.title)
                        .join(', ')}.`
                    )
                  }
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Build Study Plan with AI</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 text-center">
              <Award className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <h4 className="font-bold text-zinc-900 text-sm">No Upcoming Exams</h4>
              <p className="text-xs text-zinc-500 mt-1">Track tests, midterms, and finals with confidence.</p>
              <button
                onClick={() => onNavigateTab('exams')}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
              >
                + Schedule an exam milestone
              </button>
            </div>
          )}

          {/* AI Quick Prompts Card */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-zinc-900 text-sm">Ask Acuity AI Tutor</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed mb-4">
              Get immediate clarification on difficult topics, formulate structured study timetables, or quiz yourself.
            </p>

            <div className="space-y-2">
              <button
                onClick={() =>
                  onAskAI("How should I use the Feynman Technique to understand difficult concepts faster?")
                }
                className="w-full text-left p-2.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs font-medium text-zinc-800 transition-all flex items-center justify-between"
              >
                <span>💡 Master the Feynman Technique</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
              <button
                onClick={() =>
                  onAskAI("I'm feeling overwhelmed with my schedule. How do I prioritize today's assignments?")
                }
                className="w-full text-left p-2.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs font-medium text-zinc-800 transition-all flex items-center justify-between"
              >
                <span>⚡ How to beat study procrastination</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
              <button
                onClick={() =>
                  onAskAI("Quiz me with 3 high-yield questions on Data Structures (Trees and Graphs).")
                }
                className="w-full text-left p-2.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs font-medium text-zinc-800 transition-all flex items-center justify-between"
              >
                <span>❓ Quick Data Structures Quiz</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
