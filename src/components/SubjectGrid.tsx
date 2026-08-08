import React from 'react';
import { Atom, FlaskConical, Calculator, Dna, ArrowRight, BookOpen, FileText, CheckCircle2 } from 'lucide-react';
import { SUBJECTS } from '../data/mockData';
import { ExamType, SubjectId } from '../types';

interface SubjectGridProps {
  selectedExam: ExamType;
  onSelectSubject: (subjectId: SubjectId) => void;
  onTabChange: (tab: string) => void;
}

export const SubjectGrid: React.FC<SubjectGridProps> = ({
  selectedExam,
  onSelectSubject,
  onTabChange,
}) => {
  // Filter subjects based on target exam
  const filteredSubjects = SUBJECTS.filter((sub) => {
    if (selectedExam === 'JEE') {
      return sub.applicableExams.includes('JEE') || sub.applicableExams.includes('ALL');
    }
    if (selectedExam === 'NEET') {
      return sub.applicableExams.includes('NEET') || sub.applicableExams.includes('ALL');
    }
    return true;
  });

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Atom': return <Atom className="w-6 h-6" />;
      case 'FlaskConical': return <FlaskConical className="w-6 h-6" />;
      case 'Calculator': return <Calculator className="w-6 h-6" />;
      case 'Dna': return <Dna className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Select Subject & Syllabus
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {selectedExam === 'JEE' ? 'JEE Main & Advanced Curriculum' : selectedExam === 'NEET' ? 'NEET UG Medical Entrance Curriculum' : 'All Entrance Exam Subjects'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> NCERT Syllabus Updated
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredSubjects.map((sub) => {
          return (
            <div
              key={sub.id}
              onClick={() => {
                onSelectSubject(sub.id);
                onTabChange('subjects');
              }}
              className={`group relative p-6 rounded-2xl border ${sub.borderColor} ${sub.bgColor} hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between overflow-hidden`}
            >
              <div>
                {/* Top Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    {getSubjectIcon(sub.icon)}
                  </div>

                  {/* Exam Tag Badges */}
                  <div className="flex gap-1">
                    {sub.applicableExams.map((ex) => (
                      <span
                        key={ex}
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ex === 'JEE' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' 
                            : ex === 'NEET'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title & Desc */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {sub.description}
                </p>
              </div>

              {/* Stats Footer */}
              <div>
                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-t border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 font-medium">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{sub.totalChapters}</span>
                    <span className="text-[11px]">Chapters</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{sub.totalFormulas}</span>
                    <span className="text-[11px]">Formulas</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Topics & Notes</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
