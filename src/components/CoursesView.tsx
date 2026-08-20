import React, { useState, useEffect } from 'react';
import { Course, Department, University } from '../types';
import { BookOpen, Users, Clock, MapPin, Award, CheckCircle } from 'lucide-react';

interface CoursesViewProps {
  activeUniversity: University | null;
  onNavigate: (view: string, targetId?: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ activeUniversity, onNavigate }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAcademicData() {
      setIsLoading(true);
      try {
        if (activeUniversity) {
          const deptRes = await fetch(`/api/universities/${activeUniversity.id}/departments`);
          if (deptRes.ok) {
            const depts = await deptRes.json();
            setDepartments(depts);
            if (depts.length > 0) setSelectedDept(depts[0].id);
          }
        }
        const courseRes = await fetch('/api/courses');
        if (courseRes.ok) {
          const courseList = await courseRes.json();
          setCourses(courseList);
        }
      } catch (err) {
        console.error('Academic load failed', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAcademicData();
  }, [activeUniversity]);

  const filteredCourses = selectedDept
    ? courses.filter((c) => c.department_id === selectedDept)
    : courses;

  const currentDeptObj = departments.find((d) => d.id === selectedDept);

  return (
    <div className="space-y-4" id="collegiate-courses-view">
      
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-3.5 shadow-xs">
        <div className="border-b border-slate-100 pb-2 mb-3">
          <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-900" />
            Curriculum & Faculty Departments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional course registry, syllabus outlines, and enrollment statistics for {activeUniversity?.name}
          </p>
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setSelectedDept('')}
            className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
              selectedDept === '' ? 'bg-[#1d3c6a] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Faculties
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                selectedDept === dept.id ? 'bg-[#1d3c6a] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {dept.name} ({dept.code})
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Head Info Banner */}
      {currentDeptObj && (
        <div className="bg-blue-50/70 border border-blue-200 rounded p-3 text-xs text-slate-700">
          <div className="font-bold text-blue-950 text-sm mb-0.5">{currentDeptObj.name}</div>
          <div className="text-[11px] text-blue-800 mb-1">
            Chair: <strong>{currentDeptObj.faculty_head || 'Departmental Board'}</strong>
          </div>
          <p className="text-slate-600 leading-relaxed font-sans">{currentDeptObj.description}</p>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            Querying university syllabus catalog...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-300 rounded">
            No course offerings found for this faculty in the current Michaelmas term.
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-slate-300 rounded p-3.5 shadow-xs hover:border-blue-300 transition-all text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-blue-900 text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {course.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm font-serif">{course.title}</h3>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-1">
                    Instructor: <strong className="text-slate-800">{course.instructor}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                    {course.credits} Credits
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                    <Users className="w-3 h-3" /> {course.enrollment_count} enrolled
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Schedule: <strong>{course.meeting_time || 'Mon/Wed 10:00 - 11:30 AM'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location: <strong>{course.room || 'Main Lecture Hall'}</strong></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
