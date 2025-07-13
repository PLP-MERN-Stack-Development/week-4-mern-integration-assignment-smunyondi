import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

export default function Dashboard() {
  const [authMode, setAuthMode] = useState('login');
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white shadow-xl rounded-xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        {/* Welcome Section */}
        <div
          className="md:w-1/2 p-8 flex flex-col justify-center"
          style={{ background: 'linear-gradient(135deg, #FF6A3D 0%, #FFB199 100%)' }}
        >
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to PoTaSQ Blogs!</h1>
          <p className="text-white mb-6">
            Share your thoughts, read amazing posts, and join our community.<br />
            Please log in or register to get started.
          </p>
          <img
            src="/android-chrome-192x192.png"
            alt="Welcome"
            className="w-56 h-56 mx-auto"
            style={{ objectFit: 'cover' }}
          />
        </div>
        {/* Auth Section */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <div className="flex justify-center mb-6 gap-4">
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow transition 
                ${authMode === 'login'
                  ? 'bg-potasq text-white ring-2 ring-potasq-dark scale-105'
                  : 'bg-potasq-light text-potasq hover:bg-potasq/30 hover:scale-105'}`}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow transition 
                ${authMode === 'register'
                  ? 'bg-potasq text-white ring-2 ring-potasq-dark scale-105'
                  : 'bg-potasq-light text-potasq hover:bg-potasq/30 hover:scale-105'}`}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md mx-auto">
            {authMode === 'login' ? (
              <Login onSuccess={handleLoginSuccess} hideRedirect forceLight />
            ) : (
              <Register onSuccess={() => setAuthMode('login')} hideRedirect forceLight />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}