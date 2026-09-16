import React from 'react';
import { Course, Exam } from '../types';
import { Plus, Award, Calendar, Clock, MapPin, Sparkles, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { getCourseColorClasses } from './Modals';

interface ExamsViewProps {
  exams: Exam[];
  courses: Course[];
  onAddExamClick: () => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  onToggleTopicMastery: (examId: string, topicId: string) => void;
  onAskAI: (prompt: string) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  courses,
  onAddExamClick,
  onEditExam,
  onDeleteExam,
  onToggleTopicMastery,
  onAskAI,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  const getCountdownLabel = (examDateStr: string) => {
    const examDate = new Date(examDateStr);
    const currentDate = new Date();
    const diffTime = examDate.getTime() - currentDate.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { label: 'Completed', color: 'bg-zinc-100 text-zinc-500' };
    }
    if (days === 0) {
      return { label: '🔥 TODAY', color: 'bg-rose-500 text-white font-bold animate-pulse' };
    }
    if (days === 1) {
      return { label: '⚡ Tomorrow', color: 'bg-amber-500 text-white font-bold' };
    }
    return { label: `In ${days} days`, color: 'bg-indigo-50 text-indigo-700 border border-indigo-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Exams & Milestones</h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Track test dates, syllabus topic mastery, target scores, and generate AI revision schedules.
          </p>
        </div>

        <button
          onClick={onAddExamClick}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam</span>
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedExams.map(exam => {
          const course = courses.find(c => c.id === exam.courseId);
          const colorStyle = getCourseColorClasses(course?.color || 'indigo');
          const countdown = getCountdownLabel(exam.date);
          const masteredCount = exam.topics.filter(t => t.mastered).length;
          const topicMasteryPercent = exam.topics.length
            ? Math.round((masteredCount / exam.topics.length) * 100)
            : 0;

          return (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {course && (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${colorStyle.bg}`}>
                        {course.code}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${countdown.color}`}>
                      {countdown.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditExam(exam)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExam(exam.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-zinc-900 leading-snug mb-2">
                  {exam.title}
                </h3>

                <div className="space-y-1.5 text-xs text-zinc-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{exam.date} {exam.time ? `at ${exam.time}` : ''}</span>
                  </div>
                  {exam.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{exam.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      Weight: {exam.weightPercentage}% of course grade • Target: {exam.targetScore}%
                    </span>
                  </div>
                </div>

                {/* Readiness / Topic Mastery Progress */}
                <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1.5">
                    <span>Topic Mastery</span>
                    <span className="font-bold text-indigo-600">
                      {masteredCount}/{exam.topics.length} ({topicMasteryPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden mb-3">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${topicMasteryPercent}%` }}
                    />
                  </div>

                  {/* Checklist of topics */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {exam.topics.map(topic => (
                      <label
                        key={topic.id}
                        className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer select-none hover:text-zinc-950"
                      >
                        <input
                          type="checkbox"
                          checked={topic.mastered}
                          onChange={() => onToggleTopicMastery(exam.id, topic.id)}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span className={topic.mastered ? 'line-through text-zinc-400' : ''}>
                          {topic.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() =>
                  onAskAI(
                    `I have an exam on "${exam.title}" for ${course?.name || 'my class'} on ${exam.date}. The syllabus topics are: ${exam.topics
                      .map(t => `${t.title} (${t.mastered ? 'Mastered' : 'Needs Review'})`)
                      .join(', ')}. Please build a strategic countdown revision schedule focusing on the unmastered topics with active recall questions!`
                  )
                }
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Create AI Study Plan</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
