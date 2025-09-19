import React from 'react';
import { Github, Twitter, Instagram, Linkedin, Mail, Heart } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/divergentbeats/Chillspace',
      color: 'hover:text-gray-700 dark:hover:text-gray-300'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://twitter.com',
      color: 'hover:text-blue-500 dark:hover:text-blue-400'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com',
      color: 'hover:text-pink-500 dark:hover:text-pink-400'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com',
      color: 'hover:text-blue-600 dark:hover:text-blue-400'
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:hello@chillspace.com',
      color: 'hover:text-indigo-500 dark:hover:text-indigo-400'
    }
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Logo and Tagline */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 font-sans">
              Chillspace
            </h3>
            <p className="text-gray-600 dark:text-gray-300 font-sans">
              Your calm corner for quotes, focus, and positivity
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-8">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-500 dark:text-gray-400 transition-all duration-300 transform hover:scale-110 ${social.color}`}
                  aria-label={social.name}
                >
                  <IconComponent className="w-6 h-6" />
                </a>
              );
            })}
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
              About
            </button>
            <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
              Privacy Policy
            </button>
            <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
              Terms of Service
            </button>
            <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
              Contact
            </button>
          </div>

          {/* Newsletter Subscription */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Subscribe to our Newsletter</h4>
            <form className="flex justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-800 dark:text-gray-100"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-r-lg transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-sans">
              © {currentYear} Chillspace. Made with{' '}
              <Heart className="inline w-4 h-4 text-red-500 animate-pulse" />{' '}
              for mental wellness
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 font-sans">
              Open source on{' '}
              <a
                href="https://github.com/divergentbeats/Chillspace"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
