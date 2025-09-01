import React from 'react';

function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                Dashboard
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                Wellness
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                Productivity
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                Resources
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                Profile
              </a>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-700 p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
