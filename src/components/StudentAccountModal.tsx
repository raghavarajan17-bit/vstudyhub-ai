import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Trophy, Flame, Target, Award, Check, X, 
  BookOpen, Sparkles, LogOut, Lock, LogIn, ExternalLink, Database, CheckCircle2
} from 'lucide-react';
import { StudentProfile, ExamType, ClassLevel } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, signInAnonymously } from '../lib/firebase';

interface StudentAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateProfile: (updatedProfile: Partial<StudentProfile>) => void;
}

export const StudentAccountModal: React.FC<StudentAccountModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    targetExam: profile.targetExam,
    classLevel: profile.classLevel,
    targetRankGoal: profile.targetRankGoal,
    targetCollege: profile.targetCollege,
    role: profile.role,
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        onUpdateProfile({
          name: res.user.displayName || profile.name,
          email: res.user.email || profile.email,
          avatarUrl: res.user.photoURL || profile.avatarUrl,
          isLoggedIn: true,
        });
      }
    } catch (err: any) {
      console.log('Google Sign In:', err?.message || err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    onUpdateProfile({ isLoggedIn: false });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...formData,
      isLoggedIn: true,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Info */}
        <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="relative">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={profile.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-md"
            />
            <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              Lvl {profile.level}
            </span>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {profile.name}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                profile.role === 'teacher' || profile.role === 'admin'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              }`}>
                {profile.role === 'admin' ? 'Platform Admin' : profile.role === 'teacher' ? 'Faculty / Teacher' : 'Student'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {profile.email}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
              <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1 border border-amber-200/50 dark:border-amber-800/50">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> {profile.xp} XP • {profile.levelTitle}
              </span>
              <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-xl font-bold border border-blue-200/50 dark:border-blue-800/50">
                Target: {profile.targetExam}
              </span>
            </div>
          </div>
        </div>

        {/* Production Firebase Auth & Database Connection Bar */}
        <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-white">
                  Firebase Production Database Active
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Firestore Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {firebaseUser ? `Auth UID: ${firebaseUser.uid.substring(0, 12)}...` : 'Connected via Secure Firebase Auth'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {firebaseUser && !firebaseUser.isAnonymous ? (
              <button
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In with Google
              </button>
            )}
          </div>
        </div>

        {/* Edit or Display Profile Form */}
        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-bold block mb-1">Target Exam & Goal</span>
                <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  {profile.targetExam} ({profile.classLevel === 'class_11' ? 'Class 11' : 'Class 12'})
                </p>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                  Goal: {profile.targetRankGoal}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-bold block mb-1">Target College / Institution</span>
                <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  {profile.targetCollege}
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  Role: {profile.role.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Badges preview */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Earned Badges ({profile.badges.filter(b => b.unlocked).length}/{profile.badges.length})</span>
                <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">View Gamification</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {profile.badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      b.unlocked
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                        : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      b.unlocked ? 'bg-amber-500 text-white shadow' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold leading-none">{b.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {b.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
              >
                Edit Profile & Preferences
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">
              Edit Account Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  Target Exam
                </label>
                <select
                  value={formData.targetExam}
                  onChange={(e) => setFormData({ ...formData, targetExam: e.target.value as ExamType })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                >
                  <option value="JEE">JEE (Main & Advanced)</option>
                  <option value="NEET">NEET Medical Entrance</option>
                  <option value="ALL">All Subjects (JEE + NEET)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  Class Level
                </label>
                <select
                  value={formData.classLevel}
                  onChange={(e) => setFormData({ ...formData, classLevel: e.target.value as ClassLevel })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                >
                  <option value="class_11">Class 11 Aspirant</option>
                  <option value="class_12">Class 12 / Dropper</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  Target Rank Goal
                </label>
                <input
                  type="text"
                  placeholder="e.g. AIR Under 500"
                  value={formData.targetRankGoal}
                  onChange={(e) => setFormData({ ...formData, targetRankGoal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  Dream College
                </label>
                <input
                  type="text"
                  placeholder="e.g. IIT Bombay / AIIMS New Delhi"
                  value={formData.targetCollege}
                  onChange={(e) => setFormData({ ...formData, targetCollege: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                Account Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              >
                <option value="student">Student Aspirant</option>
                <option value="teacher">Faculty / Teacher (Access Admin Panel)</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
