import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Target, Calendar, BarChart3, ChevronDown, ChevronUp, Trophy, Flame, Zap, Heart, CheckCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

function TrackYourProgress() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState('7days');
  const [expandedSections, setExpandedSections] = useState({
    productivity: true,
    habits: true,
    mood: true
  });

  // Data states
  const [productivityData, setProductivityData] = useState({
    tasks: [],
    streak: 0,
    completionRate: 0
  });
  const [habitsData, setHabitsData] = useState({
    habits: [],
    streaks: {},
    completionRate: 0
  });
  const [moodData, setMoodData] = useState({
    entries: [],
    trend: [],
    distribution: [],
    mostCommonMood: ''
  });
  const [loading, setLoading] = useState(true);

  // Load all data on component mount
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, timeFilter]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProductivityData(),
        loadHabitsData(),
        loadMoodData()
      ]);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductivityData = async () => {
    try {
      // Load tasks
      const tasksCollectionRef = collection(db, 'users', user.uid, 'productivityMode');
      const tasksQuery = query(tasksCollectionRef);
      const querySnapshot = await getDocs(tasksQuery);
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      // Load streak
      const streakRef = doc(db, 'users', user.uid, 'productivityMode', 'streak');
      const streakSnap = await getDoc(streakRef);
      const streak = streakSnap.exists() ? streakSnap.data().value || 0 : 0;

      // Calculate completion rate
      const completedTasks = tasks.filter(task => task.completed).length;
      const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

      setProductivityData({
        tasks,
        streak,
        completionRate
      });
    } catch (error) {
      console.error('Error loading productivity data:', error);
    }
  };

  const loadHabitsData = async () => {
    try {
      const userHabitsRef = doc(db, 'habitTracker', user.uid);
      const userHabitsSnap = await getDoc(userHabitsRef);

      if (userHabitsSnap.exists()) {
        const data = userHabitsSnap.data();
        const habits = data.habits || [];
        const completedDays = data.completedDays || {};

        // Calculate streaks for each habit
        const streaks = {};
        habits.forEach(habit => {
          streaks[habit.id] = calculateHabitStreak(habit.id, completedDays);
        });

        // Calculate overall completion rate
        const totalDays = habits.length * getDaysInRange();
        let completedCount = 0;

        habits.forEach(habit => {
          Object.keys(completedDays).forEach(key => {
            if (key.startsWith(`${habit.id}-`) && completedDays[key]) {
              completedCount++;
            }
          });
        });

        const completionRate = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

        setHabitsData({
          habits,
          streaks,
          completionRate
        });
      }
    } catch (error) {
      console.error('Error loading habits data:', error);
    }
  };

  const loadMoodData = async () => {
    try {
      const moodEntriesRef = collection(db, 'users', user.uid, 'moodEntries');
      const days = timeFilter === '7days' ? 7 : timeFilter === '30days' ? 30 : 365;
      const moodQuery = query(moodEntriesRef, orderBy('timestamp', 'desc'), limit(days));
      const querySnapshot = await getDocs(moodQuery);

      const entries = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          ...data,
          date: data.timestamp?.toDate() || new Date()
        });
      });

      // Sort by date ascending for chart
      entries.sort((a, b) => a.date - b.date);

      // Prepare trend data for chart
      const trend = entries.map(entry => ({
        date: entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: entry.mood || 'Neutral',
        score: calculateMoodScore(entry.emotions || {})
      }));

      // Calculate mood distribution
      const moodCounts = {};
      entries.forEach(entry => {
        const mood = entry.mood?.split(' ')[0] || 'Neutral'; // Extract mood without emoji
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });

      const distribution = Object.entries(moodCounts).map(([mood, count]) => ({
        name: mood,
        value: count,
        percentage: Math.round((count / entries.length) * 100)
      }));

      // Find most common mood
      const mostCommonMood = distribution.length > 0 ? distribution.reduce((prev, current) => (prev.value > current.value) ? prev : current).name : '';

      setMoodData({
        entries,
        trend,
        distribution,
        mostCommonMood
      });
    } catch (error) {
      console.error('Error loading mood data:', error);
    }
  };

  const calculateHabitStreak = (habitId, completedDays) => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 28; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();
      const key = `${habitId}-${dateString}`;

      if (completedDays[key]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const calculateMoodScore = (emotions) => {
    // Convert emotions to a numerical score (0-4 scale)
    const positiveEmotions = (emotions.happiness || 0) + (emotions.calm || 0) + (emotions.energy || 0) + (emotions.motivation || 0);
    const negativeEmotions = (emotions.anxiety || 0) + (emotions.sadness || 0) + (emotions.stress || 0) + (emotions.fatigue || 0);

    const netScore = positiveEmotions - negativeEmotions;
    return Math.max(0, Math.min(4, Math.round(netScore / 25))); // Scale to 0-4
  };

  const getDaysInRange = () => {
    switch (timeFilter) {
      case '7days': return 7;
      case '30days': return 30;
      case 'all': return 365;
      default: return 7;
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getMotivationalMessage = (type, data) => {
    switch (type) {
      case 'productivity':
        if (data.completionRate >= 80) return "🔥 Amazing! You're crushing your goals!";
        if (data.completionRate >= 60) return "🚀 Great progress! Keep it up!";
        if (data.streak > 0) return "💪 Your streak is building!";
        return "🌱 Small steps matter. Start with one task!";
      case 'habits':
        const maxStreak = Math.max(...Object.values(data.streaks));
        if (maxStreak >= 21) return "🏆 Habit master! You're unstoppable!";
        if (maxStreak >= 7) return "🔥 Strong habits forming!";
        if (data.completionRate >= 70) return "💪 Consistency is key!";
        return "🌱 Every day counts. Build your habits!";
      case 'mood':
        if (data.entries.length === 0) return "🧠 Track your mood to understand yourself better!";
        const recentMoods = data.entries.slice(0, 3);
        const avgScore = recentMoods.reduce((sum, entry) => sum + calculateMoodScore(entry.emotions || {}), 0) / recentMoods.length;
        if (avgScore >= 3) return "😊 You're doing great! Keep nurturing your well-being!";
        if (avgScore >= 2) return "😐 Remember to take care of yourself!";
        return "💙 It's okay to have tough days. You're not alone!";
      default:
        return "🌟 Keep going!";
    }
  };

  const pieData = [
    { name: 'Completed', value: productivityData.completionRate, color: '#10B981' },
    { name: 'Remaining', value: 100 - productivityData.completionRate, color: '#E5E7EB' }
  ];

  const habitBarData = habitsData.habits.map(habit => ({
    name: habit.name,
    streak: habitsData.streaks[habit.id] || 0,
    icon: habit.icon
  }));

  const getMoodColor = (mood) => {
    const colors = {
      'Calm': '#10B981', // green
      'Motivated': '#3B82F6', // blue
      'Neutral': '#6B7280', // gray
      'Stressed': '#F59E0B', // orange
      'Anxious': '#EF4444', // red
      'Happy': '#8B5CF6', // purple
      'Sad': '#06B6D4', // cyan
      'Energetic': '#84CC16', // lime
      'Tired': '#F97316', // orange-red
      'Focused': '#6366F1' // indigo
    };
    return colors[mood] || '#6B7280'; // default to gray
  };

  if (loading) {
  return (
<div className="min-h-screen bg-gradient-to-br from-pastel-blue-50 via-white to-pastel-purple-50 dark:from-pastel-neutral-900 dark:via-pastel-neutral-800 dark:to-pastel-neutral-900 transition-colors duration-200 px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading your progress data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen bg-gradient-to-br from-pastel-blue-50 via-white to-pastel-purple-50 dark:from-pastel-neutral-900 dark:via-pastel-neutral-800 dark:to-pastel-neutral-900 transition-colors duration-200 px-4 sm:px-6 lg:px-8 mb-16">
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 font-sans flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                Track Your Progress
              </h2>
              <p className="text-indigo-100 text-lg font-sans">
                Monitor your productivity, habits, and mood trends
              </p>
            </div>

            {/* Time Filter */}
            <div className="mt-6 lg:mt-0">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-white/50"
              >
                <option value="7days" className="text-gray-900">Last 7 Days</option>
                <option value="30days" className="text-gray-900">Last 30 Days</option>
                <option value="all" className="text-gray-900">All Time</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Productivity Section */}
          <motion.div
            className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-sans flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-600" />
                Productivity Progress
              </h3>
              <button
                onClick={() => toggleSection('productivity')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {expandedSections.productivity ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {expandedSections.productivity && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Circular Progress Chart */}
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Task Completion</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="text-center mt-4">
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{productivityData.completionRate}%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Tasks Completed</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Flame className="w-5 h-5 text-orange-500" />
                          <span className="font-semibold text-gray-800 dark:text-white">Current Streak</span>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">{productivityData.streak} days</p>
                      </div>

                      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-gray-800 dark:text-white">Total Tasks</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{productivityData.tasks.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                    <p className="text-indigo-800 dark:text-indigo-200 font-medium">
                      {getMotivationalMessage('productivity', productivityData)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Habits Section */}
          <motion.div
            className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-sans flex items-center gap-3">
                <Calendar className="w-6 h-6 text-green-600" />
                Habit Tracker
              </h3>
              <button
                onClick={() => toggleSection('habits')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {expandedSections.habits ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {expandedSections.habits && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Habit Streaks</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={habitBarData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="streak" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Stats */}
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          <span className="font-semibold text-gray-800 dark:text-white">Best Streak</span>
                        </div>
                        <p className="text-3xl font-bold text-yellow-600">
                          {Math.max(...Object.values(habitsData.streaks), 0)} days
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold text-gray-800 dark:text-white">Completion Rate</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{habitsData.completionRate}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      {getMotivationalMessage('habits', habitsData)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mood Section */}
          <motion.div
            className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-sans flex items-center gap-3">
                <Heart className="w-6 h-6 text-purple-600" />
                Mood Trends
              </h3>
              <button
                onClick={() => toggleSection('mood')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {expandedSections.mood ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {expandedSections.mood && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Line Chart */}
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Mood Over Time</h4>
                      {moodData.trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={moodData.trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 4]} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#8B5CF6"
                              strokeWidth={3}
                              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No mood data yet</p>
                            <p className="text-sm">Start tracking your mood!</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Mood Distribution</h4>
                      {moodData.distribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={moodData.distribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percentage }) => `${name} ${percentage}%`}
                            >
                              {moodData.distribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getMoodColor(entry.name)} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No mood data yet</p>
                            <p className="text-sm">Complete quizzes to see distribution!</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Zap className="w-5 h-5 text-purple-500" />
                          <span className="font-semibold text-gray-800 dark:text-white">Entries Logged</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">{moodData.entries.length}</p>
                      </div>

                      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <TrendingUp className="w-5 h-5 text-indigo-500" />
                          <span className="font-semibold text-gray-800 dark:text-white">Average Mood</span>
                        </div>
                        <p className="text-3xl font-bold text-indigo-600">
                          {moodData.trend.length > 0
                            ? (moodData.trend.reduce((sum, entry) => sum + entry.score, 0) / moodData.trend.length).toFixed(1)
                            : 'N/A'
                          }
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Heart className="w-5 h-5 text-pink-500" />
                          <span className="font-semibold text-gray-800 dark:text-white">Most Common Mood</span>
                        </div>
                        <p className="text-3xl font-bold text-pink-600">{moodData.mostCommonMood || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <p className="text-purple-800 dark:text-purple-200 font-medium">
                      {getMotivationalMessage('mood', moodData)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default TrackYourProgress;
