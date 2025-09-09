# TODO List

## Completed Tasks
- [x] Connect "Start Venting" button in FeatureGrid to VentingVenue component
  - Updated FeatureGrid.js to import useNavigate from react-router-dom
  - Added navigation logic to redirect to '/vent' when featureId === 1
  - Route '/vent' already exists in App.js rendering VentingVenue
- [x] Fix login page sizing issues
  - Updated Login.css to change container from fixed to relative positioning
  - Optimized background animation to reduce lag by simplifying gradients and reducing duration
  - Replaced heavy background with lightweight LoginBackground component
- [x] Fix preferences page background to match login page
  - Added import for LoginBackground component in Preferences.jsx
  - Now uses the same animated pastel blurred circles background as login page
  - Added the same gradient background as login page for consistency

## Pending Tasks
- [ ] Test the navigation by running the app and clicking the "Start Venting" button
- [ ] Implement navigation for other features (ids 2-6) if needed
