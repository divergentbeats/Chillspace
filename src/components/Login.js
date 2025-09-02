import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoginStarfield from './LoginStarfield';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const { login, signInWithGoogle, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/preferences');
    } else {
      // Map Firebase auth errors to user-friendly messages
      let errorMessage = result.error;
      if (result.error.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email address.';
      } else if (result.error.includes('auth/wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (result.error.includes('auth/invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (result.error.includes('auth/user-disabled')) {
        errorMessage = 'This account has been disabled.';
      } else if (result.error.includes('auth/too-many-requests')) {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      setErrors({ general: errorMessage });
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      navigate('/preferences');
    } else {
      setErrors({ general: 'Failed to sign in with Google. Please try again.' });
    }
  };

  const handleGuestLogin = () => {
    // For guest, just navigate to preferences without authentication
    navigate('/preferences');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center transition-colors duration-200 bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10">
        <LoginStarfield />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 z-10 relative"
      >
        <div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto h-16 w-16 bg-gradient-to-br from-pastel-blue-500 to-pastel-purple-600 rounded-2xl flex items-center justify-center shadow-glow"
          >
            <span className="text-white font-bold text-2xl">C</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-center text-3xl font-extrabold text-pastel-neutral-900 dark:text-white"
          >
            Welcome back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-2 text-center text-sm text-pastel-neutral-600 dark:text-pastel-neutral-400"
          >
            Sign in to your Chillspace account
          </motion.p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
            >
              {errors.general}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-pastel-neutral-400 focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-colors ${
                  errors.email
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-pastel-neutral-300 dark:border-pastel-neutral-600'
                } bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-pastel-neutral-400 focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-colors ${
                  errors.password
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-pastel-neutral-300 dark:border-pastel-neutral-600'
                } bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-pastel-blue-500 to-pastel-purple-600 hover:from-pastel-blue-600 hover:to-pastel-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pastel-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glow"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pastel-neutral-300 dark:border-pastel-neutral-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-pastel-neutral-500 dark:text-pastel-neutral-400">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-lg shadow-sm bg-white dark:bg-pastel-neutral-800 text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300 hover:bg-pastel-neutral-50 dark:hover:bg-pastel-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pastel-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-pastel-neutral-300 dark:border-pastel-neutral-600 rounded-lg shadow-sm bg-pastel-neutral-50 dark:bg-pastel-neutral-700 text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300 hover:bg-pastel-neutral-100 dark:hover:bg-pastel-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pastel-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Continue as Guest
            </motion.button>
          </div>

          <div className="text-center">
            <p className="text-sm text-pastel-neutral-600 dark:text-pastel-neutral-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-pastel-blue-600 hover:text-pastel-blue-500 dark:text-pastel-blue-400 dark:hover:text-pastel-blue-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default Login;
