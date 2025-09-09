import React from 'react';
import { Music, BookOpen, Heart, Brain, Calendar, Users, Shield, Zap } from 'lucide-react';

function ComingSoon() {
  const upcomingFeatures = [
    {
      id: 1,
      title: "Music Mode",
      description: "Curated playlists for focus, relaxation, and motivation",
      icon: Music,
      color: "purple",
      status: "Coming Soon"
    },
    {
      id: 2,
      title: "Journaling",
      description: "Reflect on your day with guided prompts and mood tracking",
      icon: BookOpen,
      color: "blue",
      status: "Coming Soon"
    },
    {
      id: 3,
      title: "Mood Tracker",
      description: "Monitor your emotional patterns and triggers over time",
      icon: Heart,
      color: "pink",
      status: "Coming Soon"
    },
   
    {
      id: 8,
      title: "Smart Insights",
      description: "AI-powered analytics and personalized recommendations",
      icon: Zap,
      color: "orange",
      status: "Coming Soon"
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      purple: 'from-purple-500 to-purple-600',
      blue: 'from-blue-500 to-blue-600',
      pink: 'from-pink-500 to-pink-600',
      indigo: 'from-indigo-500 to-indigo-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      gray: 'from-gray-500 to-gray-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return colorMap[color] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 font-sans">
          Coming Soon
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-sans">
          Exciting new features are in development to enhance your wellness journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {upcomingFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={feature.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-gray-100 dark:border-gray-700 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Semi-transparent overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-900/40 dark:from-gray-900/40 dark:to-gray-900/60 z-10 transition-opacity duration-300 group-hover:opacity-30"></div>
              
              {/* Content */}
              <div className="relative z-20 p-6 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getColorClasses(feature.color)} rounded-full flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 font-sans">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 font-sans leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {feature.status}
                  </span>
                </div>
              </div>
              
              {/* Locked indicator */}
              <div className="absolute top-4 right-4 z-30">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              
              {/* Hover effect line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${getColorClasses(feature.color)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </div>
          );
        })}
      </div>

      {/* Newsletter signup */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 font-sans">
            Stay Updated
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 font-sans">
            Be the first to know when these features launch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 font-sans bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-sans">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComingSoon;
