import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const stepsData = [
  {
    title: 'Step 1: Choose your interests',
    options: [
      { id: 'interest1', label: 'Productivity' },
      { id: 'interest2', label: 'Health & Wellness' },
      { id: 'interest3', label: 'Learning' },
    ],
  },
  {
    title: 'Step 2: Choose your preferred features',
    options: [
      { id: 'feature1', label: 'Daily Reminders' },
      { id: 'feature2', label: 'Progress Tracking' },
      { id: 'feature3', label: 'Community Support' },
    ],
  },
  {
    title: 'Step 3: Choose your notification preferences',
    options: [
      { id: 'notif1', label: 'Email Notifications' },
      { id: 'notif2', label: 'Push Notifications' },
      { id: 'notif3', label: 'SMS Notifications' },
    ],
  },
];

const Preferences = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreferences = async () => {
      if (auth.currentUser) {
        // User logged in, fetch from Firestore
        const docRef = doc(db, 'userPreferences', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSelectedOptions(docSnap.data());
        }
      } else {
        // Guest user, fetch from localStorage
        const saved = localStorage.getItem('guestPreferences');
        if (saved) {
          setSelectedOptions(JSON.parse(saved));
        }
      }
    };
    fetchPreferences();
  }, []);

  useEffect(() => {
    const savePreferences = async () => {
      if (auth.currentUser) {
        // User logged in, save to Firestore
        const docRef = doc(db, 'userPreferences', auth.currentUser.uid);
        await setDoc(docRef, selectedOptions);
      } else {
        // Guest user, save to localStorage
        localStorage.setItem('guestPreferences', JSON.stringify(selectedOptions));
      }
    };
    savePreferences();
  }, [selectedOptions]);

  const toggleOption = (optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  const nextStep = () => {
    if (currentStep < stepsData.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step: redirect to home page
      navigate('/');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{stepsData[currentStep].title}</h2>
        <div className="space-y-3 mb-6">
          {stepsData[currentStep].options.map((option) => (
            <label
              key={option.id}
              className="flex items-center space-x-3 cursor-pointer text-gray-800 dark:text-gray-300"
            >
              <input
                type="checkbox"
                checked={!!selectedOptions[option.id]}
                onChange={() => toggleOption(option.id)}
                className="form-checkbox h-5 w-5 text-pastel-blue-500 rounded"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentStep === 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-pastel-blue-500 text-white hover:bg-pastel-blue-600'
            } transition-colors duration-200`}
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="px-4 py-2 rounded-md bg-pastel-purple-600 text-white text-sm font-medium hover:bg-pastel-purple-700 transition-colors duration-200"
          >
            {currentStep === stepsData.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

