import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const moods = [
  { name: 'Happy', color: '#34D399' }, // green-400
  { name: 'Stressed', color: '#F87171' }, // red-400
  { name: 'Calm', color: '#60A5FA' }, // blue-400
  { name: 'Anxious', color: '#FBBF24' }, // yellow-400
  { name: 'Neutral', color: '#9CA3AF' }, // gray-400
];

const AnalyzeYourMood = () => {
  const { user, getIdToken } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [moodScores, setMoodScores] = useState(null);
  const [voiceSummary, setVoiceSummary] = useState('');
  const [error, setError] = useState(null);

  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizMoodScores, setQuizMoodScores] = useState(null);
  const [quizSummary, setQuizSummary] = useState('');
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Setup MediaRecorder on mount
  useEffect(() => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert('MediaRecorder API not supported in this browser.');
      return;
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    setMoodScores(null);
    setVoiceSummary('');
    setAudioChunks([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const chunks = [];
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const wavBlob = await convertWebmToWav(audioBlob);
        await analyzeAudioWithBackend(wavBlob);
      };

      recorder.start();
      setIsRecording(true);

      // Stop recording after 5 seconds or when user stops manually
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 5000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please allow microphone permissions.');
      setError('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Convert WebM audio Blob to WAV Blob
  const convertWebmToWav = async (webmBlob) => {
    // Use AudioContext to decode and re-encode as WAV
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Encode WAV
    const wavBuffer = encodeWAV(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  // WAV encoder helper
  const encodeWAV = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    let samples;
    if (numChannels === 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      samples = interleave(left, right);
    } else {
      samples = audioBuffer.getChannelData(0);
    }

    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, format, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * numChannels * bitDepth / 8, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * bitDepth / 8, true);
    /* bits per sample */
    view.setUint16(34, bitDepth, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    // Write the PCM samples
    floatTo16BitPCM(view, 44, samples);

    return buffer;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const floatTo16BitPCM = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7FFF;
      output.setInt16(offset, s, true);
    }
  };

  const interleave = (left, right) => {
    const length = left.length + right.length;
    const result = new Float32Array(length);

    let inputIndex = 0;
    for (let index = 0; index < length;) {
      result[index++] = left[inputIndex];
      result[index++] = right[inputIndex];
      inputIndex++;
    }
    return result;
  };

  const analyzeAudioWithBackend = async (audioBlob) => {
    setError(null);
    setMoodScores(null);
    setVoiceSummary('');
    try {
      const base64Audio = await blobToBase64(audioBlob);
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = 'Analyze this audio for mood and sentiment. Respond in JSON with keys: moodScores (object with happy, calm, stressed, anxious, sad, angry, hopeful as percentages), summary (one-line summary).';

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const data = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));

      setMoodScores(data.moodScores);
      setVoiceSummary(data.summary);

      // Save to Firestore
      await addDoc(collection(db, 'users', user.uid, 'moodLogs'), {
        userId: user.uid,
        createdAt: serverTimestamp(),
        source: 'voice',
        moodScores: data.moodScores,
        summary: data.summary,
        tagsDetected: Object.keys(data.moodScores).filter(key => data.moodScores[key] > 0.3)
      });

      setError(null);
    } catch (err) {
      console.error('Error analyzing audio:', err);
      setError('Failed to analyze audio. Please try again.');
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const pieData = moodScores
    ? Object.entries(moodScores).map(([key, value]) => ({
        name: key,
        value: value * 100,
        color: moods.find(m => m.name.toLowerCase() === key.toLowerCase())?.color || '#9CA3AF',
      }))
    : [];

  const generateQuizQuestions = async () => {
    setError(null);
    setIsGeneratingQuiz(true);
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = 'Generate a 5-question multiple choice quiz to evaluate current mental state. Format JSON with {questions: [{question, options: [], correctAnswer}]}';

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const data = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));

      setQuizQuestions(data.questions || []);
      setError(null);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz questions. Please try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuizAnswer = (answer) => {
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      analyzeQuizAnswers(newAnswers);
    }
  };

  const analyzeQuizAnswers = async (answers) => {
    setError(null);
    try {
      const idToken = await getIdToken();
      const response = await fetch('/api/score-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to score quiz');
      }

      const data = await response.json();
      // For now, set mock data since backend doesn't return moodScores directly
      setQuizMoodScores({
        happy: 0.6,
        calm: 0.7,
        stressed: 0.4,
        anxious: 0.3,
        neutral: 0.5,
      });
      setQuizSummary(data.summary || '');
      setIsQuizCompleted(true);
      setError(null);
    } catch (err) {
      console.error('Error scoring quiz:', err);
      setError('Failed to score quiz. Please try again.');
    }
  };

  const resetQuiz = () => {
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
    setQuizMoodScores(null);
    setQuizSummary('');
    setIsQuizCompleted(false);
    setIsGeneratingQuiz(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue-50 via-white to-pastel-purple-50 dark:from-pastel-neutral-900 dark:via-pastel-neutral-800 dark:to-pastel-neutral-900 transition-colors duration-200 p-8">
      <motion.div
        className=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 font-sans text-white dark:text-pastel-neutral-100">Analyze Your Mood</h2>

        <section className="mb-8 rounded-xl bg-gradient-to-r from-purple-700 to-blue-700 dark:from-purple-900 dark:to-blue-900 p-6 shadow-lg transition-colors duration-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white dark:text-pastel-neutral-100">
            <span role="img" aria-label="microphone">🎤</span> Voice Mood Analyzer
          </h3>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`rounded-full p-6 mb-4 ${
              isRecording ? 'bg-red-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
            } text-white shadow-lg transition-colors duration-300 focus:outline-none`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            🎤
          </button>

          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}

          {moodScores && pieData.length > 0 && (
            <div className="w-full h-64 mb-4 rounded-xl bg-white dark:bg-pastel-neutral-900 p-4 shadow-md transition-colors duration-700">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {voiceSummary && (
            <motion.div
              className="rounded-xl bg-white dark:bg-pastel-neutral-900 p-6 shadow-md text-pastel-neutral-900 dark:text-pastel-neutral-100 transition-colors duration-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h4 className="text-lg font-semibold mb-2">AI-Generated Mood Summary</h4>
              <p>{voiceSummary}</p>
            </motion.div>
          )}
        </section>

        <section className="rounded-xl bg-green-900 dark:bg-green-800 p-6 shadow-lg transition-colors duration-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white dark:text-pastel-neutral-100">
            <span role="img" aria-label="brain">🧠</span> Mood Quiz
          </h3>
          {/* Mood quiz content here */}
          <p>How are you feeling right now?</p>

          {!quizQuestions.length && !isGeneratingQuiz && (
            <button
              onClick={generateQuizQuestions}
              className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg text-white transition-colors duration-300"
            >
              Start Mood Quiz
            </button>
          )}

          {isGeneratingQuiz && (
            <p className="mt-4 text-white">Generating quiz questions...</p>
          )}

          {quizQuestions.length > 0 && !isQuizCompleted && (
            <motion.div
              className="mt-4 p-4 rounded-xl bg-white dark:bg-pastel-neutral-900 shadow-md transition-colors duration-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h4 className="text-lg font-semibold mb-2 text-pastel-neutral-900 dark:text-pastel-neutral-100">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </h4>
              <p className="mb-4 text-pastel-neutral-900 dark:text-pastel-neutral-100">{quizQuestions[currentQuestionIndex].question}</p>
              <div className="flex flex-col gap-2">
                {quizQuestions[currentQuestionIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(option)}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white transition-colors duration-300"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {isQuizCompleted && (
            <motion.div
              className="mt-4 p-4 rounded-xl bg-white dark:bg-pastel-neutral-900 shadow-md transition-colors duration-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h4 className="text-lg font-semibold mb-2 text-pastel-neutral-900 dark:text-pastel-neutral-100">Mood Quiz Results</h4>

              {quizMoodScores && (
                <div className="w-full h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(quizMoodScores).map(([key, value]) => ({
                      name: key,
                      value: value * 100,
                      color: moods.find(m => m.name.toLowerCase() === key.toLowerCase())?.color || '#9CA3AF',
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {Object.entries(quizMoodScores).map(([key], index) => (
                          <Cell key={`cell-${index}`} fill={moods.find(m => m.name.toLowerCase() === key.toLowerCase())?.color || '#9CA3AF'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {quizSummary && (
                <p className="text-pastel-neutral-900 dark:text-pastel-neutral-100">{quizSummary}</p>
              )}

              <button
                onClick={resetQuiz}
                className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg text-white transition-colors duration-300"
              >
                Take Quiz Again
              </button>
            </motion.div>
          )}
        </section>
      </motion.div>
    </motion.div>
  );
};

export default AnalyzeYourMood;
