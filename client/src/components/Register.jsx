import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onSuccess, hideRedirect, forceLight }) => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await axios.post('/api/auth/register', form);
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
        <h2 className={`text-2xl font-bold mb-6 text-center ${forceLight ? 'text-potasq' : 'text-potasq dark:text-potasq-light'}`}>Register</h2>
        <div className="mb-4">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div className="mb-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div className="mb-6">
          <input
            name="password"
            type="password"
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
          Register
        </button>
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        {success && <div className="text-green-600 mt-4 text-center">{success}</div>}
      </form>
    </div>
  );
};

export default Register;
