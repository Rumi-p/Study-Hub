import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Course,
  Task,
  ScheduleBlock,
  Exam,
  StudySessionRecord,
  ChatMessage,
} from './types';
import { getInitialData, saveToStorage, KEYS } from './utils/storage';
import {
  INITIAL_COURSES,
  INITIAL_TASKS,
  INITIAL_SCHEDULE,
  INITIAL_EXAMS,
  INITIAL_SESSIONS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PlannerView } from './components/PlannerView';
import { TasksView } from './components/TasksView';
import { CoursesView } from './components/CoursesView';
import { PomodoroView } from './components/PomodoroView';
import { ExamsView } from './components/ExamsView';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import {
  TaskModal,
  CourseModal,
  ExamModal,
  ScheduleModal,
} from './components/Modals';

export default function App() {
  // Initialize state from storage
  const [initialState] = useState(() => getInitialData());
  const [courses, setCourses] = useState<Course[]>(initialState.courses);
  const [tasks, setTasks] = useState<Task[]>(initialState.tasks);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(initialState.schedule);
  const [exams, setExams] = useState<Exam[]>(initialState.exams);
  const [sessions, setSessions] = useState<StudySessionRecord[]>(initialState.sessions);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialState.chatMessages);
  const [streakDays, setStreakDays] = useState<number>(initialState.streakDays);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Focus mode task linking
  const [selectedTaskIdForFocus, setSelectedTaskIdForFocus] = useState<string | undefined>();

  // Persistent storage sync
  useEffect(() => {
    saveToStorage(KEYS.COURSES, courses);
  }, [courses]);

  useEffect(() => {
    saveToStorage(KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage(KEYS.SCHEDULE, schedule);
  }, [schedule]);

  useEffect(() => {
    saveToStorage(KEYS.EXAMS, exams);
  }, [exams]);

  useEffect(() => {
    saveToStorage(KEYS.SESSIONS, sessions);
  }, [sessions]);

  useEffect(() => {
    saveToStorage(KEYS.CHAT_MESSAGES, chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    saveToStorage(KEYS.STREAK_DAYS, streakDays);
  }, [streakDays]);

  // Reset to initial demo data
  const handleResetData = () => {
    if (confirm('Reset to standard student demo schedule, courses, and assignments?')) {
      setCourses(INITIAL_COURSES);
      setTasks(INITIAL_TASKS);
      setSchedule(INITIAL_SCHEDULE);
      setExams(INITIAL_EXAMS);
      setSessions(INITIAL_SESSIONS);
      setStreakDays(5);
    }
  };

  // Task Handlers
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(prev =>
        prev.map(t => (t.id === editingTask.id ? ({ ...t, ...taskData } as Task) : t))
      );
    } else {
      setTasks(prev => [taskData as Task, ...prev]);
    }
    setEditingTask(null);
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const isNowCompleted = t.status !== 'completed';
          return {
            ...t,
            status: isNowCompleted ? 'completed' : 'todo',
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleUpdateSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId && t.subtasks) {
          return {
            ...t,
            subtasks: t.subtasks.map(st =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Course Handlers
  const handleSaveCourse = (course: Course) => {
    if (editingCourse) {
      setCourses(prev => prev.map(c => (c.id === editingCourse.id ? course : c)));
      // Also update course name on tasks
      setTasks(prev =>
        prev.map(t => (t.courseId === course.id ? { ...t, courseName: course.name } : t))
      );
    } else {
      setCourses(prev => [...prev, course]);
    }
    setEditingCourse(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Delete this course and unlink its tasks?')) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
    }
  };

  // Schedule Handlers
  const handleSaveScheduleBlock = (block: ScheduleBlock) => {
    setSchedule(prev => [...prev, block]);
  };

  const handleDeleteScheduleBlock = (blockId: string) => {
    setSchedule(prev => prev.filter(b => b.id !== blockId));
  };

  // Exam Handlers
  const handleSaveExam = (exam: Exam) => {
    if (editingExam) {
      setExams(prev => prev.map(e => (e.id === editingExam.id ? exam : e)));
    } else {
      setExams(prev => [...prev, exam]);
    }
    setEditingExam(null);
  };

  const handleDeleteExam = (examId: string) => {
    setExams(prev => prev.filter(e => e.id !== examId));
  };

  const handleToggleTopicMastery = (examId: string, topicId: string) => {
    setExams(prev =>
      prev.map(e => {
        if (e.id === examId) {
          return {
            ...e,
            topics: e.topics.map(tp =>
              tp.id === topicId ? { ...tp, mastered: !tp.mastered } : tp
            ),
          };
        }
        return e;
      })
    );
  };

  // Pomodoro Focus Handlers
  const handleStartFocusOnTask = (task: Task) => {
    setSelectedTaskIdForFocus(task.id);
    setActiveTab('pomodoro');
  };

  const handleLogSession = (session: StudySessionRecord) => {
    setSessions(prev => [session, ...prev]);
    // If associated with a task, increment task completed hours
    if (session.taskId) {
      setTasks(prev =>
        prev.map(t => {
          if (t.id === session.taskId) {
            const addedHours = session.durationMinutes / 60;
            return {
              ...t,
              completedHours: (t.completedHours || 0) + addedHours,
            };
          }
          return t;
        })
      );
    }
  };

  // AI Prompt Dispatcher
  const handleAskAI = (promptText: string) => {
    setIsChatDrawerOpen(true);
    // Add user message to history
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userMsg]);

    // Send to backend
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content })),
        context: {
          courses: courses.map(c => ({ name: c.name, code: c.code, targetGrade: c.targetGrade })),
          tasks: tasks.map(t => ({ title: t.title, dueDate: t.dueDate, priority: t.priority })),
          exams: exams.map(e => ({ title: e.title, date: e.date, confidence: e.confidenceLevel })),
          studyStats: { streakDays, hoursStudiedThisWeek: sessions.reduce((a, b) => a + b.durationMinutes, 0) / 60 },
        },
      }),
    })
      .then(res => res.json())
      .then(data => {
        const assistantMsg: ChatMessage = {
          id: 'ast_' + Date.now(),
          role: 'assistant',
          content: data.reply || 'Here is your study plan.',
          timestamp: new Date().toISOString(),
        };
        setChatMessages(prev => [...prev, assistantMsg]);
      })
      .catch(err => {
        console.error('Chat failed:', err);
      });
  };

  const totalStudyHours = Number((sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60).toFixed(1));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakDays={streakDays}
        isChatOpen={isChatDrawerOpen}
        setIsChatOpen={setIsChatDrawerOpen}
        onResetData={handleResetData}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            courses={courses}
            tasks={tasks}
            schedule={schedule}
            exams={exams}
            sessions={sessions}
            streakDays={streakDays}
            onNavigateTab={setActiveTab}
            onToggleTaskComplete={handleToggleTaskComplete}
            onOpenTaskModal={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onStartFocusOnTask={handleStartFocusOnTask}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === 'planner' && (
          <PlannerView
            schedule={schedule}
            courses={courses}
            onAddBlockClick={() => setIsScheduleModalOpen(true)}
            onDeleteBlock={handleDeleteScheduleBlock}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            courses={courses}
            onToggleTaskComplete={handleToggleTaskComplete}
            onEditTask={task => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onAddTaskClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onStartFocusOnTask={handleStartFocusOnTask}
            onUpdateSubtask={handleUpdateSubtask}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            courses={courses}
            tasks={tasks}
            exams={exams}
            onAddCourseClick={() => {
              setEditingCourse(null);
              setIsCourseModalOpen(true);
            }}
            onEditCourse={course => {
              setEditingCourse(course);
              setIsCourseModalOpen(true);
            }}
            onDeleteCourse={handleDeleteCourse}
            onSelectCourseTasks={_courseId => {
              setActiveTab('tasks');
            }}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroView
            courses={courses}
            tasks={tasks}
            sessions={sessions}
            onLogSession={handleLogSession}
            selectedTaskId={selectedTaskIdForFocus}
          />
        )}

        {activeTab === 'exams' && (
          <ExamsView
            exams={exams}
            courses={courses}
            onAddExamClick={() => {
              setEditingExam(null);
              setIsExamModalOpen(true);
            }}
            onEditExam={exam => {
              setEditingExam(exam);
              setIsExamModalOpen(true);
            }}
            onDeleteExam={handleDeleteExam}
            onToggleTopicMastery={handleToggleTopicMastery}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === 'ai-chat' && (
          <div className="h-[calc(100vh-140px)]">
            <ChatbotDrawer
              isOpen={true}
              isFullView={true}
              courses={courses}
              tasks={tasks}
              exams={exams}
              streakDays={streakDays}
              totalStudyHours={totalStudyHours}
              messages={chatMessages}
              onUpdateMessages={setChatMessages}
            />
          </div>
        )}
      </main>

      {/* Docked Slide-out Chatbot Drawer (when not in full tab view) */}
      {activeTab !== 'ai-chat' && (
        <ChatbotDrawer
          isOpen={isChatDrawerOpen}
          onClose={() => setIsChatDrawerOpen(false)}
          isFullView={false}
          courses={courses}
          tasks={tasks}
          exams={exams}
          streakDays={streakDays}
          totalStudyHours={totalStudyHours}
          messages={chatMessages}
          onUpdateMessages={setChatMessages}
        />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        courses={courses}
        initialTask={editingTask}
      />

      {/* Course Modal */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
        initialCourse={editingCourse}
      />

      {/* Exam Modal */}
      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => {
          setIsExamModalOpen(false);
          setEditingExam(null);
        }}
        onSave={handleSaveExam}
        courses={courses}
        initialExam={editingExam}
      />

      {/* Schedule Block Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveScheduleBlock}
        courses={courses}
      />
    </div>
  );
}
