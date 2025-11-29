import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { Link } from 'react-router-dom';
import { containsProfanity } from '../utils/profanityList';
const logo = process.env.PUBLIC_URL + '/logo.png';

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

const REACTION_TYPES = [
  { id: 'hug', emoji: '🫂', label: 'Hug' },
  { id: 'heart', emoji: '❤️', label: 'Love' },
  { id: 'support', emoji: '👏', label: 'Support' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'shocked', emoji: '😮', label: 'Shocked' },
  { id: 'angry', emoji: '😠', label: 'Angry' },
  { id: 'laugh', emoji: '😂', label: 'Laugh' },
  { id: 'pray', emoji: '🙏', label: 'Pray' },
];

const CommentSection = ({ ventId, comments, onAddComment, onDeleteComment }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [activeCommentMenuId, setActiveCommentMenuId] = useState(null);
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const badWords = containsProfanity(commentText);
    if (badWords) {
      alert(`Please keep comments clean. Blocked words: ${badWords.join(", ")}`);
      return;
    }

    onAddComment(ventId, commentText);
    setCommentText('');
  };

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-sm text-indigo-500 hover:text-indigo-600 font-medium mb-4"
      >
        {showComments ? 'Hide Comments' : `Show Comments (${comments?.length || 0})`}
      </button>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="space-y-4 mb-4 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900">
              {comments?.map((comment, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm group relative">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{comment.author}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {comment.timestamp?.toDate ? comment.timestamp.toDate().toLocaleDateString() : 'Just now'}
                      </span>
                      {user && comment.authorId === user.uid && (
                        <div className="relative">
                          <button
                            onClick={() => setActiveCommentMenuId(activeCommentMenuId === comment.id ? null : comment.id)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            <span className="text-lg leading-none">⋮</span>
                          </button>
                          {activeCommentMenuId === comment.id && (
                            <div className="absolute right-0 top-full mt-1 w-24 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-100 dark:border-gray-600 z-20 overflow-hidden">
                              <button
                                onClick={() => {
                                  onDeleteComment(ventId, comment);
                                  setActiveCommentMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{comment.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a supportive comment..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50"
              >
                Reply
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VentingVenue = () => {
  const { user } = useAuth();
  const [ventText, setVentText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [vents, setVents] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState(null);
  const [filters, setFilters] = useState({
    period: 'all',
    tag: 'all',
    person: 'all'
  });
  const [visibleVents, setVisibleVents] = useState(10);

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesLoaded = (container) => { };

  useEffect(() => {
    const q = query(collection(db, 'vents'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ventsData = [];
      querySnapshot.forEach((doc) => {
        ventsData.push({ id: doc.id, ...doc.data() });
      });
      setVents(ventsData);
    }, (error) => {
      console.error('Error listening to vents collection:', error);
    });

    return () => unsubscribe();
  }, []);

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

  const filteredVents = vents.filter(vent => {
    const ventDate = vent.timestamp?.toDate ? vent.timestamp.toDate() : new Date();

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
        default: break;
      }
    }

    if (filters.tag !== 'all' && vent.tag !== filters.tag) return false;

    if (filters.person !== 'all') {
      if (filters.person === 'anonymous' && vent.author !== 'Anonymous') return false;
      if (filters.person === 'username' && vent.author === 'Anonymous') return false;
    }

    return true;
  });

  const handleDeletePost = async (ventId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'vents', ventId));
      setActiveMenuId(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleArchivePost = async (ventId) => {
    // For now, we'll just log it as "Archived" since we don't have an archive view yet
    // In a real app, you'd toggle an 'archived' field
    alert("Post archived (simulated). It would be hidden from the main feed.");
    setActiveMenuId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ventText.trim() || !selectedTag) return;

    const badWords = containsProfanity(ventText);
    if (badWords) {
      alert(`Please keep the Chillspace safe and positive. We detected some words that aren't allowed: ${badWords.join(", ")}`);
      return;
    }

    setIsLoading(true);
    try {
      const ventData = {
        text: ventText.trim(),
        tag: selectedTag,
        author: isAnonymous ? 'Anonymous' : (user?.displayName || user?.email || 'Anonymous'),
        timestamp: serverTimestamp(),
        reactions: {}, // Initialize empty reactions object
        comments: []
      };
      if (!isAnonymous) {
        ventData.authorId = user?.uid;
      }
      await addDoc(collection(db, 'vents'), ventData);
      setVentText('');
      setSelectedTag('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error adding vent:', error);
      alert(`Failed to post vent: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (ventId, reactionType) => {
    if (!user) {
      alert('You must be logged in to react.');
      return;
    }

    const ventRef = doc(db, 'vents', ventId);
    const vent = vents.find(v => v.id === ventId);
    if (!vent) return;

    const userReactions = vent.userReactions || {};
    let updatedUserReactions = { ...userReactions };
    let updatedReactions = { ...vent.reactions };

    // Check if user already reacted with this specific reaction
    if (updatedUserReactions[user.uid] && updatedUserReactions[user.uid].includes(reactionType)) {
      // Remove reaction
      updatedUserReactions[user.uid] = updatedUserReactions[user.uid].filter(r => r !== reactionType);
      updatedReactions[reactionType] = Math.max(0, (updatedReactions[reactionType] || 0) - 1);
    } else {
      // Add reaction
      if (!updatedUserReactions[user.uid]) updatedUserReactions[user.uid] = [];
      updatedUserReactions[user.uid].push(reactionType);
      updatedReactions[reactionType] = (updatedReactions[reactionType] || 0) + 1;
    }

    // Clean up if user has no reactions left
    if (updatedUserReactions[user.uid] && updatedUserReactions[user.uid].length === 0) {
      delete updatedUserReactions[user.uid];
    }

    try {
      await updateDoc(ventRef, {
        reactions: updatedReactions,
        userReactions: updatedUserReactions
      });
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const handleAddComment = async (ventId, text) => {
    if (!user) {
      alert("Please login to comment");
      return;
    }
    const ventRef = doc(db, 'vents', ventId);
    const vent = vents.find(v => v.id === ventId);
    if (!vent) return;

    const newComment = {
      id: Date.now().toString(), // Simple ID for deletion
      text,
      author: user.displayName || user.email || 'Anonymous',
      authorId: user.uid,
      timestamp: new Date()
    };

    const updatedComments = [...(vent.comments || []), newComment];

    try {
      await updateDoc(ventRef, { comments: updatedComments });
    } catch (error) {
      console.error("Error adding comment", error);
    }
  };

  const handleDeleteComment = async (ventId, commentToDelete) => {
    if (!window.confirm("Delete this comment?")) return;

    const ventRef = doc(db, 'vents', ventId);
    const vent = vents.find(v => v.id === ventId);
    if (!vent) return;

    const updatedComments = (vent.comments || []).filter(c => c.id !== commentToDelete.id);

    try {
      await updateDoc(ventRef, { comments: updatedComments });
    } catch (error) {
      console.error("Error deleting comment", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 py-8">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 120,
          interactivity: {
            events: { onClick: { enable: true, mode: "push" }, onHover: { enable: true, mode: "repulse" }, resize: true },
            modes: { push: { quantity: 4 }, repulse: { distance: 200, duration: 0.4 } },
          },
          particles: {
            color: { value: "#ffffff" },
            links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.5, width: 1 },
            collisions: { enable: true },
            move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 1, straight: false },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } },
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
          className="text-center mb-8 relative"
        >
          <Link to="/" className="absolute top-0 left-0 flex items-center space-x-2 z-10 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Chillspace Logo" className="h-12 w-auto" />
            <span className="sr-only">Chillspace Home</span>
          </Link>
          <div className="pt-8">
            <h1 className="text-5xl font-extrabold gradient-text mb-4 font-serif tracking-wide">Your Safe Space 🌸</h1>
            <p className="text-lg text-pastel-neutral-600 dark:text-pastel-neutral-400">
              You're not alone here. Share freely and find support in our community.
            </p>
          </div>
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
                  <label className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300 mb-2">Period</label>
                  <select
                    value={filters.period}
                    onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full px-3 py-2 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-lg bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
                  >
                    <option value="all">All Time</option>
                    {PERIOD_FILTERS.map(filter => (<option key={filter.id} value={filter.id}>{filter.label}</option>))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300 mb-2">Type</label>
                  <select
                    value={filters.tag}
                    onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
                    className="w-full px-3 py-2 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-lg bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
                  >
                    <option value="all">All Types</option>
                    {VENT_TAGS.map(tag => (<option key={tag} value={tag}>{tag}</option>))}
                  </select>
                </div>

                {/* Person Filter */}
                <div>
                  <label className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300 mb-2">Person</label>
                  <select
                    value={filters.person}
                    onChange={(e) => setFilters(prev => ({ ...prev, person: e.target.value }))}
                    className="w-full px-3 py-2 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-lg bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
                  >
                    {PERSON_FILTERS.map(filter => (<option key={filter.id} value={filter.id}>{filter.label}</option>))}
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
                <span className="text-sm text-pastel-neutral-600 dark:text-pastel-neutral-400">Post anonymously</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300 mb-2">How are you feeling? (Required)</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-lg bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
              required
            >
              <option value="">Select a feeling...</option>
              {VENT_TAGS.map(tag => (<option key={tag} value={tag}>{tag}</option>))}
            </select>
          </div>

          <div className="flex gap-4 flex-col">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !ventText.trim() || !selectedTag}
              className="flex-1 bg-gradient-to-r from-pastel-blue-500 to-pastel-purple-600 hover:from-pastel-blue-600 hover:to-pastel-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-glow"
            >
              {isLoading ? 'Posting...' : `Post ${isAnonymous ? 'Anonymously' : 'with Username'}`}
            </motion.button>
            <p className="text-xs text-center text-pastel-neutral-500 dark:text-pastel-neutral-400 mt-2">
              Please keep our community safe. Profanity and hate speech are not allowed.
            </p>
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
                className="bg-white/80 dark:bg-pastel-neutral-900/80 backdrop-blur-md rounded-2xl shadow-soft border border-pastel-neutral-100 dark:border-pastel-neutral-700 p-6 relative"
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
                        <p className="font-medium text-pastel-neutral-900 dark:text-white">{vent.author}</p>

                        {/* 3-Dot Menu */}
                        {vent.authorId === user?.uid && (
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === vent.id ? null : vent.id)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                              <span className="text-xl leading-none">⋮</span>
                            </button>
                            {activeMenuId === vent.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-10 overflow-hidden">
                                <button
                                  onClick={() => handleDeletePost(vent.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => handleArchivePost(vent.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  Archive
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-pastel-neutral-500 dark:text-pastel-neutral-400">{getTimeAgo(vent.timestamp)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-block bg-pastel-blue-100 dark:bg-pastel-blue-900/30 text-pastel-blue-800 dark:text-pastel-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {vent.tag}
                  </span>
                </div>

                <p className="text-pastel-neutral-800 dark:text-pastel-neutral-200 mb-4 leading-relaxed">{vent.text}</p>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {/* Existing Reactions Chips */}
                  {Object.entries(vent.reactions || {}).map(([type, count]) => {
                    if (count <= 0) return null;
                    const reactionInfo = REACTION_TYPES.find(r => r.id === type);
                    if (!reactionInfo) return null;
                    const isUserReacted = vent.userReactions?.[user?.uid]?.includes(type);

                    return (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReaction(vent.id, type)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-sm border transition-colors ${isUserReacted
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        title={reactionInfo.label}
                      >
                        <span className="text-lg">{reactionInfo.emoji}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </motion.button>
                    );
                  })}

                  {/* Add Reaction Button */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveReactionMenuId(activeReactionMenuId === vent.id ? null : vent.id)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Add Reaction"
                    >
                      <span className="text-xl">☺+</span>
                    </motion.button>

                    {/* Reaction Picker Popover */}
                    <AnimatePresence>
                      {activeReactionMenuId === vent.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute left-0 bottom-full mb-2 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 w-72"
                        >
                          <div className="grid grid-cols-4 gap-2">
                            {REACTION_TYPES.map((type) => (
                              <button
                                key={type.id}
                                onClick={() => {
                                  handleReaction(vent.id, type.id);
                                  setActiveReactionMenuId(null);
                                }}
                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-2xl flex justify-center items-center"
                                title={type.label}
                              >
                                {type.emoji}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <CommentSection
                  ventId={vent.id}
                  comments={vent.comments}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                />

              </motion.div>
            ))}
          </AnimatePresence>

          {filteredVents.length > visibleVents && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisibleVents(prev => prev + 10)}
                className="bg-white/80 dark:bg-pastel-neutral-900/80 backdrop-blur-md rounded-xl shadow-soft border border-pastel-neutral-100 dark:border-pastel-neutral-700 px-6 py-3 text-pastel-neutral-700 dark:text-pastel-neutral-300 hover:text-pastel-blue-600 dark:hover:text-pastel-blue-400 transition-colors"
              >
                Load More Posts 📚
              </motion.button>
            </motion.div>
          )}

          {filteredVents.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
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
