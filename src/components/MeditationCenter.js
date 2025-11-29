import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import alarmSound from '../assets/sounds/alarm.ogg';
import SpotlightCard from './SpotlightCard';


const MeditationCenter = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('breathing'); // 'breathing' or 'timer'

    // Breathing State
    const [breathingState, setBreathingState] = useState('idle'); // idle, inhale, hold, exhale
    const [breathingText, setBreathingText] = useState('Ready?');

    // Timer State
    const [timerDuration, setTimerDuration] = useState(5 * 60); // default 5 mins
    const [timeLeft, setTimeLeft] = useState(5 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);
    const alarmRef = useRef(null);
    const ALARM_URL = alarmSound;

    // Ambient Sound State
    const [activeSound, setActiveSound] = useState(null); // null, 'rain', 'forest', 'ocean'
    const audioRef = useRef(null);

    const sounds = {
        rain: {
            name: 'Rain',
            icon: '🌧️',
            url: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Heavy_rain_in_Glenshaw,_PA.ogg'
        },
        forest: {
            name: 'Forest',
            icon: '🌲',
            url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/20090610_0_ambience.ogg'
        },
        ocean: {
            name: 'Ocean',
            icon: '🌊',
            url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Oceanwavescrushing.ogg'
        }
    };

    // Meditation Tips
    const tips = [
        "Focus on your breath. If your mind wanders, gently bring it back.",
        "Sit comfortably with your back straight but relaxed.",
        "Don't judge your thoughts. Observe them like clouds passing by.",
        "Relax your jaw and drop your shoulders.",
        "Start with just 5 minutes a day. Consistency is key.",
        "It's okay to have a busy mind. Meditation is the practice of returning.",
        "Feel the sensation of the air entering and leaving your nose."
    ];
    const [dailyTip, setDailyTip] = useState('');

    useEffect(() => {
        setDailyTip(tips[Math.floor(Math.random() * tips.length)]);
    }, []);

    // Breathing Cycle (4-7-8 Technique)
    useEffect(() => {
        let timeout;
        if (breathingState === 'inhale') {
            setBreathingText('Inhale...');
            timeout = setTimeout(() => setBreathingState('hold'), 4000);
        } else if (breathingState === 'hold') {
            setBreathingText('Hold...');
            timeout = setTimeout(() => setBreathingState('exhale'), 7000);
        } else if (breathingState === 'exhale') {
            setBreathingText('Exhale...');
            timeout = setTimeout(() => setBreathingState('inhale'), 8000);
        }
        return () => clearTimeout(timeout);
    }, [breathingState]);

    const toggleBreathing = () => {
        if (breathingState === 'idle') {
            setBreathingState('inhale');
        } else {
            setBreathingState('idle');
            setBreathingText('Ready?');
        }
    };

    // Timer Logic
    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsTimerRunning(false);
                        // Play alarm sound
                        if (alarmRef.current) {
                            alarmRef.current.currentTime = 0;
                            alarmRef.current.play().catch(e => console.error("Alarm play failed:", e));
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const testAlarm = () => {
        if (alarmRef.current) {
            alarmRef.current.currentTime = 0;
            alarmRef.current.play().catch(e => console.error("Test play failed:", e));
        }
    };

    const toggleTimer = () => {
        if (!isTimerRunning) {
            // Prime the alarm audio to bypass autoplay restrictions
            if (alarmRef.current) {
                alarmRef.current.play().then(() => {
                    alarmRef.current.pause();
                    alarmRef.current.currentTime = 0;
                }).catch(e => console.log("Audio priming failed", e));
            }
            setIsTimerRunning(true);
        } else {
            setIsTimerRunning(false);
        }
    };

    const resetTimer = () => {
        setIsTimerRunning(false);
        setTimeLeft(timerDuration);
        // Stop alarm if playing
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Sound Logic
    const toggleSound = (soundKey) => {
        if (activeSound === soundKey) {
            setActiveSound(null);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        } else {
            setActiveSound(soundKey);
            if (audioRef.current) {
                audioRef.current.src = sounds[soundKey].url;
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        }
    };

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (alarmRef.current) {
                alarmRef.current.pause();
            }
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 p-6 flex flex-col items-center overflow-hidden">


            <div className="w-full flex flex-col items-center">
                {/* Header */}
                <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <span className="text-2xl">←</span>
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white font-sans">
                        Meditation Center
                    </h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                {/* Ambient Sounds Control */}
                <div className="flex space-x-4 mb-8 bg-white/50 dark:bg-gray-800/50 p-3 rounded-2xl backdrop-blur-sm shadow-sm">
                    {Object.entries(sounds).map(([key, sound]) => (
                        <button
                            key={key}
                            onClick={() => toggleSound(key)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${activeSound === key
                                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 ring-2 ring-indigo-500'
                                : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                                }`}
                        >
                            <span className="text-xl">{sound.icon}</span>
                            <span className="font-medium hidden md:inline">{sound.name}</span>
                        </button>
                    ))}
                    <audio ref={audioRef} loop />
                    <audio ref={alarmRef} src={ALARM_URL} preload="auto" />
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-12 bg-white/50 dark:bg-gray-800/50 p-2 rounded-2xl backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('breathing')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'breathing'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        Breathing
                    </button>
                    <button
                        onClick={() => setActiveTab('timer')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'timer'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        Meditation Timer
                    </button>
                </div>

                {/* Content Area */}
                <div className="w-full max-w-md mb-12">
                    <AnimatePresence mode="wait">
                        {activeTab === 'breathing' ? (
                            <motion.div
                                key="breathing"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                                    {/* Outer Glow Ring */}
                                    <motion.div
                                        animate={{
                                            scale: breathingState === 'inhale' ? 1.5 : breathingState === 'hold' ? 1.5 : 1,
                                            opacity: breathingState === 'idle' ? 0.3 : 0.6,
                                        }}
                                        transition={{ duration: breathingState === 'inhale' ? 4 : breathingState === 'exhale' ? 8 : 0 }}
                                        className="absolute inset-0 bg-indigo-400 rounded-full blur-xl"
                                    />

                                    {/* Main Circle */}
                                    <motion.div
                                        animate={{
                                            scale: breathingState === 'inhale' ? 1.2 : breathingState === 'hold' ? 1.2 : 1,
                                        }}
                                        transition={{ duration: breathingState === 'inhale' ? 4 : breathingState === 'exhale' ? 8 : 0 }}
                                        className="w-48 h-48 bg-white dark:bg-gray-800 rounded-full shadow-2xl flex items-center justify-center z-10 relative"
                                    >
                                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                            {breathingText}
                                        </span>
                                    </motion.div>
                                </div>

                                <button
                                    onClick={toggleBreathing}
                                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    {breathingState === 'idle' ? 'Start Breathing' : 'Stop'}
                                </button>
                                <p className="mt-6 text-gray-500 dark:text-gray-400 text-center">
                                    4-7-8 Technique: Inhale for 4s, Hold for 7s, Exhale for 8s.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="timer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col items-center w-full"
                            >
                                {/* Timer Display */}
                                <div className="text-8xl font-bold text-gray-800 dark:text-white mb-4 font-mono tracking-wider">
                                    {timeLeft === 0 ? "Time's Up!" : formatTime(timeLeft)}
                                </div>

                                {/* Test Alarm Button */}
                                <button
                                    onClick={testAlarm}
                                    className="mb-8 text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                                >
                                    <span className="mr-1">🔊</span> Test Alarm Sound
                                </button>

                                {/* Duration Selectors */}
                                <div className="flex space-x-4 mb-12">
                                    {[1, 5, 10, 15, 20].map((mins) => (
                                        <button
                                            key={mins}
                                            onClick={() => {
                                                setTimerDuration(mins * 60);
                                                setTimeLeft(mins * 60);
                                                setIsTimerRunning(false);
                                            }}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${timerDuration === mins * 60
                                                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-500'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            {mins}m
                                        </button>
                                    ))}
                                </div>

                                {/* Controls */}
                                <div className="flex space-x-6">
                                    <button
                                        onClick={toggleTimer}
                                        className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 w-40 ${isTimerRunning
                                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                            }`}
                                    >
                                        {isTimerRunning ? 'Pause' : 'Start'}
                                    </button>
                                    <button
                                        onClick={resetTimer}
                                        className="px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Meditation Tip Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-md w-full"
                >
                    <SpotlightCard className="bg-white dark:bg-gray-800 p-6 shadow-lg border-l-4 border-indigo-500" spotlightColor="rgba(99, 102, 241, 0.2)">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center">
                            <span className="mr-2">💡</span> Meditation Tip
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 italic">
                            "{dailyTip}"
                        </p>
                    </SpotlightCard>
                </motion.div>
            </div>
        </div>
    );
};

export default MeditationCenter;
