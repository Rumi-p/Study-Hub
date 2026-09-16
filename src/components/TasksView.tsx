import React, { useState } from 'react';
import { Course, Task, Priority, TaskStatus } from '../types';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Trash2,
  Edit2,
  Play,
  CheckSquare,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCourseColorClasses } from './Modals';

interface TasksViewProps {
  tasks: Task[];
  courses: Course[];
  onToggleTaskComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTaskClick: () => void;
  onStartFocusOnTask: (task: Task) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  courses,
  onToggleTaskComplete,
  onEditTask,
  onDeleteTask,
  onAddTaskClick,
  onStartFocusOnTask,
  onUpdateSubtask,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTaskIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCompleteWithCelebration = (task: Task) => {
    if (task.status !== 'completed') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    }
    onToggleTaskComplete(task.id);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCourse = selectedCourseFilter === 'all' || t.courseId === selectedCourseFilter;
    const matchesPriority = selectedPriorityFilter === 'all' || t.priority === selectedPriorityFilter;
    return matchesSearch && matchesCourse && matchesPriority;
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const getDueBadge = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
          Overdue
        </span>
      );
    }
    if (dueDate === today) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
          Due Today
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-medium">
        Due {dueDate}
      </span>
    );
  };

  const renderTaskCard = (task: Task) => {
    const course = courses.find(c => c.id === task.courseId);
    const colorStyle = getCourseColorClasses(course?.color || 'indigo');
    const isDone = task.status === 'completed';
    const isExpanded = !!expandedTaskIds[task.id];
    const subtasks = task.subtasks || [];
    const completedSubtasksCount = subtasks.filter(s => s.completed).length;

    return (
      <div
        key={task.id}
        className={`p-4 rounded-2xl border transition-all hover:shadow-sm ${
          isDone ? 'bg-zinc-50/60 border-zinc-200 opacity-75' : 'bg-white border-zinc-200'
        }`}
      >
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {course && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${colorStyle.bg}`}>
                {course.code}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                task.priority === 'high'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : task.priority === 'medium'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}
            >
              {task.priority}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditTask(task)}
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Title & Checkbox */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => handleCompleteWithCelebration(task)}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
              isDone
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-zinc-300 hover:border-zinc-500 bg-white'
            }`}
          >
            {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>
          <div className="min-w-0 flex-1">
            <h4
              className={`text-sm font-bold leading-snug ${
                isDone ? 'line-through text-zinc-400' : 'text-zinc-900'
              }`}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Subtasks Progress */}
        {subtasks.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-zinc-100">
            <button
              onClick={() => toggleExpand(task.id)}
              className="w-full flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-800 font-medium"
            >
              <span>
                Subtasks ({completedSubtasksCount}/{subtasks.length})
              </span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-1.5 pl-1">
                {subtasks.map(st => (
                  <label
                    key={st.id}
                    className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => onUpdateSubtask(task.id, st.id)}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span className={st.completed ? 'line-through text-zinc-400' : ''}>
                      {st.title}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer meta: Due date, est hours, Focus action */}
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">{getDueBadge(task.dueDate)}</div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.estimatedHours}h est
            </span>

            {!isDone && (
              <button
                onClick={() => onStartFocusOnTask(task)}
                title="Start Pomodoro Focus session for this task"
                className="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Play className="w-3 h-3 fill-zinc-800" />
                <span className="text-[11px]">Focus</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Assignments & Tasks Manager
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Track due dates, sub-checklists, estimated hours, and move cards across Kanban columns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <button
              onClick={onAddTaskClick}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assignments or topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCourseFilter}
              onChange={e => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>

            <select
              value={selectedPriorityFilter}
              onChange={e => setSelectedPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔥 High</option>
              <option value="medium">⚡ Medium</option>
              <option value="low">🌱 Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: To Do */}
          <div className="bg-zinc-100/70 p-4 rounded-2xl border border-zinc-200/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900">To Do</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-200 text-zinc-700">
                  {todoTasks.length}
                </span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {todoTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                  No tasks to do
                </div>
              ) : (
                todoTasks.map(renderTaskCard)
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-sm font-bold text-zinc-900">In Progress</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  {inProgressTasks.length}
                </span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {inProgressTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-zinc-400 border border-dashed border-indigo-200 rounded-xl">
                  No tasks in progress
                </div>
              ) : (
                inProgressTasks.map(renderTaskCard)
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-900">Completed</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  {completedTasks.length}
                </span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {completedTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-zinc-400 border border-dashed border-emerald-200 rounded-xl">
                  No completed tasks yet
                </div>
              ) : (
                completedTasks.map(renderTaskCard)
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No tasks found matching current filters.</p>
            </div>
          ) : (
            filteredTasks.map(renderTaskCard)
          )}
        </div>
      )}
    </div>
  );
};
