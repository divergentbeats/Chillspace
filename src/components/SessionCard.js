import React, { useState } from 'react';

function SessionCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'avatar',
      title: 'Choose your avatar',
      options: ['Human', 'Animal', 'Abstract', 'Minimalist']
    },
    {
      id: 'voice',
      title: 'Choose the voice type',
      options: ['Warm & Friendly', 'Professional', 'Calm & Soothing', 'Energetic']
    },
    {
      id: 'communication',
      title: 'Do you want to proceed with voice or text?',
      options: ['Voice Only', 'Text Only', 'Both Voice & Text']
    },
    {
      id: 'chatbotType',
      title: 'What type of chatbot do you want?',
      options: ['Authentic', 'Personalized', 'Straightforward', 'Consultancy']
    }
  ];

  const handleOptionSelect = (option) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentStep].id]: option
    }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Session completed
      console.log('Session answers:', answers);
      setIsModalOpen(false);
      setCurrentStep(0);
      setAnswers({});
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStep(0);
    setAnswers({});
  };

  return (
    <>
      {/* Session Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:shadow-2xl"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 font-sans">
              Have a session with us!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-sans">
              Click to start your personalized wellness journey
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-600 text-white p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold font-sans">Session Setup</h3>
                <button 
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex space-x-2">
                  {questions.map((_, index) => (
                    <div 
                      key={index}
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        index <= currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="min-h-[200px] flex flex-col">
                {/* Question */}
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center font-sans">
                    {questions[currentStep].title}
                  </h4>
                  
                  {/* Options */}
                  <div className="space-y-3">
                    {questions[currentStep].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(option)}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                          answers[questions[currentStep].id] === option
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                      currentStep === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={nextStep}
                    disabled={!answers[questions[currentStep].id]}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                      !answers[questions[currentStep].id]
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
                    }`}
                  >
                    {currentStep === questions.length - 1 ? 'Start Session' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SessionCard;
