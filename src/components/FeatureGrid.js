import React from 'react';
import { useNavigate } from 'react-router-dom';

function FeatureGrid() {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: "Venting Venue",
      description: "Express yourself freely",
      buttonText: "Start Venting",
      icon: "💭"
    },
    {
      id: 2,
      title: "Let's Meditate!",
      description: "Find your inner peace",
      buttonText: "Begin Meditation",
      icon: "🧘‍♀️"
    },
    {
      id: 3,
      title: "Connect with Similar Fellows",
      description: "Join your community",
      buttonText: "Connect Now",
      icon: "🤝"
    },
    {
      id: 4,
      title: "Support the Youth",
      description: "Help others grow",
      buttonText: "Get Involved",
      icon: "🌟"
    },
    {
      id: 5,
      title: "Analyze Your Mood",
      description: "Track your emotions",
      buttonText: "Check Mood",
      icon: "📊"
    },
    {
      id: 6,
      title: "Track Your Progress",
      description: "Monitor your journey",
      buttonText: "View Progress",
      icon: "📈"
    }
  ];

  const handleCardClick = (featureId) => {
    if (featureId === 1) {
      navigate('/vent');
    } else if (featureId === 2) {
      navigate('/meditate');
    } else if (featureId === 3) {
      navigate('/community-connect');
    } else if (featureId === 4) {
      navigate('/support-youth');
    } else if (featureId === 5) {
      navigate('/mood-analyzer');
    } else if (featureId === 6) {
      navigate('/track-your-progress');
    } else {
      // Placeholder for other features
      console.log(`Navigating to ${featureId}`);
    }
  };

  return (
    <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 font-sans">
          Explore Our Features
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-sans">
          Discover tools and resources designed to support your mental wellness journey
        </p>
      </div>

      {/* Main Dashboard Grid - 3 key features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {features.slice(3, 6).map((feature) => (
          <div
            key={feature.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="text-5xl mb-6 text-center">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center font-sans">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 text-center mb-8 text-lg font-sans">
                {feature.description}
              </p>

              {/* Button */}
              <div className="text-center">
                <button
                  onClick={() => handleCardClick(feature.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 w-full transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {feature.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Grid - Other features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.slice(0, 3).map((feature) => (
          <div
            key={feature.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              {/* Icon */}
              <div className="text-4xl mb-4 text-center">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 text-center font-sans">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6 font-sans">
                {feature.description}
              </p>

              {/* Button */}
              <div className="text-center">
                <button
                  onClick={() => handleCardClick(feature.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 w-full transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {feature.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureGrid;
