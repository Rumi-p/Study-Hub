import React, { useState } from 'react';
import { Course, ScheduleBlock } from '../types';
import { Plus, Calendar, Clock, MapPin, Trash2, Filter } from 'lucide-react';
import { getCourseColorClasses } from './Modals';

interface PlannerViewProps {
  schedule: ScheduleBlock[];
  courses: Course[];
  onAddBlockClick: () => void;
  onDeleteBlock: (blockId: string) => void;
}

const DAYS_OF_WEEK = [
  { index: 1, name: 'Monday', short: 'Mon' },
  { index: 2, name: 'Tuesday', short: 'Tue' },
  { index: 3, name: 'Wednesday', short: 'Wed' },
  { index: 4, name: 'Thursday', short: 'Thu' },
  { index: 5, name: 'Friday', short: 'Fri' },
  { index: 6, name: 'Saturday', short: 'Sat' },
  { index: 0, name: 'Sunday', short: 'Sun' },
];

export const PlannerView: React.FC<PlannerViewProps> = ({
  schedule,
  courses,
  onAddBlockClick,
  onDeleteBlock,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedDayMobile, setSelectedDayMobile] = useState<number>(new Date().getDay());

  const filteredSchedule = schedule.filter(b => {
    if (selectedCourseFilter === 'all') return true;
    return b.courseId === selectedCourseFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            Study Planner & Weekly Timetable
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Organize lecture hours, lab sections, and deep-work study blocks across your week.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Course filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={selectedCourseFilter}
              onChange={e => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            >
              <option value="all">All Courses & Blocks</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onAddBlockClick}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Block</span>
          </button>
        </div>
      </div>

      {/* Mobile Day Selector Tabs */}
      <div className="flex md:hidden gap-1 overflow-x-auto pb-1">
        {DAYS_OF_WEEK.map(d => {
          const isSelected = selectedDayMobile === d.index;
          return (
            <button
              key={d.index}
              onClick={() => setSelectedDayMobile(d.index)}
              className={`flex-1 min-w-[54px] py-2 text-center rounded-xl text-xs font-bold border transition-all ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {d.short}
            </button>
          );
        })}
      </div>

      {/* Timetable Grid (Desktop: 7-column layout, Mobile: Single selected day) */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-4 sm:p-6 overflow-hidden">
        {/* Desktop 7-Column Grid */}
        <div className="hidden md:grid md:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map(day => {
            const dayBlocks = filteredSchedule
              .filter(b => b.dayOfWeek === day.index)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            const isToday = new Date().getDay() === day.index;

            return (
              <div
                key={day.index}
                className={`flex flex-col rounded-xl border p-3 min-h-[500px] transition-colors ${
                  isToday ? 'bg-indigo-50/30 border-indigo-200 ring-1 ring-indigo-200' : 'bg-zinc-50/50 border-zinc-200'
                }`}
              >
                {/* Day Header */}
                <div className="text-center pb-3 border-b border-zinc-200/60 mb-3">
                  <span className={`text-xs font-extrabold uppercase tracking-wider block ${isToday ? 'text-indigo-700' : 'text-zinc-700'}`}>
                    {day.name}
                  </span>
                  {isToday && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                      Today
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-600 block mt-0.5">
                    {dayBlocks.length} {dayBlocks.length === 1 ? 'block' : 'blocks'}
                  </span>
                </div>

                {/* Day Blocks List */}
                <div className="space-y-2.5 flex-1">
                  {dayBlocks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-zinc-600 text-center px-2">
                      No blocks scheduled
                    </div>
                  ) : (
                    dayBlocks.map(block => {
                      const course = courses.find(c => c.id === block.courseId);
                      const colorStyle = getCourseColorClasses(block.color || course?.color || 'indigo');

                      return (
                        <div
                          key={block.id}
                          className={`p-2.5 rounded-xl border text-xs shadow-2xs group relative transition-all hover:scale-[1.01] ${colorStyle.bg}`}
                        >
                          <button
                            onClick={() => onDeleteBlock(block.id)}
                            title="Delete block"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-600 rounded transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-1 font-mono text-[10px] font-semibold text-zinc-600 mb-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {block.startTime} - {block.endTime}
                            </span>
                          </div>

                          <h4 className="font-bold text-zinc-900 leading-tight pr-4">{block.title}</h4>

                          <div className="flex items-center justify-between gap-1 mt-2 text-[10px] text-zinc-600">
                            <span className="uppercase font-semibold tracking-wider">
                              {block.type}
                            </span>
                            {block.location && (
                              <span className="flex items-center gap-0.5 truncate max-w-[90px]">
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="truncate">{block.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Single Day View */}
        <div className="md:hidden">
          {(() => {
            const currentDay = DAYS_OF_WEEK.find(d => d.index === selectedDayMobile)!;
            const dayBlocks = filteredSchedule
              .filter(b => b.dayOfWeek === selectedDayMobile)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-3 mb-2">
                  <h3 className="font-bold text-base text-zinc-900">{currentDay.name}</h3>
                  <span className="text-xs text-zinc-500 font-medium">
                    {dayBlocks.length} planned activities
                  </span>
                </div>

                {dayBlocks.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                    <p className="text-sm font-medium">No blocks scheduled for {currentDay.name}.</p>
                    <button
                      onClick={onAddBlockClick}
                      className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      + Add a class or study block
                    </button>
                  </div>
                ) : (
                  dayBlocks.map(block => {
                    const course = courses.find(c => c.id === block.courseId);
                    const colorStyle = getCourseColorClasses(block.color || course?.color || 'indigo');

                    return (
                      <div
                        key={block.id}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${colorStyle.bg}`}
                      >
                        <div>
                          <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-700 mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {block.startTime} - {block.endTime}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/70">
                              {block.type}
                            </span>
                          </div>
                          <h4 className="font-bold text-zinc-900 text-sm">{block.title}</h4>
                          {block.location && (
                            <p className="text-xs text-zinc-600 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {block.location}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => onDeleteBlock(block.id)}
                          className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
