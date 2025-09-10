import React, { useState, useEffect } from 'react';
import { Target, BookOpen, Heart, Zap, CheckCircle, Plus, Trash2, Bell, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs, query } from 'firebase/firestore';

function ProductivityMode() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isProductivityMode, setIsProductivityMode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'All', name: 'All', icon: Target, color: 'gray' },
    { id: 'Work', name: 'Work', icon: Target, color: 'indigo' },
    { id: 'Study', name: 'Study', icon: BookOpen, color: 'blue' },
    { id: 'Self-care', name: 'Self-care', icon: Heart, color: 'pink' },
    { id: 'Personal', name: 'Personal', icon: Zap, color: 'yellow' }
  ];

  // Load tasks from Firebase when user changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) {
        setTasks([]);
        setStreak(0);
        return;
      }
      setLoading(true);
      try {
        console.log('Loading tasks for user:', user.uid);
        const tasksCollectionRef = collection(db, 'users', user.uid, 'productivityMode');
        const tasksQuery = query(tasksCollectionRef);
        const querySnapshot = await getDocs(tasksQuery);
        const loadedTasks = [];
        querySnapshot.forEach((doc) => {
          loadedTasks.push({ id: doc.id, ...doc.data() });
        });
        setTasks(loadedTasks);
        console.log('Loaded tasks:', loadedTasks);

        // Load streak
        const streakRef = doc(db, 'users', user.uid, 'productivityMode', 'streak');
        const streakSnap = await getDoc(streakRef);
        if (streakSnap.exists()) {
          setStreak(streakSnap.data().value || 0);
        } else {
          setStreak(0);
        }
        console.log('Loaded streak:', streakSnap.exists() ? streakSnap.data().value : 0);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [user]);



  const addTask = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to add tasks.');
      return;
    }
    if (newTask.trim()) {
      setLoading(true);
      const taskCategory = selectedCategory === 'All' ? 'Work' : selectedCategory;
      const taskId = Date.now().toString();
      const task = {
        text: newTask.trim(),
        completed: false,
        category: taskCategory,
        dueDate: dueDate || null,
      };
      try {
        console.log('Adding task:', task, 'with ID:', taskId);
        const taskRef = doc(db, 'users', user.uid, 'productivityMode', taskId);
        await setDoc(taskRef, task);
        console.log('Task added to Firestore successfully');
        setTasks(prev => [...prev, { id: taskId, ...task }]);
        setNewTask('');
        setDueDate('');
      } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTask = async (taskId) => {
    console.log('toggleTask called with taskId:', taskId, 'user:', user);
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? updatedTask : task
    );
    setTasks(updatedTasks);

    // Update streak if all tasks are completed
    const allCompleted = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
    const newStreak = allCompleted ? streak + 1 : streak;
    if (allCompleted) setStreak(newStreak);

    // Update Firestore
    if (user) {
      try {
        console.log('Updating task in Firestore:', updatedTask);
        const taskRef = doc(db, 'users', user.uid, 'productivityMode', taskId);
        await updateDoc(taskRef, { completed: updatedTask.completed });
        console.log('Task updated in Firestore successfully');

        // Update streak if all completed
        if (allCompleted) {
          const streakRef = doc(db, 'users', user.uid, 'productivityMode', 'streak');
          await setDoc(streakRef, { value: newStreak });
          console.log('Streak updated in Firestore:', newStreak);
        }
      } catch (error) {
        console.error('Error updating task completion:', error);
        console.error('Error details:', error.message, error.code);
      }
    } else {
      console.log('No user authenticated, skipping Firestore update');
    }
  };

  const deleteTask = async (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);

    // Update Firestore
    if (user) {
      try {
        console.log('Deleting task from Firestore:', taskId);
        const taskRef = doc(db, 'users', user.uid, 'productivityMode', taskId);
        await deleteDoc(taskRef);
        console.log('Task deleted from Firestore successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Notification handler
  const handleNotifications = () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Stay focused! 🚀 Keep working on your tasks.");
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Notifications enabled! We'll remind you to stay focused.");
          }
        });
      }
    } else {
      alert("Your browser does not support notifications.");
    }
  };

  const getCategoryColor = (color) => {
    const map = {
      indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      pink: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30',
      yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
      gray: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30',
    };
    return map[color] || map.indigo;
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks based on selectedCategory
  const filteredTasks = selectedCategory === 'All' ? tasks : tasks.filter(task => task.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 font-sans">
              Productivity Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-sans">
              Stay focused and organized with your personal to-do list
            </p>
          </div>
          
          {/* Toggle */}
          <div className="flex items-center justify-center lg:justify-end">
            <label className="flex items-center cursor-pointer">
              <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">Productivity Mode</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isProductivityMode}
                  onChange={(e) => setIsProductivityMode(e.target.checked)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${
                  isProductivityMode ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 transform ${
                  isProductivityMode ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
              </div>
            </label>
          </div>
        </div>

        {/* Progress Bar */}
        {isProductivityMode && totalTasks > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
              {completedTasks} of {totalTasks} tasks completed
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            const categoryTasks = category.id === 'All' ? tasks : tasks.filter(task => task.category === category.id);
            const completedCategoryTasks = categoryTasks.filter(task => task.completed).length;

            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-2xl p-4 transition-all duration-300 border-2 cursor-pointer hover:shadow-md ${
                  isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <IconComponent className={`w-8 h-8 ${getCategoryColor(category.color)}`} />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{category.name}</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {completedCategoryTasks}/{categoryTasks.length} done
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Form */}
        {isProductivityMode && (
          <form onSubmit={addTask} className="mb-8 space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter a new task..."
                className="flex-1 px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-lg font-sans bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-sans flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {loading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        )}

        {/* Notifications */}
        {isProductivityMode && (
          <div className="text-center mb-8">
            <button
              onClick={handleNotifications}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-sans flex items-center gap-2 mx-auto"
            >
              <Bell className="w-5 h-5" />
              Enable Notifications
            </button>
          </div>
        )}

        {/* Tasks List */}
        {isProductivityMode && (
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-sans">No tasks in this category yet. Add your first task!</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const category = categories.find(cat => cat.id === task.category);
                const IconComponent = category ? category.icon : Target;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 ${
                      task.completed
                        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400 hover:shadow-md'
                    }`}
                  >
                    {/* Category Icon */}
                    <div className={`p-2 rounded-lg ${getCategoryColor(category?.color || 'gray')}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        task.completed
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-gray-300 dark:border-gray-500 hover:border-indigo-400 hover:scale-110'
                      }`}
                    >
                      {task.completed && <CheckCircle className="w-4 h-4" />}
                    </button>

                    {/* Task Text */}
                    <span
                      className={`flex-1 text-left transition-all duration-200 text-lg font-sans ${
                        task.completed
                          ? 'text-gray-500 dark:text-gray-400 line-through'
                          : 'text-gray-800 dark:text-white'
                      }`}
                    >
                      {task.text}
                      {task.dueDate && (
                        <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                          (Due: {task.dueDate})
                        </span>
                      )}
                    </span>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all duration-200 p-2 hover:scale-110 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Summary if Mode Off */}
        {!isProductivityMode && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Productivity Mode is Off</h3>
            <p className="text-lg font-sans">Toggle the switch to manage your tasks.</p>
            <p className="mt-4 text-indigo-500 dark:text-indigo-300 font-semibold">
              Last streak: {streak} day(s) of full completion 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductivityMode;
