import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

let genAI;
let model;

if (!apiKey) {
  genAI = null;
  model = null;
} else {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

function MoodAnalyzer() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({
    stress: '',
    calmness: '',
    energy: '',
    sleep: ''
  });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [voiceResult, setVoiceResult] = useState(null);
  const recognitionRef = useRef(null);

  // Quiz states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [moodQuizAnswers, setMoodQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const questions = [
    {
      id: 'stress',
      question: 'How stressed do you feel today?',
      options: ['Not at all', 'A little', 'Moderately', 'Very']
    },
    {
      id: 'calmness',
      question: 'How calm do you feel today?',
      options: ['Not at all', 'A little', 'Moderately', 'Very']
    },
    {
      id: 'energy',
      question: 'How is your energy level?',
      options: ['Low', 'Moderate', 'High', 'Very high']
    },
    {
      id: 'sleep',
      question: 'How well did you sleep last night?',
      options: ['Poorly', 'Fair', 'Good', 'Excellent']
    }
  ];

  const moodQuizQuestions = [
    {
      id: 'feeling',
      question: 'How are you feeling right now?',
      options: ['Very happy 😊', 'Happy 😄', 'Neutral 😐', 'Sad 😢', 'Very sad 😭']
    },
    {
      id: 'motivation',
      question: 'Do you feel motivated to do tasks today?',
      options: ['Very motivated 🚀', 'Somewhat motivated', 'Neutral', 'Not very motivated', 'Not motivated at all 😴']
    },
    {
      id: 'anxiety',
      question: 'Are you anxious about something specific?',
      options: ['Not at all 😌', 'A little', 'Moderately', 'Very anxious 😰', 'Extremely anxious 😱']
    },
    {
      id: 'energy',
      question: 'How is your energy level?',
      options: ['Very energetic ⚡', 'Energetic', 'Neutral', 'Low energy', 'Very low energy 😴']
    },
    {
      id: 'outlook',
      question: 'What is your outlook on the day ahead?',
      options: ['Very positive 🌟', 'Positive', 'Neutral', 'Negative', 'Very negative ☁️']
    }
  ];

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        // Adjusted to use 'moodLogs' collection as per Firestore rules
        const moodEntriesRef = collection(db, 'users', user.uid, 'moodLogs');
        const q = query(moodEntriesRef, orderBy('timestamp', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const entries = [];
        querySnapshot.forEach(doc => {
          entries.push({ id: doc.id, ...doc.data() });
        });
        setHistory(entries);
      } catch (err) {
        console.error('Error fetching mood history:', err);
      }
    };
    fetchHistory();
  }, [user]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscribedText(finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setError('Speech recognition failed. Please try again.');
      };
    } else {
      console.warn('Speech Recognition not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleQuizChange = (id, value) => {
    setQuizAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey) {
      setError('Gemini API key not configured. Please set it in your .env file.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const result = await model.generateContent([
        `Analyze the user's mood based on this text: "${text}". Provide a mood assessment with a mood label (e.g., Happy, Sad, Anxious, Calm), confidence score (0-1), and emotion scores as a JSON object with keys like happiness, anxiety, calm, energy, motivation. Return in JSON format: {"mood": "string", "confidence": 0.85, "emotions": {"happiness": 70, "anxiety": 20, "calm": 80, "energy": 60, "motivation": 50}}`
      ]);
      const response = await result.response;
      const textResponse = response.text();
      let parsed;
      try {
        parsed = JSON.parse(textResponse);
      } catch {
        parsed = { mood: 'Neutral', confidence: 0.5, emotions: {} };
      }
      setResult(parsed);

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'moodLogs'), {
          mood: parsed.mood,
          confidence: parsed.confidence,
          emotions: parsed.emotions,
          text: text,
          timestamp: serverTimestamp(),
        });
      }

      // Refresh history
      const moodLogsRef = collection(db, 'users', user.uid, 'moodLogs');
      const q = query(moodLogsRef, orderBy('timestamp', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      const entries = [];
      querySnapshot.forEach(doc => {
        entries.push({ id: doc.id, ...doc.data() });
      });
      setHistory(entries);
    } catch (err) {
      setError('Failed to analyze mood. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Voice recording handlers
  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      setTranscribedText('');
      setVoiceResult(null);
      setError(null);
      recognitionRef.current.start();
    } else {
      setError('Speech Recognition not supported in this browser.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeVoiceText = async (voiceText) => {
    if (!apiKey) {
      setError('Gemini API key not configured. Please set it in your .env file.');
      return;
    }
    setLoading(true);
    setError(null);
    setVoiceResult(null);
    try {
      const result = await model.generateContent([
        `Analyze the user's mood based on this voice-transcribed text: "${voiceText}". Provide a mood assessment with a mood label (e.g., Happy, Sad, Anxious, Calm), confidence score (0-1), and emotion scores as a JSON object with keys like happiness, anxiety, calm, energy, motivation. Return in JSON format: {"mood": "string", "confidence": 0.85, "emotions": {"happiness": 70, "anxiety": 20, "calm": 80, "energy": 60, "motivation": 50}}`
      ]);
      const response = await result.response;
      const textResponse = response.text();
      let parsed;
      try {
        parsed = JSON.parse(textResponse);
      } catch {
        parsed = { mood: 'Neutral', confidence: 0.5, emotions: {} };
      }
      setVoiceResult(parsed);

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'moodLogs'), {
          mood: parsed.mood,
          confidence: parsed.confidence,
          emotions: parsed.emotions,
          text: voiceText,
          timestamp: serverTimestamp(),
        });
      }

      // Refresh history
      const moodLogsRef = collection(db, 'users', user.uid, 'moodLogs');
      const q = query(moodLogsRef, orderBy('timestamp', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      const entries = [];
      querySnapshot.forEach(doc => {
        entries.push({ id: doc.id, ...doc.data() });
      });
      setHistory(entries);
    } catch (err) {
      setError('Failed to analyze mood from voice. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Effect to analyze transcribed text when it changes
  useEffect(() => {
    if (transcribedText) {
      analyzeVoiceText(transcribedText);
    }
  }, [transcribedText, analyzeVoiceText]);

  // Quiz handlers
  const handleMoodQuizAnswer = (questionId, answer) => {
    setMoodQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (currentQuestionIndex < moodQuizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 500); // Delay for smooth transition
    } else {
      // Calculate result
      calculateQuizResult();
    }
  };

  const calculateQuizResult = async () => {
    if (!apiKey) {
      setError('Gemini API key not configured. Please set it in your .env file.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const answersText = Object.entries(moodQuizAnswers).map(([questionId, answer]) => {
        const question = moodQuizQuestions.find(q => q.id === questionId);
        return `${question.question}: ${answer}`;
      }).join('\n');

      const result = await model.generateContent([
        `Analyze the user's mood based on these quiz answers:\n${answersText}\n\nProvide a mood assessment with a mood label (e.g., Happy, Sad, Anxious, Calm), confidence score (0-1), and emotion scores as a JSON object with keys like happiness, anxiety, calm, energy, motivation. Return in JSON format: {"mood": "string", "confidence": 0.85, "emotions": {"happiness": 70, "anxiety": 20, "calm": 80, "energy": 60, "motivation": 50}}`
      ]);
      const response = await result.response;
      const textResponse = response.text();
      let parsed;
      try {
        parsed = JSON.parse(textResponse);
      } catch {
        parsed = { mood: 'Neutral', confidence: 0.5, emotions: {} };
      }

      const quizResult = {
        mood: parsed.mood,
        confidence: parsed.confidence,
        emotions: parsed.emotions,
        answers: moodQuizAnswers,
        timestamp: new Date()
      };

      setQuizResult(quizResult);
      setIsQuizCompleted(true);

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'moodLogs'), {
          mood: quizResult.mood,
          confidence: quizResult.confidence,
          emotions: quizResult.emotions,
          answers: quizResult.answers,
          timestamp: serverTimestamp(),
        });
      }

      // Refresh history
      const moodLogsRef = collection(db, 'users', user.uid, 'moodLogs');
      const q = query(moodLogsRef, orderBy('timestamp', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      const entries = [];
      querySnapshot.forEach(doc => {
        entries.push({ id: doc.id, ...doc.data() });
      });
      setHistory(entries);
    } catch (err) {
      setError('Failed to analyze quiz mood. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setMoodQuizAnswers({});
    setQuizResult(null);
    setIsQuizCompleted(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const barColors = {
    stress: '#f87171', // red-400
    anxiety: '#fbbf24', // yellow-400
    calm: '#60a5fa', // blue-400
    happiness: '#34d399', // green-400
    sadness: '#a78bfa', // purple-400
    energy: '#f97316', // orange-400
    fatigue: '#9ca3af' // gray-400
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-pastel-neutral-900 rounded-3xl shadow-lg mt-12">
      <motion.h2
        className="text-3xl font-bold mb-6 text-pastel-neutral-800 dark:text-pastel-neutral-100 font-sans"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Analyze Your Mood
      </motion.h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div variants={itemVariants}>
          <label htmlFor="feeling" className="block text-lg font-semibold text-pastel-neutral-700 dark:text-pastel-neutral-200 mb-2">
            How are you feeling today?
          </label>
          <textarea
            id="feeling"
            value={text}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-pastel-neutral-50 dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-pastel-neutral-100 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 transition"
            placeholder="Describe your current mood or thoughts..."
            required
          />
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-pastel-blue-500 to-pastel-purple-600 hover:from-pastel-blue-600 hover:to-pastel-purple-700 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Submit'}
          </button>
        </motion.div>
      </form>

      {/* Voice Mood Analyzer Card */}
      <motion.div
        className="mt-8 p-6 bg-gradient-to-br from-pastel-purple-100 to-pastel-blue-100 dark:from-pastel-purple-900 dark:to-pastel-blue-900 rounded-3xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-bold mb-4 text-pastel-neutral-800 dark:text-pastel-neutral-100 font-sans">
          🎙️ Voice Mood Analyzer
        </h3>

        <div className="flex flex-col items-center space-y-4">
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-4 rounded-full transition-all duration-300 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-pastel-blue-500 hover:bg-pastel-blue-600'
            } text-white shadow-lg`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
            transition={isRecording ? { repeat: Infinity, duration: 1.5 } : {}}
          >
            {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
          </motion.button>

          <p className="text-center text-pastel-neutral-700 dark:text-pastel-neutral-300">
            {isRecording ? 'Listening...' : 'Click the microphone to start voice analysis'}
          </p>

          {transcribedText && (
            <motion.div
              className="w-full p-4 bg-white dark:bg-pastel-neutral-800 rounded-xl shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-pastel-neutral-900 dark:text-pastel-neutral-100 font-semibold mb-2">Transcribed Text:</p>
              <p className="text-pastel-neutral-700 dark:text-pastel-neutral-300 italic">"{transcribedText}"</p>
            </motion.div>
          )}
        </div>

        {voiceResult && (
          <motion.div
            className="mt-6 p-4 bg-white dark:bg-pastel-neutral-800 rounded-xl shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h4 className="text-xl font-bold mb-3 text-pastel-neutral-800 dark:text-pastel-neutral-100 font-sans">
              Voice Analysis Result: <span className="capitalize">{voiceResult.mood}</span>
            </h4>
            <p className="mb-3 text-pastel-neutral-700 dark:text-pastel-neutral-300 font-sans">
              Confidence: {(voiceResult.confidence * 100).toFixed(0)}%
            </p>
            <div className="space-y-2">
              {Object.entries(voiceResult.emotions).map(([emotion, value]) => (
                <div key={emotion} className="flex items-center gap-4">
                  <span className="capitalize w-24 font-semibold text-pastel-neutral-800 dark:text-pastel-neutral-100 font-sans">{emotion}</span>
                  <div className="w-full bg-pastel-neutral-300 dark:bg-pastel-neutral-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 rounded-full"
                      style={{
                        width: `${value}%`,
                        backgroundColor: barColors[emotion] || '#a3a3a3'
                      }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-pastel-neutral-700 dark:text-pastel-neutral-300">{value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Mood Quiz Card */}
      <motion.div
        className="mt-8 p-6 bg-gradient-to-br from-pastel-green-100 to-pastel-yellow-100 dark:from-pastel-green-900 dark:to-pastel-yellow-900 rounded-3xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-bold mb-4 text-pastel-neutral-800 dark:text-pastel-neutral-100 font-sans">
          🧠 Mood Quiz
        </h3>

        {!isQuizCompleted ? (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="w-full bg-pastel-neutral-300 dark:bg-pastel-neutral-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pastel-green-500 to-pastel-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestionIndex + 1) / moodQuizQuestions.length) * 100}%` }}
              />
            </div>

            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h4 className="text-xl font-semibold mb-6 text-pastel-neutral-800 dark:text-pastel-neutral-100">
                {moodQuizQuestions[currentQuestionIndex].question}
              </h4>

              <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {moodQuizQuestions[currentQuestionIndex].options.map((option, index) => (
                  <motion.button
                    key={option}
                    onClick={() => handleMoodQuizAnswer(moodQuizQuestions[currentQuestionIndex].id, option)}
                    className="p-4 bg-white dark:bg-pastel-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-pastel-neutral-900 dark:text-pastel-neutral-100">{option}</span>
                  </motion.button>
                ))}
              </div>

              <p className="text-sm text-pastel-neutral-600 dark:text-pastel-neutral-400 mt-4">
                Question {currentQuestionIndex + 1} of {moodQuizQuestions.length}
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <h4 className="text-2xl font-bold text-pastel-neutral-800 dark:text-pastel-neutral-100 mb-2">
                Quiz Complete! 🎉
              </h4>
            </motion.div>

            <motion.div
              className="p-6 bg-white dark:bg-pastel-neutral-800 rounded-xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h5 className="text-xl font-bold mb-3 text-pastel-neutral-800 dark:text-pastel-neutral-100">
                Your Mood: <span className="capitalize">{quizResult.mood}</span>
              </h5>
              <p className="mb-4 text-pastel-neutral-700 dark:text-pastel-neutral-300">
                Confidence: {(quizResult.confidence * 100).toFixed(0)}%
              </p>

              <div className="space-y-3">
                {Object.entries(quizResult.emotions).map(([emotion, value], index) => (
                  <motion.div
                    key={emotion}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <span className="capitalize w-24 font-semibold text-pastel-neutral-800 dark:text-pastel-neutral-100">
                      {emotion}
                    </span>
                    <div className="w-full bg-pastel-neutral-300 dark:bg-pastel-neutral-700 rounded-full h-4 overflow-hidden">
                      <motion.div
                        className="h-4 rounded-full"
                        style={{
                          backgroundColor: barColors[emotion] || '#a3a3a3'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-pastel-neutral-700 dark:text-pastel-neutral-300">
                      {value}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.button
              onClick={resetQuiz}
              className="bg-gradient-to-r from-pastel-green-500 to-pastel-yellow-600 hover:from-pastel-green-600 hover:to-pastel-yellow-700 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 shadow-glow hover:shadow-glow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Take Quiz Again
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {error && (
        <motion.p
          className="mt-4 text-red-600 font-semibold text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      {result && (
        <motion.div
          className="mt-8 p-6 bg-pastel-blue-50 dark:bg-pastel-blue-900 rounded-3xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-2xl font-bold mb-4 text-pastel-neutral-800 dark:text-pastel-neutral-100 font-sans">
            Mood: <span className="capitalize">{result.mood}</span>
          </h3>
          <p className="mb-4 text-pastel-neutral-700 dark:text-pastel-neutral-300 font-sans">
            Confidence: {(result.confidence * 100).toFixed(0)}%
          </p>
          <div className="space-y-2">
            {Object.entries(result.emotions).map(([emotion, value]) => (
              <div key={emotion} className="flex items-center gap-4">
                <span className="capitalize w-24 font-semibold text-pastel-neutral-800 dark:text-pastel-neutral-100 font-sans">{emotion}</span>
                <div className="w-full bg-pastel-neutral-300 dark:bg-pastel-neutral-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 rounded-full"
                    style={{
                      width: `${value}%`,
                      backgroundColor: barColors[emotion] || '#a3a3a3'
                    }}
                  />
                </div>
                <span className="w-10 text-right font-mono text-pastel-neutral-700 dark:text-pastel-neutral-300">{value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-xl font-semibold mb-4 text-pastel-neutral-800 dark:text-pastel-neutral-100 font-sans">Recent Mood Entries</h3>
          <ul className="space-y-4">
            {history.map(entry => (
              <li key={entry.id} className="p-4 bg-pastel-neutral-100 dark:bg-pastel-neutral-800 rounded-2xl shadow-sm">
                <p className="font-semibold text-pastel-neutral-900 dark:text-pastel-neutral-100 mb-1">{new Date(entry.timestamp?.seconds * 1000).toLocaleString()}</p>
                <p className="capitalize font-bold text-pastel-neutral-800 dark:text-pastel-neutral-200 mb-2">{entry.mood}</p>
                <div className="space-y-1">
                  {Object.entries(entry.emotions).map(([emotion, value]) => (
                    <div key={emotion} className="flex items-center gap-3">
                      <span className="capitalize w-20 font-semibold text-pastel-neutral-700 dark:text-pastel-neutral-300 font-sans">{emotion}</span>
                      <div className="w-full bg-pastel-neutral-300 dark:bg-pastel-neutral-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${value}%`,
                            backgroundColor: barColors[emotion] || '#a3a3a3'
                          }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono text-pastel-neutral-700 dark:text-pastel-neutral-300">{value}%</span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

export default MoodAnalyzer;
