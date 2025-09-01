import React, { useState } from 'react';

function ProductivityMode() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
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
    // Placeholder for future notification functionality
    console.log('Notifications enabled!');
    alert('Notifications feature coming soon!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 font-sans">
            Productivity Mode
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-sans">
            Stay focused and organized with your personal to-do list
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={addTask} className="mb-10">
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

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-sans">No tasks yet. Add your first task above!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 ${
                  task.completed
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 dark:border-gray-500 hover:border-indigo-400 hover:scale-110'
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
                      ? 'text-gray-500 dark:text-gray-400 line-through'
                      : 'text-gray-800 dark:text-white'
                  }`}
                >
                  {task.text}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all duration-200 p-2 hover:scale-110 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Task Count */}
        {tasks.length > 0 && (
          <div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-600">
            <p className="text-gray-600 dark:text-gray-300 font-sans text-lg">
              {tasks.filter(task => task.completed).length} of {tasks.length} tasks completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductivityMode;
