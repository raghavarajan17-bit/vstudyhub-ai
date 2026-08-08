import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, BookOpen, Calculator, HelpCircle, Users, BarChart3, 
  Sparkles, Check, AlertCircle, Trash2, Edit3, Save, Shield
} from 'lucide-react';
import { SubjectId, ExamType, ClassLevel } from '../types';
import { saveNoteToFirestore, saveFormulaToFirestore, saveQuizToFirestore } from '../lib/firestoreSync';

export const AdminPanelView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'formulas' | 'quizzes'>('overview');
  const [metrics, setMetrics] = useState({
    notesCount: 12,
    formulasCount: 28,
    quizzesCount: 8,
    totalStudentsActive: 1420,
    aiDoubtsSolvedToday: 384,
  });

  const [notification, setNotification] = useState<string | null>(null);

  // New Note Form
  const [noteForm, setNoteForm] = useState({
    title: '',
    subjectId: 'physics' as SubjectId,
    classLevel: 'class_11' as ClassLevel,
    overview: '',
    sectionHeading: '',
    sectionBody: '',
    latexFormula: '',
    exampleProblem: '',
    exampleSolution: '',
  });

  // New Formula Form
  const [formulaForm, setFormulaForm] = useState({
    title: '',
    subjectId: 'physics' as SubjectId,
    classLevel: 'class_11' as ClassLevel,
    chapterName: 'Kinematics',
    category: 'Mechanics',
    latex: '',
    description: '',
    examTips: '',
  });

  // New Quiz Form
  const [quizForm, setQuizForm] = useState({
    title: '',
    subjectId: 'physics' as SubjectId,
    chapterName: 'Kinematics',
    questionText: '',
    latex: '',
    opt0: '',
    opt1: '',
    opt2: '',
    opt3: '',
    correctIndex: 0,
    explanation: '',
  });

  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.notesCount !== undefined) setMetrics(data);
      })
      .catch((err) => console.error('Failed to load admin metrics', err));
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const noteObj = {
        id: `note-${Date.now()}`,
        chapterId: 'ch-custom',
        topicId: 'topic-custom',
        title: noteForm.title,
        subjectId: noteForm.subjectId,
        classLevel: noteForm.classLevel,
        applicableExams: ['JEE', 'NEET'] as ('JEE' | 'NEET')[],
        overview: noteForm.overview,
        sections: [
          {
            heading: noteForm.sectionHeading || 'Key Concepts',
            body: noteForm.sectionBody,
            latexFormula: noteForm.latexFormula || undefined,
            exampleProblem: noteForm.exampleProblem
              ? {
                  problem: noteForm.exampleProblem,
                  solution: noteForm.exampleSolution,
                }
              : undefined,
          },
        ],
        summaryTakeaways: ['High-yield note uploaded by Faculty'],
        lastUpdated: new Date().toISOString(),
      };

      await saveNoteToFirestore(noteObj);

      fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteObj),
      }).catch(() => {});

      showToast(`✅ Note "${noteForm.title}" published to Firestore production database!`);
      setNoteForm({
        title: '',
        subjectId: 'physics',
        classLevel: 'class_11',
        overview: '',
        sectionHeading: '',
        sectionBody: '',
        latexFormula: '',
        exampleProblem: '',
        exampleSolution: '',
      });
      setMetrics((prev) => ({ ...prev, notesCount: prev.notesCount + 1 }));
    } catch (err) {
      showToast('❌ Failed to publish note.');
    }
  };

  const handleCreateFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formulaObj = {
        id: `form-${Date.now()}`,
        title: formulaForm.title,
        subjectId: formulaForm.subjectId,
        classLevel: formulaForm.classLevel,
        chapterId: 'ch-custom',
        chapterName: formulaForm.chapterName,
        category: formulaForm.category,
        latex: formulaForm.latex,
        description: formulaForm.description,
        examTips: formulaForm.examTips,
        variables: [{ symbol: 'F', meaning: 'Force', unit: 'N' }],
        applicableExams: ['JEE', 'NEET'] as ('JEE' | 'NEET')[],
      };

      await saveFormulaToFirestore(formulaObj);

      fetch('/api/admin/formulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulaObj),
      }).catch(() => {});

      showToast(`✅ Formula "${formulaForm.title}" added to Firestore Formula Bank!`);
      setFormulaForm({
        title: '',
        subjectId: 'physics',
        classLevel: 'class_11',
        chapterName: 'Kinematics',
        category: 'Mechanics',
        latex: '',
        description: '',
        examTips: '',
      });
      setMetrics((prev) => ({ ...prev, formulasCount: prev.formulasCount + 1 }));
    } catch (err) {
      showToast('❌ Failed to create formula.');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quizObj = {
        id: `quiz-${Date.now()}`,
        title: quizForm.title,
        subjectId: quizForm.subjectId,
        chapterId: 'ch-custom',
        chapterName: quizForm.chapterName,
        applicableExams: ['JEE', 'NEET'] as ('JEE' | 'NEET')[],
        timeLimitMins: 10,
        questions: [
          {
            id: `q-${Date.now()}`,
            questionText: quizForm.questionText,
            latex: quizForm.latex || undefined,
            options: [quizForm.opt0, quizForm.opt1, quizForm.opt2, quizForm.opt3],
            correctAnswerIndex: quizForm.correctIndex,
            explanation: quizForm.explanation,
            difficulty: 'Hard' as const,
            examTag: 'JEE Main' as const,
            subjectId: quizForm.subjectId,
            chapterId: 'ch-custom',
          },
        ],
      };

      await saveQuizToFirestore(quizObj);

      fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizObj),
      }).catch(() => {});

      showToast(`✅ Quiz "${quizForm.title}" saved to Firestore database!`);
      setQuizForm({
        title: '',
        subjectId: 'physics',
        chapterName: 'Kinematics',
        questionText: '',
        latex: '',
        opt0: '',
        opt1: '',
        opt2: '',
        opt3: '',
        correctIndex: 0,
        explanation: '',
      });
      setMetrics((prev) => ({ ...prev, quizzesCount: prev.quizzesCount + 1 }));
    } catch (err) {
      showToast('❌ Failed to create quiz.');
    }
  };

  return (
    <div className="py-6 max-w-6xl mx-auto space-y-6">
      
      {/* Toast notification */}
      {notification && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500 flex items-center gap-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/30">
            <Shield className="w-3.5 h-3.5 text-purple-400" /> Faculty & Content Management System
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Teacher / Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Publish high-yield notes, formula bank items, and custom exam quizzes directly to students.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'notes' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            + New Note
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'formulas' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            + New Formula
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'quizzes' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            + New Quiz
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold block mb-1">Active Students</span>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {metrics.totalStudentsActive.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-500 font-bold mt-1 block">↑ +18% this month</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold block mb-1">AI Doubts Solved</span>
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                {metrics.aiDoubtsSolvedToday}
              </p>
              <span className="text-[10px] text-purple-400 font-bold mt-1 block">Powered by Gemini 3.6</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold block mb-1">Published Notes</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {metrics.notesCount}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Across JEE & NEET</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold block mb-1">Formulas & Quizzes</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {metrics.formulasCount + metrics.quizzesCount}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Interactive Bank</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              Platform Content Management Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('notes')}
                className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-left transition-all flex flex-col justify-between h-32"
              >
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="text-sm font-extrabold">Publish Chapter Notes</p>
                  <p className="text-[10px] font-normal opacity-80 mt-1">Add rich theory, derivations & LaTeX examples</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('formulas')}
                className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-left transition-all flex flex-col justify-between h-32"
              >
                <Calculator className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-sm font-extrabold">Add Cheat-Sheet Formula</p>
                  <p className="text-[10px] font-normal opacity-80 mt-1">Upload formula, variables & exam tricks</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('quizzes')}
                className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-left transition-all flex flex-col justify-between h-32"
              >
                <HelpCircle className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="text-sm font-extrabold">Create Practice Quiz</p>
                  <p className="text-[10px] font-normal opacity-80 mt-1">Add MCQs with explanations & LaTeX math</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Note Tab */}
      {activeTab === 'notes' && (
        <form onSubmit={handleCreateNote} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-xs">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Publish New Chapter Study Note
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-bold mb-1">Note Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Wave Optics: Young's Double Slit Experiment & Interference"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Subject</label>
              <select
                value={noteForm.subjectId}
                onChange={(e) => setNoteForm({ ...noteForm, subjectId: e.target.value as SubjectId })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              >
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="mathematics">Mathematics</option>
                <option value="biology">Biology</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Overview Summary</label>
            <textarea
              rows={2}
              required
              placeholder="High-yield summary covering key principles, exam weightage, and shortcuts..."
              value={noteForm.overview}
              onChange={(e) => setNoteForm({ ...noteForm, overview: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Section Heading</label>
              <input
                type="text"
                placeholder="e.g. Fringe Width & Path Difference Derivation"
                value={noteForm.sectionHeading}
                onChange={(e) => setNoteForm({ ...noteForm, sectionHeading: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Key LaTeX Formula</label>
              <input
                type="text"
                placeholder="e.g. \beta = \frac{\lambda D}{d}"
                value={noteForm.latexFormula}
                onChange={(e) => setNoteForm({ ...noteForm, latexFormula: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Section Theory Content</label>
            <textarea
              rows={4}
              required
              placeholder="Detailed theory explanation..."
              value={noteForm.sectionBody}
              onChange={(e) => setNoteForm({ ...noteForm, sectionBody: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Example Problem</label>
              <textarea
                rows={2}
                placeholder="Sample JEE/NEET problem..."
                value={noteForm.exampleProblem}
                onChange={(e) => setNoteForm({ ...noteForm, exampleProblem: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Example Solution</label>
              <textarea
                rows={2}
                placeholder="Step-by-step solution..."
                value={noteForm.exampleSolution}
                onChange={(e) => setNoteForm({ ...noteForm, exampleSolution: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Publish Note
            </button>
          </div>
        </form>
      )}

      {/* New Formula Tab */}
      {activeTab === 'formulas' && (
        <form onSubmit={handleCreateFormula} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-xs">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" /> Add Formula to Cheat-Sheet Bank
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-bold mb-1">Formula Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Lens Maker's Formula"
                value={formulaForm.title}
                onChange={(e) => setFormulaForm({ ...formulaForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Subject</label>
              <select
                value={formulaForm.subjectId}
                onChange={(e) => setFormulaForm({ ...formulaForm, subjectId: e.target.value as SubjectId })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              >
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="mathematics">Mathematics</option>
                <option value="biology">Biology</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">LaTeX Formula String</label>
            <input
              type="text"
              required
              placeholder="e.g. \frac{1}{f} = (\mu - 1)\left(\frac{1}{R_1} - \frac{1}{R_2}\right)"
              value={formulaForm.latex}
              onChange={(e) => setFormulaForm({ ...formulaForm, latex: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Description / Meaning</label>
              <textarea
                rows={2}
                required
                placeholder="Explains focal length, refractive index, radii of curvature..."
                value={formulaForm.description}
                onChange={(e) => setFormulaForm({ ...formulaForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Exam Pro-Tip / Trap</label>
              <textarea
                rows={2}
                placeholder="Watch sign convention for concave vs convex lens surfaces!"
                value={formulaForm.examTips}
                onChange={(e) => setFormulaForm({ ...formulaForm, examTips: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Add Formula
            </button>
          </div>
        </form>
      )}

      {/* New Quiz Tab */}
      {activeTab === 'quizzes' && (
        <form onSubmit={handleCreateQuiz} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-xs">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600" /> Create Custom Practice Quiz
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-bold mb-1">Quiz Title</label>
              <input
                type="text"
                required
                placeholder="e.g. High-Yield Electrostatics & Capacitor Test"
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Subject</label>
              <select
                value={quizForm.subjectId}
                onChange={(e) => setQuizForm({ ...quizForm, subjectId: e.target.value as SubjectId })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              >
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="mathematics">Mathematics</option>
                <option value="biology">Biology</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Question 1 Text</label>
            <textarea
              rows={2}
              required
              placeholder="Enter question statement..."
              value={quizForm.questionText}
              onChange={(e) => setQuizForm({ ...quizForm, questionText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Option A</label>
              <input
                type="text"
                required
                value={quizForm.opt0}
                onChange={(e) => setQuizForm({ ...quizForm, opt0: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Option B</label>
              <input
                type="text"
                required
                value={quizForm.opt1}
                onChange={(e) => setQuizForm({ ...quizForm, opt1: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Option C</label>
              <input
                type="text"
                required
                value={quizForm.opt2}
                onChange={(e) => setQuizForm({ ...quizForm, opt2: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Option D</label>
              <input
                type="text"
                required
                value={quizForm.opt3}
                onChange={(e) => setQuizForm({ ...quizForm, opt3: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Correct Option Index</label>
              <select
                value={quizForm.correctIndex}
                onChange={(e) => setQuizForm({ ...quizForm, correctIndex: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none font-bold"
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Explanation</label>
              <input
                type="text"
                required
                placeholder="Detailed explanation for solution..."
                value={quizForm.explanation}
                onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Create Quiz
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
