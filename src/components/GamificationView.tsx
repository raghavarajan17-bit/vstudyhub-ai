import React, { useState, useEffect } from 'react';
import { 
  Trophy, Flame, Award, Sparkles, CheckCircle2, Lock, Star, 
  Crown, TrendingUp, Zap, Medal, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { StudentProfile, AchievementBadge } from '../types';
import { subscribeToLeaderboard } from '../lib/firestoreSync';

interface GamificationViewProps {
  profile: StudentProfile;
  streakDays: number;
}

export const GamificationView: React.FC<GamificationViewProps> = ({
  profile,
  streakDays,
}) => {
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState<string>('all');
  const [firestoreLeaderboard, setFirestoreLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const unsub = subscribeToLeaderboard((entries) => {
      if (entries && entries.length > 0) {
        setFirestoreLeaderboard(entries);
      }
    });
    return () => unsub();
  }, []);

  // Next level XP threshold math
  const currentXp = profile.xp;
  const currentLevel = profile.level;
  const nextLevelXp = currentLevel * 500;
  const currentLevelBaseXp = (currentLevel - 1) * 500;
  const levelProgressPercentage = Math.min(
    100,
    Math.max(0, Math.round(((currentXp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100))
  );

  const filteredBadges = selectedBadgeCategory === 'all'
    ? profile.badges
    : profile.badges.filter((b) => b.category === selectedBadgeCategory);

  // Combine top toppers with current user and firestore entries
  const defaultToppers = [
    { rank: 1, name: 'Ananya Roy', exam: 'JEE Adv', college: 'IIT Bombay CS', xp: 2450, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', isUser: false },
    { rank: 2, name: 'Rohan Verma', exam: 'NEET', college: 'AIIMS New Delhi', xp: 2210, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', isUser: false },
    { rank: 3, name: 'Siddharth Patel', exam: 'JEE Adv', college: 'IIT Delhi Electrical', xp: 1980, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', isUser: false },
    { rank: 4, name: `${profile.name} (You)`, exam: profile.targetExam, college: profile.targetCollege, xp: profile.xp, avatar: profile.avatarUrl, isUser: true },
    { rank: 5, name: 'Kavya Nair', exam: 'NEET', college: 'JIPMER Puducherry', xp: 1620, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', isUser: false },
  ];

  const leaderboardData = firestoreLeaderboard.length > 0
    ? firestoreLeaderboard.map((item, index) => ({
        rank: index + 1,
        name: item.name || 'Aspirant',
        exam: item.exam || 'JEE/NEET',
        college: item.college || 'IIT/AIIMS Goal',
        xp: item.xp || 100,
        avatar: item.avatar || profile.avatarUrl,
        isUser: item.name === profile.name || item.userId === profile.email,
      }))
    : defaultToppers;

  const streakMilestones = [
    { day: 1, xpReward: 50, claimable: streakDays >= 1 },
    { day: 2, xpReward: 75, claimable: streakDays >= 2 },
    { day: 3, xpReward: 100, claimable: streakDays >= 3 },
    { day: 4, xpReward: 150, claimable: streakDays >= 4 },
    { day: 5, xpReward: 200, claimable: streakDays >= 5 },
    { day: 6, xpReward: 250, claimable: streakDays >= 6 },
    { day: 7, xpReward: 500, claimable: streakDays >= 7 },
  ];

  return (
    <div className="py-6 max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Gamified Learning Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Level {profile.level}: {profile.levelTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Earn XP points by completing daily study goals, solving notes, bookmarking formulas & acing practice quizzes.
          </p>
        </div>

        {/* Level XP Bar */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 w-full md:w-80 shrink-0 space-y-2 relative z-10">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-amber-300 flex items-center gap-1">
              <Zap className="w-4 h-4 fill-amber-300" /> {currentXp} XP
            </span>
            <span className="text-slate-300">Next Level: {nextLevelXp} XP</span>
          </div>

          <div className="w-full bg-slate-950/50 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${levelProgressPercentage}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-300 text-right font-medium">
            {nextLevelXp - currentXp} XP needed for Level {currentLevel + 1}
          </p>
        </div>
      </div>

      {/* Daily Streak Rewards Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
              <Flame className="w-6 h-6 fill-orange-500" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {streakDays}-Day Continuous Streak!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log in every day to claim bonus XP rewards and keep your study momentum burning.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
          {streakMilestones.map((m) => (
            <div
              key={m.day}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                m.claimable
                  ? 'bg-gradient-to-b from-amber-500/10 to-orange-500/10 border-orange-500/40 text-orange-900 dark:text-orange-200 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Day {m.day}</p>
              <p className="text-sm font-black mt-1 flex items-center justify-center gap-0.5 text-orange-600 dark:text-orange-400">
                +{m.xpReward} <Zap className="w-3 h-3 fill-orange-500" />
              </p>
              <div className="mt-2 flex justify-center">
                {m.claimable ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges & Leaderboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Badges Grid (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Achievement Badges
            </h3>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1 text-xs">
              {['all', 'streak', 'quiz', 'formula', 'ai', 'level'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedBadgeCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl font-bold capitalize transition-all ${
                    selectedBadgeCategory === cat
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  badge.unlocked
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  badge.unlocked ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}>
                  <Award className="w-6 h-6" />
                </div>

                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-sm leading-tight text-slate-900 dark:text-white">
                      {badge.title}
                    </p>
                    {badge.unlocked ? (
                      <span className="text-[10px] font-bold bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All India Leaderboard Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" /> All-India Leaderboard
            </h3>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-full">
              Live Ranking
            </span>
          </div>

          <div className="space-y-2.5">
            {leaderboardData.map((item) => (
              <div
                key={item.rank}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                  item.isUser
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/40 ring-2 ring-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                    item.rank === 1 ? 'bg-amber-400 text-amber-950' : item.rank === 2 ? 'bg-slate-300 text-slate-900' : item.rank === 3 ? 'bg-amber-700 text-white' : 'text-slate-500'
                  }`}>
                    #{item.rank}
                  </span>

                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-9 h-9 rounded-xl object-cover shrink-0"
                  />

                  <div className="min-w-0">
                    <p className={`font-extrabold truncate ${item.isUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {item.college}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center justify-end gap-0.5">
                    {item.xp} <Zap className="w-3 h-3 fill-amber-400" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
