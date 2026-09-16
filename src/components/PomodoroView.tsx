import React, { useState, useEffect, useRef } from 'react';
import { Course, Task, StudySessionRecord } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Maximize,
  Minimize,
  Flame,
  Clock,
  Music,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playCompletionChime,
  playClickSound,
  startAmbientSound,
  stopAmbientSound,
  setAmbientVolume,
  AmbientType,
} from '../utils/audio';

interface PomodoroViewProps {
  courses: Course[];
  tasks: Task[];
  sessions: StudySessionRecord[];
  onLogSession: (session: StudySessionRecord) => void;
  selectedTaskId?: string;
}

type PomoMode = 'focus' | 'shortBreak' | 'longBreak';

const DEFAULT_DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  courses,
  tasks,
  sessions,
  onLogSession,
  selectedTaskId,
}) => {
  const [mode, setMode] = useState<PomoMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customFocusMinutes, setCustomFocusMinutes] = useState<number>(25);

  // Link to active task/course
  const [linkedTaskId, setLinkedTaskId] = useState<string>(selectedTaskId || '');
  const [linkedCourseId, setLinkedCourseId] = useState<string>('');

  // Ambient sound state
  const [ambientType, setAmbientType] = useState<AmbientType>('none');
  const [ambientVol, setAmbientVol] = useState<number>(0.2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-set course when task is selected
  useEffect(() => {
    if (linkedTaskId) {
      const task = tasks.find(t => t.id === linkedTaskId);
      if (task) {
        setLinkedCourseId(task.courseId);
      }
    }
  }, [linkedTaskId, tasks]);

  useEffect(() => {
    if (selectedTaskId) {
      setLinkedTaskId(selectedTaskId);
    }
  }, [selectedTaskId]);

  // Timer tick interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Session finished!
      setIsRunning(false);
      playCompletionChime();

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      if (mode === 'focus') {
        const completedCourse = courses.find(c => c.id === linkedCourseId);
        const completedTask = tasks.find(t => t.id === linkedTaskId);
        const durationMinutes = Math.round(DEFAULT_DURATIONS.focus / 60);

        onLogSession({
          id: 'sess_' + Date.now(),
          courseId: linkedCourseId || undefined,
          courseName: completedCourse?.name || undefined,
          taskId: linkedTaskId || undefined,
          taskTitle: completedTask?.title || undefined,
          durationMinutes: customFocusMinutes,
          timestamp: new Date().toISOString(),
          notes: 'Focus Pomodoro completed.',
        });
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, linkedCourseId, linkedTaskId, courses, tasks, customFocusMinutes, onLogSession]);

  // Ambient sound handler
  const handleAmbientChange = (type: AmbientType) => {
    setAmbientType(type);
    if (type === 'none') {
      stopAmbientSound();
    } else {
      startAmbientSound(type, ambientVol);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVol(vol);
    setAmbientVolume(vol);
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const switchMode = (newMode: PomoMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') {
      setTimeLeft(customFocusMinutes * 60);
    } else {
      setTimeLeft(DEFAULT_DURATIONS[newMode]);
    }
  };

  const toggleTimer = () => {
    playClickSound();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    playClickSound();
    setIsRunning(false);
    if (mode === 'focus') {
      setTimeLeft(customFocusMinutes * 60);
    } else {
      setTimeLeft(DEFAULT_DURATIONS[mode]);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentTotal = mode === 'focus' ? customFocusMinutes * 60 : DEFAULT_DURATIONS[mode];
  const progressPercent = ((currentTotal - timeLeft) / currentTotal) * 100;

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-zinc-950 p-8 overflow-y-auto text-white' : ''}`}>
      {/* Header & Controls */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Focus Studio & Pomodoro</h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Harness deep work intervals, active recall blocks, and relaxing ambient soundscapes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3.5 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>Full Screen Focus</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Card */}
      <div className={`rounded-3xl border shadow-sm p-8 text-center transition-all ${
        isFullscreen ? 'bg-zinc-900 border-zinc-800 max-w-3xl mx-auto' : 'bg-white border-zinc-200'
      }`}>
        {/* Fullscreen close button */}
        {isFullscreen && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs flex items-center gap-1"
            >
              <Minimize className="w-3.5 h-3.5" />
              <span>Exit Fullscreen</span>
            </button>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100 border border-zinc-200/80 mb-8">
          <button
            onClick={() => switchMode('focus')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'focus'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Deep Focus ({customFocusMinutes}m)
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'shortBreak'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'longBreak'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Digital Clock */}
        <div className="my-6">
          <div className={`font-mono text-7xl sm:text-9xl font-extrabold tracking-tight select-none ${
            isFullscreen ? 'text-white' : 'text-zinc-950'
          }`}>
            {formattedTime}
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mt-2">
            {mode === 'focus' ? 'Session In Progress' : 'Recharge & Rest'}
          </p>

          {/* Linear Progress Bar */}
          <div className="w-full max-w-md mx-auto bg-zinc-100 rounded-full h-2 mt-6 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                mode === 'focus' ? 'bg-indigo-600' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Controls: Start / Pause / Reset */}
        <div className="flex items-center justify-center gap-4 my-8">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Task & Course Linking */}
        <div className="max-w-md mx-auto pt-6 border-t border-zinc-100/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Associate Task
            </label>
            <select
              value={linkedTaskId}
              onChange={e => setLinkedTaskId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-800 focus:outline-hidden"
            >
              <option value="">No specific task</option>
              {tasks
                .filter(t => t.status !== 'completed')
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Course Tag
            </label>
            <select
              value={linkedCourseId}
              onChange={e => setLinkedCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-800 focus:outline-hidden"
            >
              <option value="">General Study</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ambient Soundscapes Synthesizer */}
        <div className="max-w-md mx-auto mt-6 pt-6 border-t border-zinc-100/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-indigo-500" />
              Ambient Focus Audio
            </span>
            <span className="text-[11px] text-zinc-600 font-mono">
              Web Audio Synthesizer
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {(['none', 'rain', 'whitenoise', 'library'] as AmbientType[]).map(t => (
              <button
                key={t}
                onClick={() => handleAmbientChange(t)}
                className={`py-2 text-xs font-semibold rounded-xl capitalize border transition-all ${
                  ambientType === t
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {t === 'none' ? 'Mute' : t === 'whitenoise' ? 'White Noise' : t}
              </button>
            ))}
          </div>

          {ambientType !== 'none' && (
            <div className="flex items-center gap-3 px-1">
              <Volume2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={ambientVol}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-zinc-900"
              />
              <span className="text-xs font-mono text-zinc-500 w-8">{Math.round(ambientVol * 100)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Logged Study Sessions */}
      {!isFullscreen && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-zinc-900">Recent Completed Sessions</h3>
            <span className="text-xs text-zinc-500 font-medium">
              {sessions.length} sessions logged
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 text-sm">
              No sessions completed yet. Complete a 25-minute Pomodoro to log your study time!
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {sessions.slice(0, 5).map(sess => (
                <div key={sess.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-zinc-900">
                        {sess.taskTitle || sess.courseName || 'Deep Focus Session'}
                      </h5>
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        {new Date(sess.timestamp).toLocaleDateString()} at{' '}
                        {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg">
                    +{sess.durationMinutes} mins
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
