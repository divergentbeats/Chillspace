import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

function HabitTracker() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([
    { id: 1, name: 'Drink Water', icon: '💧', color: 'blue' },
    { id: 2, name: 'Exercise', icon: '🏃‍♀️', color: 'green' },
    { id: 3, name: 'Journal', icon: '✍️', color: 'purple' },
    { id: 4, name: 'Meditate', icon: '🧘‍♀️', color: 'indigo' }
  ]);
  const [newHabit, setNewHabit] = useState('');
  const [completedDays, setCompletedDays] = useState({});
  const [currentWeek, setCurrentWeek] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Generate dates for the current week (7 days)
  const getWeekDates = (weekOffset) => {
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);

  // Load habits and completed days from Firebase when user changes
  useEffect(() => {
    const loadHabitData = async () => {
      if (!user) {
        setHabits([
          { id: 1, name: 'Drink Water', icon: '💧', color: 'blue' },
          { id: 2, name: 'Exercise', icon: '🏃‍♀️', color: 'green' },
          { id: 3, name: 'Journal', icon: '✍️', color: 'purple' },
          { id: 4, name: 'Meditate', icon: '🧘‍♀️', color: 'indigo' }
        ]);
        setCompletedDays({});
        return;
      }
      setLoading(true);
      try {
        const userHabitsRef = doc(db, 'habitTracker', user.uid);
        const userHabitsSnap = await getDoc(userHabitsRef);
        if (userHabitsSnap.exists()) {
          const data = userHabitsSnap.data();
          setHabits(data.habits || [
            { id: 1, name: 'Drink Water', icon: '💧', color: 'blue' },
            { id: 2, name: 'Exercise', icon: '🏃‍♀️', color: 'green' },
            { id: 3, name: 'Journal', icon: '✍️', color: 'purple' },
            { id: 4, name: 'Meditate', icon: '🧘‍♀️', color: 'indigo' }
          ]);
          setCompletedDays(data.completedDays || {});
        } else {
          setHabits([
            { id: 1, name: 'Drink Water', icon: '💧', color: 'blue' },
            { id: 2, name: 'Exercise', icon: '🏃‍♀️', color: 'green' },
            { id: 3, name: 'Journal', icon: '✍️', color: 'purple' },
            { id: 4, name: 'Meditate', icon: '🧘‍♀️', color: 'indigo' }
          ]);
          setCompletedDays({});
        }
      } catch (error) {
        console.error('Error loading habit data:', error);
        setHabits([
          { id: 1, name: 'Drink Water', icon: '💧', color: 'blue' },
          { id: 2, name: 'Exercise', icon: '🏃‍♀️', color: 'green' },
          { id: 3, name: 'Journal', icon: '✍️', color: 'purple' },
          { id: 4, name: 'Meditate', icon: '🧘‍♀️', color: 'indigo' }
        ]);
        setCompletedDays({});
      } finally {
        setLoading(false);
      }
    };
    loadHabitData();
  }, [user]);

  // Save habits and completed days to Firebase whenever they change (with debouncing)
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!user || loading) return;
      setSaving(true);
      try {
        const userHabitsRef = doc(db, 'habitTracker', user.uid);
        await setDoc(userHabitsRef, {
          habits: habits,
          completedDays: completedDays,
          lastUpdated: new Date()
        }, { merge: true });
      } catch (error) {
        console.error('Error saving habit data:', error);
      } finally {
        setSaving(false);
      }
    }, 1000); // Debounce for 1 second

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [habits, completedDays, user, loading]);

  const addHabit = async (e) => {
    e.preventDefault();
    if (newHabit.trim()) {
      const habitIcons = ['💧', '🏃‍♀️', '✍️', '🧘‍♀️', '📚', '🎯', '🌱', '💪'];
      const habitColors = ['blue', 'green', 'purple', 'indigo', 'pink', 'orange', 'teal', 'red'];

      const newHabitObj = {
        id: Date.now(),
        name: newHabit.trim(),
        icon: habitIcons[Math.floor(Math.random() * habitIcons.length)],
        color: habitColors[Math.floor(Math.random() * habitColors.length)]
      };

      const updatedHabits = [...habits, newHabitObj];
      setHabits(updatedHabits);
      setNewHabit('');

      // Update Firestore
      if (user) {
        try {
          const userHabitsRef = doc(db, 'habitTracker', user.uid);
          await setDoc(userHabitsRef, {
            habits: updatedHabits,
            completedDays: completedDays,
            lastUpdated: new Date()
          }, { merge: true });
        } catch (error) {
          console.error('Error adding habit:', error);
        }
      }
    }
  };

  const deleteHabit = async (habitId) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    setHabits(updatedHabits);
    // Remove completed days for this habit
    const newCompletedDays = { ...completedDays };
    Object.keys(newCompletedDays).forEach(key => {
      if (key.startsWith(`${habitId}-`)) {
        delete newCompletedDays[key];
      }
    });
    setCompletedDays(newCompletedDays);

    // Update Firestore
    if (user) {
      try {
        const userHabitsRef = doc(db, 'habitTracker', user.uid);
        await setDoc(userHabitsRef, {
          habits: updatedHabits,
          completedDays: newCompletedDays,
          lastUpdated: new Date()
        }, { merge: true });
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  const toggleHabitDay = async (habitId, dateString) => {
    console.log('toggleHabitDay called with habitId:', habitId, 'dateString:', dateString, 'user:', user);
    const key = `${habitId}-${dateString}`;
    const updatedCompletedDays = {
      ...completedDays,
      [key]: !completedDays[key]
    };
    setCompletedDays(updatedCompletedDays);

    // Update Firestore
    if (user) {
      try {
        const userHabitsRef = doc(db, 'habitTracker', user.uid);
        console.log('Updating Firestore with habits:', habits, 'completedDays:', updatedCompletedDays);
        console.log('Firestore reference:', userHabitsRef.path);
        await setDoc(userHabitsRef, {
          habits: habits,
          completedDays: updatedCompletedDays,
          lastUpdated: new Date()
        }, { merge: true });
        console.log('Firestore update successful');
      } catch (error) {
        console.error('Error toggling habit day:', error);
        console.error('Error details:', error.message, error.code);
      }
    } else {
      console.log('No user authenticated, skipping Firestore update');
    }
  };

  const getHabitStreak = (habitId) => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight

    // Check up to 365 days back
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();
      const key = `${habitId}-${dateString}`;

      if (completedDays[key]) {
        streak++;
      } else if (i === 0) {
        // If today is not completed, check if yesterday was completed to maintain streak
        continue;
      } else {
        // Break streak if a day is missed (excluding today if it's just not done yet)
        break;
      }
    }
    return streak;
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-500 border-blue-200',
      green: 'bg-green-500 border-green-200',
      purple: 'bg-purple-500 border-purple-200',
      indigo: 'bg-indigo-500 border-indigo-200',
      pink: 'bg-pink-500 border-pink-200',
      orange: 'bg-orange-500 border-orange-200',
      teal: 'bg-teal-500 border-teal-200',
      red: 'bg-red-500 border-red-200'
    };
    return colorMap[color] || 'bg-gray-500 border-gray-200';
  };

  const getBorderColor = (color) => {
    const colorMap = {
      blue: 'border-blue-300',
      green: 'border-green-300',
      purple: 'border-purple-300',
      indigo: 'border-indigo-300',
      pink: 'border-pink-300',
      orange: 'border-orange-300',
      teal: 'border-teal-300',
      red: 'border-red-300'
    };
    return colorMap[color] || 'border-gray-300';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 font-sans">
            Habit Tracker
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-sans">
            Build consistent habits and track your daily progress
          </p>
        </div>

        {/* Add Habit Form */}
        <form onSubmit={addHabit} className="mb-8">
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Add a new habit..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-lg font-sans bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-sans"
            >
              Add
            </button>
          </div>
        </form>

        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentWeek(prev => Math.max(0, prev - 1))}
            disabled={currentWeek === 0}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${currentWeek === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            ← Previous Week
          </button>
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 font-sans">
            Week {currentWeek + 1}
          </span>
          <button
            onClick={() => setCurrentWeek(prev => prev + 1)}
            className="px-4 py-2 rounded-full font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Next Week →
          </button>
        </div>

        {/* Habits Grid */}
        <div className="space-y-6">
          {habits.map((habit) => (
            <div key={habit.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-white dark:bg-gray-700">
              {/* Habit Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-white font-sans">
                    {habit.name}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getColorClasses(habit.color)}`}>
                    {getHabitStreak(habit.id)} day streak
                  </span>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all duration-200 p-2 hover:scale-110 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Days Grid */}
              <div className="overflow-x-auto scroll-smooth pb-2">
                <div className="grid grid-cols-7 gap-2 min-w-max">
                  {/* Day Headers */}
                  {weekDates.map((date, index) => (
                    <div key={index} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 font-sans">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      <br />
                      {date.getDate()}
                    </div>
                  ))}

                  {/* Habit Checkboxes */}
                  {weekDates.map((date, index) => {
                    const dateString = date.toDateString();
                    const key = `${habit.id}-${dateString}`;
                    const isCompleted = completedDays[key];
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <button
                        key={index}
                        onClick={() => toggleHabitDay(habit.id, dateString)}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${isCompleted
                          ? `${getColorClasses(habit.color)} text-white`
                          : `border-gray-300 dark:border-gray-500 hover:${getBorderColor(habit.color)} hover:scale-110 ${isToday ? 'ring-2 ring-indigo-300 dark:ring-indigo-400' : ''}`
                          }`}
                      >
                        {isCompleted && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {habits.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-sans">No habits yet. Add your first habit above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HabitTracker;
