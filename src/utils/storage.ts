import { Course, Task, ScheduleBlock, Exam, StudySessionRecord, ChatMessage } from '../types';
import { INITIAL_COURSES, INITIAL_TASKS, INITIAL_SCHEDULE, INITIAL_EXAMS, INITIAL_SESSIONS } from '../data/mockData';

const KEYS = {
  COURSES: 'study_planner_courses_v1',
  TASKS: 'study_planner_tasks_v1',
  SCHEDULE: 'study_planner_schedule_v1',
  EXAMS: 'study_planner_exams_v1',
  SESSIONS: 'study_planner_sessions_v1',
  CHAT_MESSAGES: 'study_planner_chat_v1',
  POMODORO_SETTINGS: 'study_planner_pomo_settings_v1',
  STREAK_DAYS: 'study_planner_streak_v1',
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to storage:`, e);
  }
};

export const getInitialData = () => {
  return {
    courses: loadFromStorage<Course[]>(KEYS.COURSES, INITIAL_COURSES),
    tasks: loadFromStorage<Task[]>(KEYS.TASKS, INITIAL_TASKS),
    schedule: loadFromStorage<ScheduleBlock[]>(KEYS.SCHEDULE, INITIAL_SCHEDULE),
    exams: loadFromStorage<Exam[]>(KEYS.EXAMS, INITIAL_EXAMS),
    sessions: loadFromStorage<StudySessionRecord[]>(KEYS.SESSIONS, INITIAL_SESSIONS),
    chatMessages: loadFromStorage<ChatMessage[]>(KEYS.CHAT_MESSAGES, [
      {
        id: 'welcome_1',
        role: 'assistant',
        content: `👋 **Hi there! I'm Acuity**, your personal academic study assistant & tutor.

I can help you:
- **Build study plans** for your upcoming exams and assignments
- **Explain tough concepts** step-by-step with real-world analogies
- **Generate practice quizzes** & flashcards to test your active recall
- **Overcome study blocks** with Pomodoro scheduling and focus strategies

How can I help you excel today? Try asking me anything or click one of the quick suggestions below!`,
        timestamp: new Date().toISOString(),
      },
    ]),
    streakDays: loadFromStorage<number>(KEYS.STREAK_DAYS, 5),
  };
};

export { KEYS };
