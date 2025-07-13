import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = ({ onSuccess, hideRedirect, forceLight }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await authService.login(form);
      setUser(JSON.parse(localStorage.getItem('user')));
      if (onSuccess) {
        onSuccess();
      } else if (!hideRedirect) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  // Helper for input classes
  const inputClass = forceLight
    ? 'w-full border border-potasq rounded p-2 focus:outline-potasq bg-white text-gray-900'
    : 'w-full border border-potasq rounded p-2 focus:outline-potasq bg-white dark:bg-gray-900 dark:text-gray-100';

  return (
    <div className={`flex items-center justify-center min-h-[70vh] ${forceLight ? 'bg-white' : 'bg-white dark:bg-gray-900'} transition-colors duration-300`}>
      <form
        onSubmit={handleSubmit}
        className={`shadow-lg rounded-xl p-8 w-full max-w-md ${forceLight ? 'bg-white' : 'bg-white dark:bg-gray-800'}`}
      >
        <h2 className={`text-2xl font-bold mb-6 text-center ${forceLight ? 'text-potasq' : 'text-potasq dark:text-potasq-light'}`}>Login</h2>
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-potasq text-white py-2 rounded hover:bg-potasq-dark transition font-semibold"
        >
          Login
        </button>
        {error && (
          <div className="text-red-500 mt-4 text-center">{error}</div>
        )}
      </form>
    </div>
  );
};

export default Login;
