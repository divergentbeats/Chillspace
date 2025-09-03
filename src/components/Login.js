import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginStarfield from './LoginStarfield';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const { login, signInWithGoogle, isLoading } = useAuth();
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
    <div className="container relative min-h-screen flex items-center justify-center transition-colors duration-200 px-4 sm:px-6 lg:px-8">
      <LoginStarfield />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 z-10 relative bg-white/20 dark:bg-gray-900/40 rounded-xl backdrop-blur-md p-8 shadow-lg"
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
            <div className="relative">
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
                className={`mt-1 block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-pastel-neutral-400 focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-colors ${
                  errors.email
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-pastel-neutral-300 dark:border-pastel-neutral-600'
                } bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white`}
                placeholder="Enter your email"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="h-5 w-5 text-pastel-neutral-400 dark:text-pastel-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.94 6.94a2 2 0 012.83 0L10 11.17l4.23-4.23a2 2 0 112.83 2.83l-6 6a2 2 0 01-2.83 0l-6-6a2 2 0 010-2.83z" />
                </svg>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="relative">
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
                className={`mt-1 block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-pastel-neutral-400 focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-colors ${
                  errors.password
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-pastel-neutral-300 dark:border-pastel-neutral-600'
                } bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white`}
                placeholder="Enter your password"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="h-5 w-5 text-pastel-neutral-400 dark:text-pastel-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 8a3 3 0 116 0v1h1a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3a2 2 0 012-2h1V8zm3-2a2 2 0 00-2 2v1h4V8a2 2 0 00-2-2z" clipRule="evenodd" />
                </svg>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-pastel-neutral-700 dark:text-pastel-neutral-300">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-pastel-blue-500 rounded" />
              <span className="ml-2">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-pastel-blue-600 hover:text-pastel-blue-700 dark:text-pastel-blue-400 dark:hover:text-pastel-blue-300">
              Forgot password?
            </Link>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-pastel-neutral-900 bg-white hover:bg-pastel-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pastel-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glow"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-pastel-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                <path fill="#4285F4" d="M23.64 12.204c0-.639-.057-1.252-.162-1.837H12v3.481h6.844a5.862 5.862 0 01-2.54 3.846v3.197h4.107c2.4-2.213 3.778-5.462 3.778-9.687z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.963-1.073 7.951-2.91l-4.107-3.197c-1.14.766-2.6 1.22-3.844 1.22-2.956 0-5.462-1.995-6.356-4.677H1.44v2.94A11.998 11.998 0 0012 24z"/>
                <path fill="#FBBC05" d="M5.644 14.436a7.18 7.18 0 010-4.872V6.624H1.44a11.998 11.998 0 000 10.752l4.204-2.94z"/>
                <path fill="#EA4335" d="M12 4.77c1.76 0 3.344.606 4.59 1.796l3.44-3.44C17.96 1.367 15.24 0 12 0 7.2 0 3.12 2.88 1.44 6.624l4.204 3.02C6.538 6.765 9.012 4.77 12 4.77z"/>
              </svg>
              Sign in with Google
            </motion.button>
          </div>

          <div className="text-center text-sm text-pastel-neutral-600 dark:text-pastel-neutral-400">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="underline hover:text-pastel-blue-500 focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 rounded"
            >
              Continue as Guest
            </button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default Login;
