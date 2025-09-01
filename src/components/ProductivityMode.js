import React, { useState, useEffect } from 'react';

function ProductivityMode() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Work');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [streak, setStreak] = useState(0);

  const categories = [
    { id: 'Work', name: 'Work', color: 'indigo', icon: '💼' },
    { id: 'Study', name: 'Study', color: 'blue', icon: '📚' },
    { id: 'Self-care', name: 'Self-care', color: 'green', icon: '🧘‍♀️' }
  ];

  // Initialize collapsed state for each category
  useEffect(() => {
    const initialCollapsed = {};
    categories.forEach(cat => {
      initialCollapsed[cat.id] = false;
    });
    setCollapsedCategories(initialCollapsed);
  }, []);

  // Calculate streak based on completed tasks
  useEffect(() => {
    const today = new Date().toDateString();
    const completedToday = tasks.filter(task => 
      task.completed && task.completedAt === today
    ).length;
    
    if (completedToday > 0) {
      setStreak(prev => Math.max(prev, 1));
    }
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      const newTaskObj = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        category: selectedCategory,
        createdAt: new Date().toDateString()
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask('');
    }
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toDateString() : null
        };
      }
      return task;
    }));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const toggleCategory = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleNotifications = () => {
    console.log('Notifications enabled!');
    alert('Notifications feature coming soon!');
  };

  // Calculate progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks by category
  const groupedTasks = categories.map(category => ({
    ...category,
    tasks: tasks.filter(task => task.category === category.id)
  }));

  const getCategoryColor = (color) => {
    const colorMap = {
      indigo: 'bg-indigo-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const getCategoryBorderColor = (color) => {
    const colorMap = {
      indigo: 'border-indigo-200',
      blue: 'border-blue-200',
      green: 'border-green-200'
    };
    return colorMap[color] || 'border-gray-200';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3 font-sans">
            Productivity Mode
          </h2>
          <p className="text-gray-600 text-lg font-sans">
            Stay focused and organized with your personal to-do list
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-700 font-sans">Overall Progress</span>
            <span className="text-lg font-semibold text-indigo-600 font-sans">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-gray-600 font-sans">
            {completedTasks} of {totalTasks} tasks completed
          </div>
        </div>

        {/* Streak Counter */}
        <div className="text-center mb-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
          <div className="text-2xl mb-2">🔥</div>
          <div className="text-lg font-semibold text-gray-800 font-sans">
            {streak} day{streak !== 1 ? 's' : ''} of consistent productivity!
          </div>
          <div className="text-sm text-gray-600 font-sans">
            Keep up the great work!
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={addTask} className="mb-10">
          <div className="flex gap-4 mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-lg font-sans bg-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter a new task..."
              className="flex-1 px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-lg font-sans"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-sans"
            >
              Add Task
            </button>
          </div>
        </form>

        {/* Notifications Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleNotifications}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-sans"
          >
            Enable Notifications
          </button>
        </div>

        {/* Tasks by Category */}
        <div className="space-y-6">
          {groupedTasks.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full p-4 flex items-center justify-between bg-gradient-to-r from-${category.color}-50 to-${category.color}-100 hover:from-${category.color}-100 hover:to-${category.color}-200 transition-all duration-200`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-lg font-semibold text-gray-800 font-sans">
                    {category.name}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getCategoryColor(category.color)}`}>
                    {category.tasks.length}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-600 transform transition-transform duration-200 ${
                    collapsedCategories[category.id] ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Category Tasks */}
              {!collapsedCategories[category.id] && (
                <div className="p-4 bg-white">
                  {category.tasks.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p className="font-sans">No tasks in this category yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {category.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                            task.completed
                              ? 'bg-gray-50 border-gray-200'
                              : `bg-white ${getCategoryBorderColor(category.color)} hover:border-${category.color}-300 hover:shadow-md`
                          }`}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              task.completed
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-gray-300 hover:border-indigo-400 hover:scale-110'
                            }`}
                          >
                            {task.completed && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>

                          {/* Task Text */}
                          <span
                            className={`flex-1 text-left transition-all duration-200 text-lg font-sans ${
                              task.completed
                                ? 'text-gray-500 line-through'
                                : 'text-gray-800'
                            }`}
                          >
                            {task.text}
                          </span>

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500 transition-all duration-200 p-2 hover:scale-110 rounded-full hover:bg-red-50"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductivityMode;
