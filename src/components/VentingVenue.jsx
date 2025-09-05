import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

// Tags from preferences
const VENT_TAGS = [
  'Depressed', 'Anxious', 'Exam stressed', 'Worried',
  'Frustrated', 'Scared', 'Overwhelmed', 'Lonely'
];

// Filter options
const PERIOD_FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' }
];

const PERSON_FILTERS = [
  { id: 'all', label: 'All Posts' },
  { id: 'anonymous', label: 'Anonymous Only' },
  { id: 'username', label: 'Username Only' }
];

const VentingVenue = () => {
  const { user } = useAuth();
  const [ventText, setVentText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [vents, setVents] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    period: 'all',
    tag: 'all',
    person: 'all'
  });
  const [visibleVents, setVisibleVents] = useState(10);

  // Initialize particles
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesLoaded = (container) => {
  };

  // Starfield background effect replaced by framer animation using react-tsparticles

  // Load vents from Firebase
  useEffect(() => {
    console.log('Setting up Firestore listener for vents collection...');
    const q = query(collection(db, 'vents'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('Received snapshot with', querySnapshot.size, 'documents');
      const ventsData = [];
      querySnapshot.forEach((doc) => {
        ventsData.push({ id: doc.id, ...doc.data() });
      });
      console.log('Processed vents data:', ventsData.length, 'vents');
      setVents(ventsData);
    }, (error) => {
      console.error('Error listening to vents collection:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    });

    return () => {
      console.log('Unsubscribing from vents collection listener');
      unsubscribe();
    };
  }, []);

  // Helper function to get time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';

    const postTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInSeconds = Math.floor((Date.now() - postTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return postTime.toLocaleDateString();
  };

  // Filter vents based on current filters
  const filteredVents = vents.filter(vent => {
    const ventDate = vent.timestamp?.toDate ? vent.timestamp.toDate() : new Date();

    // Period filter
    if (filters.period !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (filters.period) {
        case 'today':
          if (ventDate < today) return false;
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (ventDate < yesterday || ventDate >= today) return false;
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (ventDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (ventDate < monthAgo) return false;
          break;
        default:
          break;
      }
    }

    // Tag filter
    if (filters.tag !== 'all' && vent.tag !== filters.tag) return false;

    // Person filter
    if (filters.person !== 'all') {
      if (filters.person === 'anonymous' && vent.author !== 'Anonymous') return false;
      if (filters.person === 'username' && vent.author === 'Anonymous') return false;
    }

    return true;
  });

  // Handle delete post
  const handleDeletePost = async (ventId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'vents', ventId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Load more posts
  const loadMorePosts = () => {
    setVisibleVents(prev => prev + 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ventText.trim() || !selectedTag) return;

    setIsLoading(true);
    try {
      console.log('Attempting to add vent to Firestore...');
      const ventData = {
        text: ventText.trim(),
        tag: selectedTag,
        author: isAnonymous ? 'Anonymous' : (user?.displayName || user?.email || 'Anonymous'),
        timestamp: serverTimestamp(),
        reactions: {
          hug: 0,
          heart: 0,
          support: 0
        }
      };
      if (!isAnonymous) {
        ventData.authorId = user?.uid;
      }
      await addDoc(collection(db, 'vents'), ventData);
      console.log('Vent added successfully');
      setVentText('');
      setSelectedTag('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error adding vent:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      alert(`Failed to post vent: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (ventId, reactionType) => {
    // For now, we'll just update the local state
    // In a real implementation, you'd update this in Firebase
    setVents(prevVents =>
      prevVents.map(vent =>
        vent.id === ventId
          ? {
              ...vent,
              reactions: {
                ...vent.reactions,
                [reactionType]: vent.reactions[reactionType] + 1
              }
            }
          : vent
      )
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 py-8">
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
        className="fixed inset-0 -z-10"
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">Your Safe Space 🌸</h1>
          <p className="text-lg text-pastel-neutral-600 dark:text-pastel-neutral-400">
            You're not alone here. Share freely and find support in our community.
          </p>
        </motion.div>

        {/* Filter Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/80 dark:bg-pastel-neutral-900/80 backdrop-blur-md rounded-xl shadow-soft border border-pastel-neutral-100 dark:border-pastel-neutral-700 px-6 py-3 text-pastel-neutral-700 dark:text-pastel-neutral-300 hover:text-pastel-blue-600 dark:hover:text-pastel-blue-400 transition-colors"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'} 🔍
          </motion.button>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 dark:bg-pastel-neutral-900/80 backdrop-blur-md rounded-2xl shadow-soft border border-pastel-neutral-100 dark:border-pastel-neutral-700 p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Period Filter */}
                <div>
                  <label className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300 mb-2">
                    Period
                  </label>
                  <select
                    value={filters.period}
                    onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full px-3 py-2 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-lg bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
                  >
                    <option value="all">All Time</option>
                    {PERIOD_FILTERS.map(filter => (
                      <option key={filter.id} value={filter.id}>{filter.label}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.tag}
                    onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
                    className="w-full px-3 py-2 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-lg bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
                  >
                    <option value="all">All Types</option>
                    {VENT_TAGS.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                {/* Person Filter */}
                <div>
                  <label className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300 mb-2">
                    Person
                  </label>
                  <select
                    value={filters.person}
                    onChange={(e) => setFilters(prev => ({ ...prev, person: e.target.value }))}
                    className="w-full px-3 py-2 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-lg bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
                  >
                    {PERSON_FILTERS.map(filter => (
                      <option key={filter.id} value={filter.id}>{filter.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vent Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white/80 dark:bg-pastel-neutral-900/80 backdrop-blur-md rounded-2xl shadow-soft border border-pastel-neutral-100 dark:border-pastel-neutral-700 p-6 mb-8"
        >
          <div className="mb-4">
            <textarea
              value={ventText}
              onChange={(e) => setVentText(e.target.value)}
              placeholder="What's on your mind? Share your thoughts here..."
              className="w-full h-32 p-4 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-xl bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white placeholder-pastel-neutral-500 dark:placeholder-pastel-neutral-400 focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all duration-300 resize-none"
              maxLength={500}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-pastel-neutral-500 dark:text-pastel-neutral-400">
                {ventText.length}/500 characters
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-pastel-blue-500 rounded"
                />
                <span className="text-sm text-pastel-neutral-600 dark:text-pastel-neutral-400">
                  Post anonymously
                </span>
              </label>
            </div>
          </div>

          {/* Tag Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300 mb-2">
              How are you feeling? (Required)
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-lg bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
              required
            >
              <option value="">Select a feeling...</option>
              {VENT_TAGS.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !ventText.trim() || !selectedTag}
              className="flex-1 bg-gradient-to-r from-pastel-blue-500 to-pastel-purple-600 hover:from-pastel-blue-600 hover:to-pastel-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-glow"
            >
              {isLoading ? 'Posting...' : `Post ${isAnonymous ? 'Anonymously' : 'with Username'}`}
            </motion.button>
          </div>
        </motion.form>

        {/* Vents Feed */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredVents.slice(0, visibleVents).map((vent, index) => (
              <motion.div
                key={vent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/80 dark:bg-pastel-neutral-900/80 backdrop-blur-md rounded-2xl shadow-soft border border-pastel-neutral-100 dark:border-pastel-neutral-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pastel-blue-500 to-pastel-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {vent.author === 'Anonymous' ? '?' : vent.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-pastel-neutral-900 dark:text-white">
                          {vent.author}
                        </p>
                        {vent.authorId === user?.uid && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeletePost(vent.id)}
                            className="text-pastel-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            🗑️
                          </motion.button>
                        )}
                      </div>
                      <p className="text-sm text-pastel-neutral-500 dark:text-pastel-neutral-400">
                        {getTimeAgo(vent.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tag Display */}
                <div className="mb-3">
                  <span className="inline-block bg-pastel-blue-100 dark:bg-pastel-blue-900/30 text-pastel-blue-800 dark:text-pastel-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {vent.tag}
                  </span>
                </div>

                <p className="text-pastel-neutral-800 dark:text-pastel-neutral-200 mb-4 leading-relaxed">
                  {vent.text}
                </p>

                {/* Reactions */}
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(vent.id, 'hug')}
                    className="flex items-center space-x-1 text-pastel-neutral-600 dark:text-pastel-neutral-400 hover:text-pastel-pink-500 dark:hover:text-pastel-pink-400 transition-colors"
                  >
                    <span className="text-lg">🤗</span>
                    <span className="text-sm">{vent.reactions?.hug || 0}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(vent.id, 'heart')}
                    className="flex items-center space-x-1 text-pastel-neutral-600 dark:text-pastel-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <span className="text-lg">💖</span>
                    <span className="text-sm">{vent.reactions?.heart || 0}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(vent.id, 'support')}
                    className="flex items-center space-x-1 text-pastel-neutral-600 dark:text-pastel-neutral-400 hover:text-pastel-green-500 dark:hover:text-pastel-green-400 transition-colors"
                  >
                    <span className="text-lg">🌸</span>
                    <span className="text-sm">{vent.reactions?.support || 0}</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load More Button */}
          {filteredVents.length > visibleVents && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadMorePosts}
                className="bg-white/80 dark:bg-pastel-neutral-900/80 backdrop-blur-md rounded-xl shadow-soft border border-pastel-neutral-100 dark:border-pastel-neutral-700 px-6 py-3 text-pastel-neutral-700 dark:text-pastel-neutral-300 hover:text-pastel-blue-600 dark:hover:text-pastel-blue-400 transition-colors"
              >
                Load More Posts 📚
              </motion.button>
            </motion.div>
          )}

          {filteredVents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-pastel-neutral-500 dark:text-pastel-neutral-400 text-lg">
                {vents.length === 0 ? 'No vents yet. Be the first to share your thoughts!' : 'No posts match your current filters.'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VentingVenue;
