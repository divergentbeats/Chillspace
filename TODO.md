# Testing Plan TODO

## 1. Login Page Testing
- [ ] Verify UI elements: email input, password input, login button, Google sign-in button, guest login button, theme toggle.
- [ ] Validate form input errors for empty fields, invalid email format.
- [ ] Test login with valid credentials: successful navigation to home page.
- [ ] Test login with invalid credentials: appropriate error messages for user-not-found, wrong-password, invalid-email, user-disabled, too-many-requests.
- [ ] Test Google sign-in success and failure flows.
- [ ] Test guest login navigation to home page.
- [ ] Test loading states during login and Google sign-in.
- [ ] Test theme toggle button functionality.
- [ ] Accessibility checks for labels, aria attributes.
- [ ] Visual and responsiveness checks for backgrounds and starfield.

## 2. Authentication Context Testing
- [ ] Test login, signup, logout, signInWithGoogle methods for success and failure.
- [ ] Test user state updates on auth state changes.
- [ ] Test isLoading state during async operations.

## 3. Post-login Flows
- [ ] Verify navigation to home page after login.
- [ ] Test key components like Signup, MoodAnalyzer, HabitTracker, etc. for basic rendering and functionality.

## 4. Edge Cases and Error Handling
- [ ] Rapid clicks on buttons.
- [ ] Network failures or Firebase errors.
- [ ] Invalid tokens or expired sessions.
