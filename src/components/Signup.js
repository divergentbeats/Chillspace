import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const { signup, isLoading } = useAuth();
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await signup(formData.email, formData.password, formData.confirmPassword);

    if (result.success) {
      navigate('/');
    } else {
      // Map Firebase auth errors to user-friendly messages
      let errorMessage = result.error;
      if (result.error.includes('auth/email-already-in-use')) {
        errorMessage = 'An account with this email already exists.';
      } else if (result.error.includes('auth/invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (result.error.includes('auth/weak-password')) {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (result.error.includes('auth/operation-not-allowed')) {
        errorMessage = 'Email/password accounts are not enabled.';
      }
      setErrors({ general: errorMessage });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
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
            Create your account
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-2 text-center text-sm text-pastel-neutral-600 dark:text-pastel-neutral-400"
          >
            Join Chillspace and start your productivity journey
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-pastel-neutral-400 focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-colors ${
                  errors.password
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-pastel-neutral-300 dark:border-pastel-neutral-600'
                } bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white`}
                placeholder="Create a password (min 6 characters)"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-pastel-neutral-700 dark:text-pastel-neutral-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-pastel-neutral-400 focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-colors ${
                  errors.confirmPassword
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-pastel-neutral-300 dark:border-pastel-neutral-600'
                } bg-white dark:bg-pastel-neutral-800 text-pastel-neutral-900 dark:text-white`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
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
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </motion.button>
          </div>

          <div className="text-center">
            <p className="text-sm text-pastel-neutral-600 dark:text-pastel-neutral-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-pastel-blue-600 hover:text-pastel-blue-500 dark:text-pastel-blue-400 dark:hover:text-pastel-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default Signup;
