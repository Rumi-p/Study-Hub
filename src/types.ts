export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Course {
  id: string;
  code: string;
  name: string;
  color: string; // Tailwind color theme identifier or hex
  instructor: string;
  room?: string;
  credits: number;
  targetGrade: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  courseId: string;
  courseName?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  estimatedHours: number;
  completedHours?: number;
  description?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
  completedAt?: string;
}

export interface ScheduleBlock {
  id: string;
  courseId?: string;
  title: string;
  type: 'lecture' | 'lab' | 'study' | 'quiz' | 'extracurricular';
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  location?: string;
  color?: string;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  weightPercentage: number;
  confidenceLevel: number; // 0 to 100
  topics: { id: string; title: string; mastered: boolean }[];
  targetScore: number;
}

export interface StudySessionRecord {
  id: string;
  courseId?: string;
  courseName?: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  timestamp: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type ActiveTab = 'dashboard' | 'planner' | 'tasks' | 'courses' | 'pomodoro' | 'exams' | 'ai-chat';
