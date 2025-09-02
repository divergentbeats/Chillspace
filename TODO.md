# Firebase Authentication Integration TODO

## Completed Tasks
- [x] Update AuthContext.js to use Firebase Authentication instead of localStorage

## Pending Tasks
- [ ] Update Login component to handle Firebase auth errors
- [ ] Update Signup component to handle Firebase auth errors
- [ ] Test authentication flow with Firebase
- [ ] Update Navbar.js if needed for Firebase auth state

## Login Flow Enhancement Tasks
- [x] Add Google sign-in and guest login buttons to Login.js
- [x] Change login redirect to /preferences instead of home
- [x] Create Preferences.jsx component with multi-step modal wizard
- [x] Add /preferences route to App.js
- [x] Implement Firebase Firestore persistence for authenticated users and localStorage for guests
- [ ] Test complete login -> preferences -> home flow
