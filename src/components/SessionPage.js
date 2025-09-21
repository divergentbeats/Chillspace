import React from 'react';
import { useNavigate } from 'react-router-dom';

const SessionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200 flex flex-col items-center p-8">
      <header className="w-full max-w-5xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-200 dark:bg-indigo-700 text-indigo-900 dark:text-indigo-100 px-6 py-3 rounded-xl shadow-md hover:bg-indigo-300 dark:hover:bg-indigo-600 transition"
        >
          Back to Home
        </button>
        <h1 className="text-4xl font-extrabold text-indigo-900 dark:text-indigo-200 text-center flex-grow">
          Have a session with us!
        </h1>
        <div className="w-28" /> {/* Spacer for alignment */}
      </header>
      <p className="max-w-5xl mb-8 text-center text-indigo-700 dark:text-indigo-300 text-lg">
        Connect with our wellness chatbot to explore your thoughts and feelings in a supportive space.
      </p>
      <div className="w-full max-w-5xl h-[720px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-indigo-300 dark:ring-indigo-700">
        <iframe
          src="https://www.chatbase.co/chatbot-iframe/e5BVyFgHnqUyNX2wsU7A3"
          width="100%"
          style={{ height: '100%', minHeight: '720px', border: 'none' }}
          title="Wellness Chatbot"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default SessionPage;
