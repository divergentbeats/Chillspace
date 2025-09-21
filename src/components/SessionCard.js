import React from 'react';
import { useNavigate } from 'react-router-dom';

const SessionCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Use window.location.href for full page reload to ensure Netlify routing works
    window.location.href = '/sessionPage';
  };

  return (
    <div
      onClick={handleClick}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl shadow-xl transition-all duration-300 transform hover:scale-105 border border-blue-200 dark:border-indigo-800 overflow-hidden max-w-4xl mx-auto my-12 cursor-pointer"
      style={{ minWidth: '400px', minHeight: '320px' }}
    >
      <div className="p-10 text-center">
        <h1 className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-6 font-sans">
          Have a session with us!
        </h1>
        <p className="text-indigo-600 dark:text-indigo-400 font-sans text-xl mb-2">
          Click to start your personalized wellness journey
        </p>
        <button
          className="mt-6 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition"
          aria-label="Start session"
        >
          Start Now
        </button>
      </div>
    </div>
  );
};

export default SessionCard;
