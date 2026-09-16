import React, { useState } from 'react';
import { Course, Task, ScheduleBlock, Exam, Priority, TaskStatus } from '../types';
import { X, Plus, Trash2, CheckCircle } from 'lucide-react';

// Color choices for courses
export const COURSE_COLORS = [
  { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  { name: 'Amber', value: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { name: 'Violet', value: 'violet', bg: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  { name: 'Sky', value: 'sky', bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  { name: 'Rose', value: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
];

export const getCourseColorClasses = (colorName: string = 'indigo') => {
  const match = COURSE_COLORS.find(c => c.value === colorName);
  return match || COURSE_COLORS[1];
};

// ===================== TASK MODAL =====================
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  courses: Course[];
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courses,
  initialTask,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(initialTask?.title || '');
  const [courseId, setCourseId] = useState(initialTask?.courseId || (courses[0]?.id || ''));
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState(initialTask?.dueTime || '23:59');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || 'todo');
  const [estimatedHours, setEstimatedHours] = useState(initialTask?.estimatedHours || 2);
  const [description, setDescription] = useState(initialTask?.description || '');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>(
    initialTask?.subtasks || []
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: 'st_' + Date.now(), title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const selectedCourse = courses.find(c => c.id === courseId);
    onSave({
      id: initialTask?.id || 't_' + Date.now(),
      title: title.trim(),
      courseId,
      courseName: selectedCourse ? selectedCourse.name : 'General',
      dueDate,
      dueTime,
      priority,
      status,
      estimatedHours: Number(estimatedHours) || 1,
      description: description.trim(),
      subtasks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <h2 className="text-lg font-bold text-zinc-900">
            {initialTask ? 'Edit Assignment / Task' : 'New Assignment or Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Task / Assignment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Dijkstra Algorithm or Read Chapter 5"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Course / Subject *
              </label>
              <select
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm bg-white"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm bg-white"
              >
                <option value="high">🔥 High Priority</option>
                <option value="medium">⚡ Medium Priority</option>
                <option value="low">🌱 Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="50"
                value={estimatedHours}
                onChange={e => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Status
            </label>
            <div className="flex gap-2">
              {(['todo', 'in_progress', 'completed'] as TaskStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize border transition-all ${
                    status === s
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Description & Requirements
            </label>
            <textarea
              rows={2}
              placeholder="Add assignment rubric notes, required chapters, or submission links..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Checklist / Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map(st => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs"
                >
                  <span className={st.completed ? 'line-through text-zinc-400' : 'text-zinc-800'}>
                    {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-zinc-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add sub-step..."
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Add Step
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl shadow-xs transition-colors"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================== COURSE MODAL =====================
interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  initialCourse?: Course | null;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCourse,
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState(initialCourse?.code || '');
  const [name, setName] = useState(initialCourse?.name || '');
  const [color, setColor] = useState(initialCourse?.color || 'indigo');
  const [instructor, setInstructor] = useState(initialCourse?.instructor || '');
  const [room, setRoom] = useState(initialCourse?.room || '');
  const [credits, setCredits] = useState(initialCourse?.credits || 3);
  const [targetGrade, setTargetGrade] = useState(initialCourse?.targetGrade || 'A');
  const [notes, setNotes] = useState(initialCourse?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    onSave({
      id: initialCourse?.id || 'c_' + Date.now(),
      code: code.trim(),
      name: name.trim(),
      color,
      instructor: instructor.trim(),
      room: room.trim(),
      credits: Number(credits) || 3,
      targetGrade: targetGrade.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-zinc-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <h2 className="text-lg font-bold text-zinc-900">
            {initialCourse ? 'Edit Course Details' : 'Add Enrolled Course'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                placeholder="CS 301"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm font-semibold"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                required
                placeholder="Data Structures & Algorithms"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Course Color Tag
            </label>
            <div className="flex items-center gap-2">
              {COURSE_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${c.dot} ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-zinc-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {color === c.value && <div className="w-2 h-2 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Instructor / Professor
              </label>
              <input
                type="text"
                placeholder="Dr. Alan Turing"
                value={instructor}
                onChange={e => setInstructor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Room / Hall
              </label>
              <input
                type="text"
                placeholder="Turing 204"
                value={room}
                onChange={e => setRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Credits
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={credits}
                onChange={e => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Target Letter Grade
              </label>
              <input
                type="text"
                placeholder="A / A-"
                value={targetGrade}
                onChange={e => setTargetGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Syllabus / Key Focus Notes
            </label>
            <textarea
              rows={2}
              placeholder="Important office hours, grading breakdown, midterm dates..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>

          <div className="pt-3 border-t border-zinc-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl shadow-xs transition-colors"
            >
              {initialCourse ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================== EXAM MODAL =====================
interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Exam) => void;
  courses: Course[];
  initialExam?: Exam | null;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courses,
  initialExam,
}) => {
  if (!isOpen) return null;

  const [courseId, setCourseId] = useState(initialExam?.courseId || (courses[0]?.id || ''));
  const [title, setTitle] = useState(initialExam?.title || '');
  const [date, setDate] = useState(initialExam?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialExam?.time || '10:00 AM');
  const [location, setLocation] = useState(initialExam?.location || '');
  const [weightPercentage, setWeightPercentage] = useState(initialExam?.weightPercentage || 25);
  const [confidenceLevel, setConfidenceLevel] = useState(initialExam?.confidenceLevel || 70);
  const [targetScore, setTargetScore] = useState(initialExam?.targetScore || 90);
  const [topics, setTopics] = useState(initialExam?.topics || []);
  const [newTopic, setNewTopic] = useState('');

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    setTopics([...topics, { id: 'top_' + Date.now(), title: newTopic.trim(), mastered: false }]);
    setNewTopic('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: initialExam?.id || 'e_' + Date.now(),
      courseId,
      title: title.trim(),
      date,
      time,
      location: location.trim(),
      weightPercentage: Number(weightPercentage) || 20,
      confidenceLevel: Number(confidenceLevel) || 50,
      targetScore: Number(targetScore) || 90,
      topics,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <h2 className="text-lg font-bold text-zinc-900">
            {initialExam ? 'Edit Exam Milestone' : 'Add Upcoming Exam / Final'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Exam Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm 1: Graphs & Shortest Path"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Course *
              </label>
              <select
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm bg-white"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Exam Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Time
              </label>
              <input
                type="text"
                placeholder="10:00 AM"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Grade Weight (%)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={weightPercentage}
                onChange={e => setWeightPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Target Score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={targetScore}
                onChange={e => setTargetScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Current Readiness / Confidence Level
              </label>
              <span className="text-xs font-bold text-indigo-600">{confidenceLevel}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={confidenceLevel}
              onChange={e => setConfidenceLevel(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Syllabus Topics to Master ({topics.filter(t => t.mastered).length}/{topics.length})
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
              {topics.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
                  <span className={t.mastered ? 'line-through text-zinc-400' : 'text-zinc-800'}>{t.title}</span>
                  <button
                    type="button"
                    onClick={() => setTopics(topics.filter(item => item.id !== t.id))}
                    className="text-zinc-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Dynamic Programming, Eigenvalues..."
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg text-xs font-semibold"
              >
                Add Topic
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl shadow-xs transition-colors"
            >
              {initialExam ? 'Save Changes' : 'Create Exam Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================== SCHEDULE BLOCK MODAL =====================
interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: ScheduleBlock) => void;
  courses: Course[];
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courses,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [type, setType] = useState<ScheduleBlock['type']>('lecture');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [location, setLocation] = useState('');

  const days = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.id === courseId);
    onSave({
      id: 'sb_' + Date.now(),
      courseId: type !== 'extracurricular' ? courseId : undefined,
      title: title.trim() || (course ? `${course.name} (${type})` : 'Study Session'),
      type,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      location: location.trim() || (course?.room || ''),
      color: course?.color || 'indigo',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <h2 className="text-lg font-bold text-zinc-900">Add Timetable Block</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Block Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm bg-white"
            >
              <option value="lecture">📖 Class Lecture</option>
              <option value="lab">🔬 Lab / Practicum</option>
              <option value="study">💡 Dedicated Study Block</option>
              <option value="quiz">📝 Quiz / Recitation</option>
              <option value="extracurricular">🏃 Activity / Club</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Title / Activity Name
            </label>
            <input
              type="text"
              placeholder="e.g. Calculus Lecture or Review Homework"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Associated Course
            </label>
            <select
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm bg-white"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Day of Week
            </label>
            <div className="grid grid-cols-7 gap-1">
              {days.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDayOfWeek(d.value)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    dayOfWeek === d.value
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Room / Location
            </label>
            <input
              type="text"
              placeholder="e.g. Turing 204 or Main Library 3F"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>

          <div className="pt-3 border-t border-zinc-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl shadow-xs transition-colors"
            >
              Add to Timetable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
