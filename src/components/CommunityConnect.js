import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Star, Users, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  fetchDiscordServerDetails,
  extractInviteCode
} from '../lib/discord';
import communitiesData from '../data/communities.json';

function CommunityConnect() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);
  const [savedCommunities, setSavedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [userPreferences, setUserPreferences] = useState([]);

  // Load communities from Firestore and augment with Discord API data
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        // Fetch communities from Firestore
        const communitiesRef = collection(db, 'communities');
        const querySnapshot = await getDocs(communitiesRef);
        let firestoreCommunities = [];
        querySnapshot.forEach((doc) => {
          firestoreCommunities.push({ id: doc.id, ...doc.data() });
        });
        console.log('Firestore communities:', firestoreCommunities);

        // If Firestore is empty, use static data as fallback
        if (firestoreCommunities.length === 0) {
          firestoreCommunities = communitiesData.map(community => ({
            ...community,
            discordLink: community.link // Map 'link' to 'discordLink' for consistency
          }));
          console.log('Using static communities data:', firestoreCommunities);
        }

        // Extract invite codes from Firestore communities
        const inviteCodes = firestoreCommunities
          .map(community => extractInviteCode(community.discordLink))
          .filter(code => code !== null);
        console.log('Extracted invite codes:', inviteCodes);

        // Fetch Discord server details for all valid invite codes
        const discordPromises = inviteCodes.map(code => fetchDiscordServerDetails(code));
        const discordResults = await Promise.allSettled(discordPromises);
        console.log('Discord API results:', discordResults);

        // Create a map of invite code to Discord data
        const discordDataMap = {};
        discordResults.forEach((result, index) => {
          const inviteCode = inviteCodes[index];
          if (result.status === 'fulfilled' && result.value) {
            discordDataMap[inviteCode] = result.value;
          }
        });

        // Merge Firestore data with Discord data
        const augmentedCommunities = firestoreCommunities.map(community => {
          const inviteCode = extractInviteCode(community.discordLink);
          const discordData = inviteCode ? discordDataMap[inviteCode] : null;

          return {
            ...community,
            // Use Discord data if available, otherwise fallback to Firestore data
            name: discordData?.name || community.name,
            icon: discordData?.icon || community.icon,
            totalMembers: discordData?.totalMembers || community.memberCount,
            onlineMembers: discordData?.onlineMembers || community.onlineMembers,
            discordInviteUrl: discordData?.inviteUrl || community.discordLink,
            // Keep original Firestore data as fallback
            originalName: community.name,
            originalMemberCount: community.memberCount,
            originalOnlineMembers: community.onlineMembers,
            originalLink: community.discordLink
          };
        });
        console.log('Augmented communities:', augmentedCommunities);

        setCommunities(augmentedCommunities);
        setFilteredCommunities(augmentedCommunities);

      } catch (error) {
        console.error('Error loading communities:', error);
        // Fallback to empty array
        setCommunities([]);
        setFilteredCommunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Simulate saved communities as empty arrays (no Firestore)
  useEffect(() => {
    setSavedCommunities([]);
  }, [user]);



  // Filter communities based on search term and selected tags
  useEffect(() => {
    let filtered = activeTab === 'saved'
      ? communities.filter(community => savedCommunities.includes(community.id))
      : communities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by selected tags (multiple selection)
    if (selectedTags.length > 0 && !selectedTags.includes('All')) {
      // Enhanced tag matching: allow partial matches and case-insensitive
      filtered = filtered.filter(community =>
        selectedTags.some(selectedTag =>
          community.tags.some(communityTag =>
            communityTag.toLowerCase().includes(selectedTag.toLowerCase())
          )
        )
      );
    }

    setFilteredCommunities(filtered);
  }, [communities, searchTerm, selectedTags, activeTab, savedCommunities]);

  // Get all unique tags from communities
  const allTags = ['All', ...new Set(communities.flatMap(community => community.tags || []))];

  // Handle tag selection (single selection for category)
  const handleTagToggle = (tag) => {
    if (tag === 'All') {
      setSelectedTags([]);
    } else {
      setSelectedTags([tag]);
    }
  };



  const handleJoinCommunity = (link) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-pastel-blue-50 via-white to-pastel-purple-50 dark:from-pastel-neutral-900 dark:via-pastel-neutral-800 dark:to-pastel-neutral-900 transition-colors duration-200 overflow-hidden min-h-screen flex items-center justify-center">
        {/* Animated background waves */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-pastel-purple-200 dark:bg-pastel-purple-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 50, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-pastel-blue-200 dark:bg-pastel-blue-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          />
        </div>

        <div className="relative text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-pastel-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-pastel-neutral-600 dark:text-pastel-neutral-300 text-lg font-sans">
            Fetching communities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-pastel-blue-50 via-white to-pastel-purple-50 dark:from-pastel-neutral-900 dark:via-pastel-neutral-800 dark:to-pastel-neutral-900 transition-colors duration-200 overflow-hidden min-h-screen">
      {/* Animated background waves */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-pastel-purple-200 dark:bg-pastel-purple-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-pastel-blue-200 dark:bg-pastel-blue-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
          className="absolute top-40 left-40 w-80 h-80 bg-pastel-green-200 dark:bg-pastel-green-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center mb-16 gap-4"
      >
        {/* Logo and Title Container */}
        <div className="flex flex-col items-center gap-2">
          {/* Chillspace Logo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:ring-offset-2 rounded-lg"
            aria-label="Go to Home"
          >
            <img
              src="/logo.png"
              alt="Chillspace Logo"
              className="h-12 w-auto object-contain cursor-pointer"
            />
          </motion.button>

          {/* Page Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-pastel-neutral-800 dark:text-pastel-neutral-100 leading-tight font-sans gradient-text dark:gradient-text-dark select-none"
          >
            🌐 Community Connect
          </motion.h1>

          {/* Connect with Similar Fellows */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">Connect with Similar Fellows</h2>
            <p className="text-lg text-pastel-neutral-600 dark:text-pastel-neutral-400">
              Find and join communities that match your interests.
            </p>
          </motion.div>
        </div>
      </motion.div>



        {/* Tabs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-12"
        >
          <div className="bg-pastel-neutral-100 dark:bg-pastel-neutral-800 rounded-2xl p-1 shadow-soft">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('all')}
              className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-pastel-neutral-700 text-pastel-blue-600 dark:text-pastel-blue-400 shadow-glow'
                  : 'text-pastel-neutral-600 dark:text-pastel-neutral-400 hover:text-pastel-neutral-800 dark:hover:text-pastel-neutral-200'
              }`}
            >
              All Communities
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('saved')}
              className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'saved'
                  ? 'bg-white dark:bg-pastel-neutral-700 text-pastel-blue-600 dark:text-pastel-blue-400 shadow-glow'
                  : 'text-pastel-neutral-600 dark:text-pastel-neutral-400 hover:text-pastel-neutral-800 dark:hover:text-pastel-neutral-200'
              }`}
            >
              My Communities ({savedCommunities.length})
            </motion.button>
          </div>
        </motion.div>



        {/* Search and Filter */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12 space-y-6"
        >
          {/* Search Bar */}
          <div className="max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-2xl focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 outline-none transition-all duration-300 text-lg font-sans bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-800 dark:text-pastel-neutral-100 placeholder-pastel-neutral-500 dark:placeholder-pastel-neutral-400 shadow-soft"
            />
          </div>

          {/* Tag Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {allTags.map((tag) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  tag === 'All'
                    ? selectedTags.length === 0
                      ? 'bg-pastel-blue-500 text-white shadow-glow'
                      : 'bg-pastel-neutral-200 dark:bg-pastel-neutral-700 text-pastel-neutral-700 dark:text-pastel-neutral-300 hover:bg-pastel-neutral-300 dark:hover:bg-pastel-neutral-600'
                    : selectedTags.includes(tag)
                    ? 'bg-pastel-blue-500 text-white shadow-glow'
                    : 'bg-pastel-neutral-200 dark:bg-pastel-neutral-700 text-pastel-neutral-700 dark:text-pastel-neutral-300 hover:bg-pastel-neutral-300 dark:hover:bg-pastel-neutral-600'
                }`}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Communities Grid */}
        {filteredCommunities.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="text-center py-16"
          >
            <p className="text-pastel-neutral-600 dark:text-pastel-neutral-300 text-xl font-sans">
              {searchTerm || selectedTags.length > 0
                ? 'No communities found matching your criteria.'
                : activeTab === 'saved'
                ? 'You haven\'t saved any communities yet.'
                : 'Communities are not available right now. Please try again later.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCommunities.map((community, index) => (
              <motion.div
                key={community.id}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white dark:bg-pastel-neutral-900 rounded-xl shadow-md p-6 flex flex-col justify-between"
              >
                {/* Community Icon/Emoji */}
                <div className="text-5xl mb-4 text-center">
                  {community.icon ? (
                    <img src={community.icon} alt={community.name} className="w-16 h-16 rounded-full mx-auto" />
                  ) : (
                    '🤝'
                  )}
                </div>

                {/* Community Name */}
                <h3 className="text-xl font-semibold text-pastel-neutral-900 dark:text-pastel-neutral-100 mb-2 font-sans">
                  {community.name}
                </h3>

                {/* Description */}
                <p className="text-pastel-neutral-600 dark:text-pastel-neutral-300 mb-4 text-sm font-sans line-clamp-3">
                  {community.description}
                </p>

                {/* Member Count */}
                <div className="flex items-center gap-2 text-pastel-neutral-500 dark:text-pastel-neutral-400 text-sm mb-4">
                  <Users className="w-4 h-4" />
                  <span>{community.totalMembers || community.memberCount || 0} members ({community.onlineMembers || 0} online)</span>
                </div>

                {/* Join Button */}
                <div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleJoinCommunity(community.discordInviteUrl || community.link)}
                    className="w-full bg-pastel-blue-600 hover:bg-pastel-blue-700 dark:bg-pastel-blue-500 dark:hover:bg-pastel-blue-600 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
                  >
                    Join
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default CommunityConnect;
