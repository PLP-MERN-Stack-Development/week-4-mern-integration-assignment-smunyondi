import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow mb-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-6">
        <Link to="/home" className="text-2xl font-bold text-potasq mb-2 md:mb-0">PoTaSQ Blogs</Link>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/home" className="text-potasq hover:text-potasq-dark transition">Home</Link>
          <Link to="/create" className="text-potasq hover:text-potasq-dark transition">Create Post</Link>
          {/* Only show Categories link if user is admin */}
          {user?.isAdmin && (
            <Link to="/categories" className="text-potasq hover:text-potasq-dark transition">Categories</Link>
          )}
          {user ? (
            <>
              <span className="text-gray-600 font-medium">Welcome, {user.username}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="text-potasq hover:text-potasq-dark transition">Register</Link>
              <Link to="/login" className="text-potasq hover:text-potasq-dark transition">Login</Link>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="ml-4 relative w-20 h-8 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition focus:outline-none focus:ring-2 focus:ring-potasq"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {/* Labels */}
            <span className={`absolute left-3 text-xs font-semibold transition-colors duration-200 ${theme === 'light' ? 'text-potasq' : 'text-gray-400'}`}>
              Light
            </span>
            <span className={`absolute right-3 text-xs font-semibold transition-colors duration-200 ${theme === 'dark' ? 'text-black dark:text-white' : 'text-gray-400'}`}>
              Dark
            </span>
            {/* Knob */}
            <span
              className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300
                ${theme === 'dark' ? 'translate-x-10' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>
    </nav>
  );
}
