# TODO: Enhance Community Connect Page with Discord API Integration

## Overview
Integrate Discord API for real-time community data, apply consistent homepage styling, and connect to user tags for personalized recommendations.

## Steps

### 1. Create Discord API Utility
- [x] Create `src/lib/discord.js` with function to fetch Discord server details using invite codes
- [x] Implement error handling for invalid invites
- [x] Use API: GET https://discord.com/api/v10/invites/{invite_code}?with_counts=true

### 2. Update CommunityConnect.js
- [x] Modify data fetching to augment Firestore communities with Discord API data
- [x] Update community cards to display dynamic data: server name, icon, online members, total members
- [x] Ensure join buttons redirect to Discord invite links
- [x] Handle API failures gracefully (fallback to static data)

### 3. Maintain UI Consistency
- [x] Verify styling matches homepage (pastel gradients, rounded corners, animations)
- [x] Ensure smooth animations and consistent fonts
- [x] Keep modular structure for easy addition of new servers

### 4. Test and Validate
- [x] Test data fetching on page load
- [x] Verify recommendations based on user tags
- [x] Check error handling for invalid invites
- [x] Ensure UI responsiveness and animations

### 5. Finalize
- [x] Review code for modularity
- [x] Confirm new servers can be added easily via Firestore
- [x] Clean up and optimize
