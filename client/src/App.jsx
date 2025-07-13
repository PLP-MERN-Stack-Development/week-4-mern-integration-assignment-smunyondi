import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import PostList from './PostList';
import SinglePost from './components/SinglePost';
import PostForm from './components/PostForm';
import CategoryList from './components/CategoryList';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import EditPost from './components/EditPost';
import { ThemeProvider } from './context/ThemeContext';

// AdminRoute component to protect admin-only routes
function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user?.isAdmin) {
    return <div className="text-center mt-8 text-red-500">Access denied</div>;
  }
  return children;
}

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/';

  // Add dark mode support to the app container
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {!hideNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/home" element={<PostList />} />
          <Route path="/posts/:id" element={<SinglePost />} />
          <Route path="/create" element={<PostForm />} />
          <Route
            path="/categories"
            element={
              <AdminRoute>
                <CategoryList />
              </AdminRoute>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/edit/:id" element={<EditPost />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
