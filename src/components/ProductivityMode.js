import React, { useState } from 'react';
import { Target, BookOpen, Heart, Zap, CheckCircle, Plus, Trash2, Bell } from 'lucide-react';

function ProductivityMode() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Work');
  const [isProductivityMode, setIsProductivityMode] = useState(false);

  const categories = [
    { id: 'Work', name: 'Work', icon: Target, color: 'indigo', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', borderColor: 'border-indigo-200 dark:border-indigo-700' },
    { id: 'Study', name: 'Study', icon: BookOpen, color: 'blue', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-700' },
    { id: 'Self-care', name: 'Self-care', icon: Heart, color: 'pink', bgColor: 'bg-pink-50 dark:bg-pink-900/20', borderColor: 'border-pink-200 dark:border-pink-700' },
    { id: 'Personal', name: 'Personal', icon: Zap, color: 'yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-200 dark:border-yellow-700' }
  ];

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { 
        id: Date.now(), 
        text: newTask.trim(), 
        completed: false, 
        category: selectedCategory 
      }]);
      setNewTask('');
    }
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleNotifications = () => {
    console.log('Notifications enabled!');
    alert('Notifications feature coming soon!');
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : Target;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return 'indigo';
    
    const colorMap = {
      indigo: 'text-indigo-600 dark:text-indigo-400',
      blue: 'text-blue-600 dark:text-blue-400',
      pink: 'text-pink-600 dark:text-pink-400',
      yellow: 'text-yellow-600 dark:text-yellow-400'
    };
    return colorMap[category.color] || 'text-indigo-600 dark:text-indigo-400';
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        {/* Header with Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 font-sans">
              Productivity Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-sans">
              Stay focused and organized with your personal to-do list
            </p>
          </div>
          
          {/* Toggle Switch */}
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
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
              {completedTasks} of {totalTasks} tasks completed
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            const categoryTasks = tasks.filter(task => task.category === category.id);
            const completedCategoryTasks = categoryTasks.filter(task => task.completed).length;
            
            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${category.bgColor} ${category.borderColor} border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800' : ''
                }`}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <IconComponent className={`w-8 h-8 ${getCategoryColor(category.id)}`} />
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
          <form onSubmit={addTask} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter a new task..."
                className="flex-1 px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-lg font-sans bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-sans flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>
          </form>
        )}

        {/* Notifications Button */}
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
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-sans">No tasks yet. Add your first task above!</p>
              </div>
            ) : (
              tasks.map((task) => {
                const IconComponent = getCategoryIcon(task.category);
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
                    <div className={`p-2 rounded-lg ${getCategoryColor(task.category).replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')} bg-opacity-10 dark:bg-opacity-20`}>
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
                    </span>

                    {/* Category Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)} bg-opacity-10 dark:bg-opacity-20`}>
                      {task.category}
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

        {/* Inactive State */}
        {!isProductivityMode && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Productivity Mode is Off</h3>
            <p className="text-lg font-sans">Toggle the switch above to activate productivity mode and start managing your tasks!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductivityMode;
