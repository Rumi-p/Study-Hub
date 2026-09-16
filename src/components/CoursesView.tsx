import React from 'react';
import { Course, Task, Exam } from '../types';
import { Plus, BookOpen, User, MapPin, Award, CheckSquare, Edit2, Trash2 } from 'lucide-react';
import { getCourseColorClasses } from './Modals';

interface CoursesViewProps {
  courses: Course[];
  tasks: Task[];
  exams: Exam[];
  onAddCourseClick: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onSelectCourseTasks: (courseId: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  tasks,
  exams,
  onAddCourseClick,
  onEditCourse,
  onDeleteCourse,
  onSelectCourseTasks,
}) => {
  const totalCredits = courses.reduce((acc, c) => acc + (c.credits || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Enrolled Courses</h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Manage your academic course syllabus, target letter grades, professors, and credit units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-100 text-zinc-800 text-xs font-semibold">
            Total Load: <span className="font-bold text-zinc-950">{totalCredits} Credits</span>
          </div>

          <button
            onClick={onAddCourseClick}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const colorStyle = getCourseColorClasses(course.color);
          const courseTasks = tasks.filter(t => t.courseId === course.id);
          const pendingTasksCount = courseTasks.filter(t => t.status !== 'completed').length;
          const courseExams = exams.filter(e => e.courseId === course.id);

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                {/* Header with Code and Target Grade */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${colorStyle.bg}`}>
                    {course.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-xs font-bold border border-zinc-200">
                      Goal: {course.targetGrade}
                    </span>
                    <button
                      onClick={() => onEditCourse(course)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCourse(course.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-zinc-900 leading-snug mb-3">
                  {course.name}
                </h3>

                <div className="space-y-1.5 text-xs text-zinc-600">
                  {course.instructor && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{course.instructor}</span>
                    </div>
                  )}
                  {course.room && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{course.room}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{course.credits} Credit Units</span>
                  </div>
                </div>

                {course.notes && (
                  <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-600 leading-relaxed">
                    {course.notes}
                  </div>
                )}
              </div>

              {/* Course footer summary */}
              <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-zinc-500">
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />
                    {pendingTasksCount} pending
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                    {courseExams.length} {courseExams.length === 1 ? 'exam' : 'exams'}
                  </span>
                </div>

                <button
                  onClick={() => onSelectCourseTasks(course.id)}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View Tasks →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
